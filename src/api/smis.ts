import { keysToSnake, rpc } from './supabase'
import type {
  Equipment, EquipmentOverview, HazardDetail, HazardInspectionTask, HazardInspectionTaskDetail,
  HazardOverview, HazardRecord, InspectionTaskItem, ReportingOptions, RiskTask, RiskTaskDetail,
  ShiftCalendar, TaskOverview, TaskStatus
} from './types'

interface ListResult<T, O> { records?: T[]; total?: number; overview?: O }

export async function getReportingOptions(token: string) {
  const data = await rpc<ReportingOptions>(token, 'smis_get_hazard_reporting_options_secure')
  return { profile: data?.profile || null, organizations: data?.organizations || [], sites: data?.sites || [] }
}

export function getShiftCalendar(token: string, employeeId: string, month: string) {
  return rpc<ShiftCalendar>(token, 'smis_get_employee_shift_calendar_secure', { p_employee_id: employeeId, p_month: `${month}-01` })
}

export async function listEquipment(token: string, params: { keyword?: string; from?: number; to?: number } = {}) {
  const from = Math.max(params.from || 0, 0)
  const result = await rpc<ListResult<Equipment, EquipmentOverview>>(token, 'smis_list_equipment_ledger_secure', {
    p_from: from, p_to: Math.max(params.to ?? from + 19, from), p_keyword: params.keyword?.trim() || null,
    p_category_id: null, p_location_id: null, p_equipment_kind: null, p_model: null,
    p_operation_status: null, p_supplier_id: null, p_importance_level: null,
    p_enable_date_from: null, p_enable_date_to: null, p_asset_status: null, p_use_status: null
  })
  return { records: result?.records || [], total: result?.total || 0, overview: result?.overview || { total: 0, inUse: 0, boilerCount: 0, dueSoon: 0 } }
}

export function getEquipment(token: string, id: string) {
  return rpc<Equipment | null>(token, 'smis_get_equipment_archive_secure', { p_equipment_id: id })
}

export async function listRiskTasks(token: string, params: { status?: TaskStatus; keyword?: string; from?: number; to?: number } = {}) {
  const from = Math.max(params.from || 0, 0)
  const result = await rpc<ListResult<RiskTask, TaskOverview>>(token, 'smis_list_risk_inspection_tasks_secure', {
    p_from: from, p_to: Math.max(params.to ?? from + 19, from), p_keyword: params.keyword?.trim() || null,
    p_risk_name: null, p_risk_type: null, p_planned_from: null, p_planned_to: null,
    p_responsible_employee_id: null, p_status: params.status || null, p_executor_keyword: null
  })
  return { records: result?.records || [], total: result?.total || 0, overview: result?.overview || emptyTaskOverview() }
}

export function getRiskTask(token: string, id: string) {
  return rpc<RiskTaskDetail | null>(token, 'smis_get_risk_inspection_task_secure', { p_id: id })
}

export function saveRiskExecution(token: string, payload: { id: string; actualExecutorEmployeeId: string; executionSummary?: string; attachmentUrls: string[]; items: InspectionTaskItem[]; complete: boolean }) {
  return rpc(token, 'smis_save_risk_inspection_execution_secure', {
    p_id: payload.id, p_actual_executor_employee_id: payload.actualExecutorEmployeeId,
    p_execution_summary: payload.executionSummary?.trim() || null, p_attachment_urls: payload.attachmentUrls,
    p_items: keysToSnake(payload.items.map(({ id, result, remark, attachmentUrls }) => ({ id, result, remark, attachmentUrls }))), p_complete: payload.complete
  })
}

export async function listHazardInspectionTasks(token: string, params: { status?: TaskStatus; keyword?: string; from?: number; to?: number } = {}) {
  const from = Math.max(params.from || 0, 0)
  const result = await rpc<ListResult<HazardInspectionTask, TaskOverview>>(token, 'smis_list_hidden_hazard_inspection_tasks_secure', {
    p_from: from, p_to: Math.max(params.to ?? from + 19, from), p_task_no: params.keyword?.trim() || null,
    p_inspection_object: null, p_planned_from: null, p_planned_to: null, p_status: params.status || null,
    p_executor_keyword: null, p_source_plan_no: null
  })
  return { records: result?.records || [], total: result?.total || 0, overview: result?.overview || emptyTaskOverview() }
}

export function getHazardInspectionTask(token: string, id: string) {
  return rpc<HazardInspectionTaskDetail | null>(token, 'smis_get_hidden_hazard_inspection_task_secure', { p_id: id })
}

export function saveHazardInspectionExecution(token: string, payload: { id: string; executionSummary?: string; attachmentUrls: string[]; items: InspectionTaskItem[]; complete: boolean }) {
  return rpc(token, 'smis_save_hidden_hazard_inspection_execution_secure', {
    p_id: payload.id, p_payload: keysToSnake({ executionSummary: payload.executionSummary?.trim() || null, attachmentUrls: payload.attachmentUrls }),
    p_items: keysToSnake(payload.items.map(({ id, result, remark, attachmentUrls }) => ({ id, result, remark, attachmentUrls }))), p_complete: payload.complete
  })
}

export async function listHazards(token: string, params: { status?: string; keyword?: string; from?: number; to?: number } = {}) {
  const from = Math.max(params.from || 0, 0)
  const result = await rpc<ListResult<HazardRecord, HazardOverview>>(token, 'smis_list_hidden_hazard_governance_secure', {
    p_from: from, p_to: Math.max(params.to ?? from + 19, from), p_hazard_no: params.keyword?.trim() || null,
    p_reported_from: null, p_reported_to: null, p_status: params.status || null,
    p_rectifier_keyword: null, p_reporter_keyword: null, p_inspection_type_id: null
  })
  return { records: result?.records || [], total: result?.total || 0, overview: result?.overview || emptyHazardOverview() }
}

export function getHazard(token: string, id: string) {
  return rpc<HazardDetail | null>(token, 'smis_get_hidden_hazard_governance_secure', { p_id: id })
}

export function submitQuickReport(token: string, payload: {
  description: string; hazardOrganizationId: string; siteId: string; location: string;
  hazardLevel: string; imageUrls: string[]; rectificationSuggestion?: string
}) {
  return rpc<{ id: string; hazardNo: string }>(token, 'smis_submit_hazard_source_report_secure', {
    p_source_type: 'quick_report', p_payload: keysToSnake(payload)
  })
}

export function submitHazardRectification(token: string, id: string, payload: { completedAt: string; description: string; imageUrls: string[] }) {
  return rpc(token, 'smis_rectify_hidden_hazard_governance_secure', { p_id: id, p_payload: keysToSnake(payload) })
}

export function submitHazardAcceptance(token: string, id: string, payload: { result: 'passed'|'rejected'; description: string; imageUrls: string[] }) {
  return rpc(token, 'smis_accept_hidden_hazard_governance_secure', { p_id: id, p_payload: keysToSnake(payload) })
}

function emptyTaskOverview(): TaskOverview { return { total: 0, notStarted: 0, inProgress: 0, overdue: 0, completed: 0, cancelled: 0 } }
function emptyHazardOverview(): HazardOverview { return { total: 0, pendingApproval: 0, rectifying: 0, pendingAcceptance: 0, completed: 0, closed: 0 } }

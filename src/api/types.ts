export interface AuthUser {
  id: string
  email?: string
  phone?: string
  user_metadata?: Record<string, unknown>
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_in?: number
  expires_at?: number
  token_type?: string
  user: AuthUser
}

export type TaskStatus = 'not_started' | 'in_progress' | 'overdue' | 'completed' | 'cancelled'
export type InspectionResult = 'pending' | 'normal' | 'abnormal'
export type HazardStatus = 'pending_approval' | 'rectifying' | 'pending_acceptance' | 'completed' | 'closed'

export interface TaskOverview {
  total: number
  notStarted: number
  inProgress: number
  overdue: number
  completed: number
  cancelled?: number
}

export interface RiskTask {
  id: string
  taskNo: string
  riskPointName: string
  riskPointNo: string
  riskPointType: string
  riskLevelCode: string
  riskLevelName: string
  riskLevelColor: string
  controlLevel: string
  responsibleEmployeeId: string
  responsibleEmployeeName: string
  assigneeEmployeeId: string
  assigneeEmployeeName: string
  actualExecutorEmployeeId?: string | null
  actualExecutorEmployeeName?: string | null
  plannedStartAt: string
  plannedEndAt: string
  actualStartAt?: string | null
  completedAt?: string | null
  status: TaskStatus
  executionSummary?: string | null
  itemCount: number
  completedItemCount: number
  abnormalCount: number
}

export interface InspectionTaskItem {
  id: string
  inspectionContent: string
  result: InspectionResult
  remark?: string | null
  attachmentUrls: string[]
  sort: number
  standardCode?: string
  standardName?: string
  itemCode?: string
  hazardNo?: string | null
}

export interface TaskEvent {
  id: string
  eventType: 'generated' | 'transferred' | 'progress_saved' | 'completed' | 'cancelled'
  eventContent?: string | null
  operatorName?: string | null
  eventAt: string
}

export interface RiskTaskDetail extends RiskTask {
  cancelledAt?: string | null
  transferReason?: string | null
  cancellationReason?: string | null
  attachmentUrls: string[]
  items: InspectionTaskItem[]
  events: TaskEvent[]
}

export interface HazardInspectionTask {
  id: string
  sourcePlanId: string
  sourcePlanNo: string
  sourcePlanName: string
  taskNo: string
  inspectionObject: string
  inspectionTypeName: string
  status: TaskStatus
  executorEmployeeId: string
  executorEmployeeName: string
  plannedStartAt: string
  plannedEndAt: string
  inspectionDescription?: string | null
  itemCount: number
  normalCount: number
  abnormalCount: number
}

export interface HazardInspectionTaskDetail extends HazardInspectionTask {
  inspectionOrganizationName: string
  inspectedOrganizationName: string
  actualStartAt?: string | null
  completedAt?: string | null
  cancelledAt?: string | null
  executionSummary?: string | null
  attachmentUrls: string[]
  transferReason?: string | null
  cancellationReason?: string | null
  items: InspectionTaskItem[]
  events: TaskEvent[]
}

export interface HazardOverview {
  total: number
  pendingApproval: number
  rectifying: number
  pendingAcceptance: number
  completed: number
  closed: number
}

export interface HazardRecord {
  id: string
  hazardNo: string
  inspectionTypeName?: string | null
  sourceType: string
  description: string
  siteId?: string | null
  location: string
  hazardLevel: string
  status: HazardStatus
  reporterEmployeeName: string
  reportedAt: string
  imageUrls: string[]
  rectificationSuggestion?: string | null
  rectificationDeadline?: string | null
  rectificationMeasures?: string | null
  rectificationResponsibleEmployeeName?: string | null
  rectificationResponsibleEmployeeId?: string | null
  rectificationCompletedAt?: string | null
  acceptorEmployeeName?: string | null
  acceptedAt?: string | null
}

export interface HazardEvent {
  id: string
  eventType: string
  eventTitle: string
  eventContent?: string | null
  operatorEmployeeName?: string | null
  evidenceUrls: string[]
  eventAt: string
}

export interface HazardDetail extends HazardRecord {
  approverEmployeeName?: string | null
  approvedAt?: string | null
  approvalResult?: 'rectify' | 'close' | null
  approvalDescription?: string | null
  rectificationDescription?: string | null
  rectificationImageUrls: string[]
  acceptanceDescription?: string | null
  acceptanceImageUrls: string[]
  closeReason?: string | null
  events: HazardEvent[]
}

export interface HazardReporterProfile {
  employeeId?: string | null
  employeeNo: string
  employeeName: string
  idCardNo: string
  phone: string
  organizationId?: string | null
  organizationName?: string | null
  isEmployeeLinked: boolean
}

export interface ReportingOrganization {
  id: string
  parentId?: string | null
  organizationCode: string
  organizationName: string
  organizationType: string
  sort: number
  children?: ReportingOrganization[]
}

export interface ReportingSite {
  id: string
  parentId?: string | null
  organizationId: string
  siteName: string
  categoryCode: string
  addressDetail?: string | null
  sort: number
  children?: ReportingSite[]
}

export interface ReportingOptions {
  profile?: HazardReporterProfile | null
  organizations: ReportingOrganization[]
  sites: ReportingSite[]
}

export interface Equipment {
  id: string
  equipmentCode: string
  equipmentName: string
  equipmentKind: string
  specification?: string | null
  model?: string | null
  manufacturer?: string | null
  factoryNo?: string | null
  registrationCode?: string | null
  detailLocation?: string | null
  nameplateUrl?: string | null
  photoUrl?: string | null
  enableDate?: string | null
  useStatus: string
  operationStatus: string
  assetStatus: string
  importanceLevel: string
  isMajorHazardSource: boolean
  isSpecialEquipment: boolean
  status: string
  category?: { categoryName?: string }
  location?: { locationName?: string; detailLocation?: string | null } | null
  usingOrganization?: { organizationName?: string }
  managingOrganization?: { organizationName?: string }
  responsible?: { employeeName?: string } | null
  supplier?: { supplierName?: string } | null
  attachmentCount: number
  inspectionCount: number
  nextInspectionDueDate?: string | null
  createTime?: string
}

export interface EquipmentOverview { total: number; inUse: number; boilerCount: number; dueSoon: number }

export interface ShiftAssignment {
  id: string
  workDate: string
  assignmentStatus: 'scheduled' | 'worked' | 'leave' | 'cancelled'
  shiftCode: string
  shiftName: string
  shiftType: string
  startTime: string
  endTime: string
  crossDay: boolean
  remark?: string | null
}

export interface ShiftCalendar {
  employeeId: string
  employeeName: string
  month: string
  assignments: ShiftAssignment[]
}

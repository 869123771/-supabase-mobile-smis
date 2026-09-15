<div align="center">
  <h1>Art Supabase SMIS 移动端</h1>
  <p><strong>与 Art Supabase Pro 实时协同的 H5 / 微信小程序安全生产现场作业端</strong></p>
  <p>面向一线人员，覆盖风险巡查、隐患排查、随手拍、整改验收、设备台账与个人排班。</p>

  <p>
    <a href="https://gitee.com/wangyanghub/supabase-mobile-smis">Gitee</a>
    ·
    <a href="https://gitee.com/wangyanghub/art-supabase-pro">主平台</a>
    ·
    <a href="https://gitee.com/wangyanghub/supabase-mobile-tms-driver">司机端</a>
    ·
    <a href="./README.en.md">English</a>
  </p>
</div>

## 项目定位

Art Supabase SMIS 移动端是 `art-supabase-pro` 中 SMIS（安全生产管理）模块的一线移动工作台，基于 uni-app、Vue 3、TypeScript、Pinia、Wot Design Uni 与 Supabase 构建，同时支持 H5 和微信小程序。

移动端不独立维护另一套安全生产数据。它与 Web 管理端共用账号、员工档案、组织权限、系统字典和业务状态，通过受控服务端 RPC 读取当前人员可见的任务，并将巡查结果、现场照片、整改证据与验收结论同步回同一条安全闭环。

## 核心能力

| 场景 | 已覆盖能力 |
| --- | --- |
| 身份与工作台 | 手机号 / 邮箱密码登录、账号状态校验、员工档案、安全指标、优先待办与安全消息 |
| 风险管控 | 风险巡查任务、状态筛选、任务详情、逐项检查、异常说明、保存进度与完成提交 |
| 隐患排查 | 隐患排查任务、检查标准、正常 / 异常判定、过程记录与执行结果提交 |
| 随手拍 | 组织与区域选择、隐患等级、具体位置、问题描述、整改建议和现场照片上报 |
| 隐患治理 | 隐患台账、详情、闭环轨迹、整改证据、验收通过与退回整改 |
| 设备与排班 | 设备台账、设备档案、运行状态、检验提醒、个人月历、班次与跨日安排 |
| 个人中心 | 所属组织、联系电话、排班入口、消息入口、权限说明与安全退出 |

## 安全闭环

```text
登录并识别员工身份
  → 查看优先任务与安全提醒
  → 执行风险巡查或隐患排查
  → 发现问题并通过随手拍上报
  → 整改责任人提交措施与现场证据
  → 验收人员通过或退回整改
  → 全流程状态与操作轨迹留痕
```

现场网络、定位或照片上传异常不会替代人工判断。页面会保留明确的重试和补录入口，最终业务状态以服务端权限、状态机和审核结果为准。

## 快速开始

建议使用 Node.js 22 与 pnpm。

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev:h5
```

在 `.env.local` 中配置 Supabase 公共连接信息：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-publishable-or-anon-key
```

微信小程序开发与生产构建：

```powershell
pnpm dev:mp-weixin
pnpm typecheck
pnpm build:h5
pnpm build:mp-weixin
```

H5 生产文件输出到 `docs/`，可直接用于静态站点发布。微信小程序产物输出到 `dist/build/mp-weixin/`，还需在开发者工具和平台后台配置 AppID、合法域名、相机与相册权限。

## 数据与安全边界

- 前端只使用 Supabase `anon` / publishable key，禁止写入 `service_role` 或其他服务端密钥。
- 登录与 Web 端共用账号体系；邮箱登录先校验账号状态，手机号登录通过受控 Edge Function 完成。
- 风险巡查、隐患排查、随手拍、整改和验收均由服务端重新校验用户、员工、租户、权限与业务状态。
- `sys_dict_type` 与 `sys_dictionary` 由 Web 端统一维护，移动端仅消费字典并展示业务标签。
- 现场照片上传至 `attachments` Storage bucket，属于业务证据，应遵循最小权限和审计要求。

## 关联项目

- [`art-supabase-pro`](https://gitee.com/wangyanghub/art-supabase-pro)：统一认证、租户、权限、字典及 SMIS Web 管理端。
- [`supabase-mobile-tms-driver`](https://gitee.com/wangyanghub/supabase-mobile-tms-driver)：同技术栈的 TMS 司机移动执行端。

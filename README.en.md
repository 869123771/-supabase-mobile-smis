<div align="center">
  <h1>Art Supabase SMIS Mobile</h1>
  <p><strong>An H5 and WeChat Mini Program for frontline safety work, connected to Art Supabase Pro</strong></p>
  <p>Risk inspections, hazard reporting, rectification and acceptance, equipment records, and personal shifts in one mobile workspace.</p>

  <p>
    <a href="https://gitee.com/wangyanghub/supabase-mobile-smis">Gitee</a> ·
    <a href="https://gitee.com/wangyanghub/art-supabase-pro">Main Platform</a> ·
    <a href="https://gitee.com/wangyanghub/supabase-mobile-tms-driver">Driver App</a> ·
    <a href="./README.md">简体中文</a>
  </p>
</div>

## Overview

Art Supabase SMIS Mobile is the frontline client for the SMIS safety-management module in `art-supabase-pro`. It is built with uni-app, Vue 3, TypeScript, Pinia, Wot Design Uni, and Supabase, and targets both H5 and WeChat Mini Programs.

The mobile application does not maintain a separate safety dataset. It shares accounts, employee profiles, organization permissions, dictionaries, and workflow states with the Web application. Secure server-side RPCs provide each employee's authorized tasks and synchronize inspection results, photos, rectification evidence, and acceptance decisions into the same audit trail.

## Capabilities

- Phone or email password login, account-status validation, employee profile, safety metrics, prioritized tasks, and safety messages.
- Risk-inspection and hidden-hazard inspection tasks with filters, item-by-item results, abnormal notes, draft saving, and completion.
- Quick hazard reporting with organization, site, level, exact location, description, recommendation, and field photos.
- Hazard ledger, detail view, lifecycle timeline, rectification evidence, acceptance, and rejection for further work.
- Equipment ledger and details, operating status, inspection reminders, personal shift calendar, and cross-day shifts.

## Local Development

Node.js 22 and pnpm are recommended.

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev:h5
```

Configure the public Supabase URL and publishable/anon key in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-publishable-or-anon-key
```

Run checks and production builds with:

```powershell
pnpm dev:mp-weixin
pnpm typecheck
pnpm build:h5
pnpm build:mp-weixin
```

The H5 build is written to `docs/`. The WeChat Mini Program build is written to `dist/build/mp-weixin/` and still requires the correct AppID, allowed domains, and camera/photo-library permissions.

## Security

The client only uses a Supabase `anon` or publishable key and never contains a `service_role` secret. Server-side contracts validate the user, employee, tenant, permission, and workflow state for every business mutation. Dictionaries remain owned by the Web application, while uploaded field photos are governed as auditable business evidence.

## Related Projects

- [`art-supabase-pro`](https://gitee.com/wangyanghub/art-supabase-pro): authentication, tenancy, permissions, dictionaries, and the SMIS Web application.
- [`supabase-mobile-tms-driver`](https://gitee.com/wangyanghub/supabase-mobile-tms-driver): the TMS driver client built with the same mobile stack.

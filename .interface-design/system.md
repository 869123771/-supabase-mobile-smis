# SMIS Mobile Interface System

## Product direction

SMIS is a field-safety operations workspace, not a generic admin dashboard. The interface should feel calm, dependable and quick to scan while a user is standing on site. The visual signature is the **closure trail**: status, owner, time and next action remain visible from summary to detail so risk, inspection and rectification work always feels traceable.

The driver mobile project supplies the familiar login structure and mobile shell. SMIS extends it with denser operational information, stronger status semantics and a five-destination bottom navigation.

## Visual language

- Primary: indigo `#4f46e5`, deep indigo `#312e81`, bright blue `#2563eb`.
- Safety accent: amber `#f59e0b`; danger `#e5484d`; success `#0f9f6e`.
- Text: graphite `#152033`; secondary `#66738a`; muted `#98a3b5`.
- Canvas: cool paper `#f2f5fa`; controls `#f5f7fb`; surfaces white.
- Use semantic color only for status and action meaning. Do not color every module differently.
- Hero and top bars use a deep-indigo-to-blue gradient, subtle grid and restrained glow. Content surfaces remain light.

## Depth strategy

Use a light three-level hierarchy:

1. Page canvas is flat cool gray.
2. Content cards use a fine border and soft low shadow.
3. Floating navigation and primary actions use stronger shadow or blur.

Avoid negative-margin card overlaps below headers. Summary cards begin after the header with visible breathing room. Avoid stacked heavy shadows and decorative glass effects inside data-dense content.

## Layout and spacing

- Mobile content width is full viewport; desktop H5 is capped at `520px` and centered.
- Page horizontal padding: `28rpx`; hero horizontal padding: `32–34rpx`.
- Use an 8px rhythm expressed in rpx: common gaps are `16/18/20/24/28/32rpx`.
- Card radius: `26rpx`; major header/footer radius: `32–36rpx`; controls: `18rpx`.
- Standard control height: `88rpx`; all tap targets should be at least `88rpx` in one dimension when practical.
- Pages with bottom navigation reserve `174rpx + safe-area`; fixed action pages reserve their own action-bar clearance.

## Typography

- Prefer the system Chinese sans stack (HarmonyOS Sans / PingFang SC / Microsoft YaHei / sans-serif).
- Page titles: `36–40rpx`, weight 800.
- Section titles: `29–31rpx`, weight 800.
- Card titles: `27–29rpx`, weight 750–800.
- Body: `23–25rpx`; metadata: `18–20rpx`. Muted copy must remain subordinate to titles and values.
- Numeric summaries use tabular numerals and weight 800.
- Eyebrows are short uppercase operational labels, `20rpx`, wide tracking. Never use them as the only page title.

## Components

### Top bar

- Always shows location (title), context (subtitle) and optional operational eyebrow.
- Back and menu controls are circular translucent surfaces with accessible labels.
- Title and subtitle truncate to one line; business content belongs below the bar.

### Bottom navigation

- Five destinations: 首页、消息、随手拍、工作台、我的.
- Active destination uses an indigo soft pill. The center quick-report action is raised and filled with the primary gradient.
- Keep it floating above the safe area and reserve page content clearance.

### Cards and lists

- One card represents one actionable object.
- Order: title/status, identifier, key context, then date/progress/next affordance.
- Use inset gray surfaces for locations, dates or secondary facts.
- Status rails or dots may reinforce state; never rely on color alone.
- Lists use `18rpx` gaps instead of stacked divider-only rows.
- Long business lists load in `15`-record pages, support pull-to-refresh and fetch the next page near the bottom. Show both loading-more and end-of-list feedback.
- Date tiles reserve a fixed, non-shrinking width; day and month each use a centered one-line box with tabular numerals.

### Search and status filters

- Use `SmisSearchBar` for keyword searches and `SmisStatusTabs` for status filters.
- Status filters stay on one horizontal rail and scroll when necessary; never stack into a tall vertical filter block on mobile.
- Search, filter and result cards remain separate surfaces so filters do not visually merge with the first record.

### Forms

- Group fields by user decision: location, hazard facts, evidence, then submission.
- Labels remain visible; placeholder text gives examples, not labels.
- Required fields use `*`; destructive or rejection actions are visually distinct.
- Photo upload is a first-class evidence area with clear count and removable thumbnails.
- Use `SmisLocationField` for automatic location capture, editable detail text and an embedded point preview; avoid launching an unstyled system location page.
- Use `SmisEvidenceUpload` for camera/album selection, upload progress, quota, preview and removal.
- Site selection uses the tenant-wide hierarchy. Organization assignment and physical site selection are related business facts, but a department without directly-owned sites must not produce an empty picker.
- Primary submit action comes last and is not obscured by bottom navigation.
- Multiline fields use `SmisTextareaField`: visible label/hint, inset control tone, explicit native-textarea height, compact character-count rail and a focus-within ring. Use the compact variant for secondary notes and abnormal-item remarks.
- On tab-root forms, keep the primary submit action in a translucent dock immediately above bottom navigation and reserve both layers in page padding.

### Button alignment

- Native Uni-app buttons use a reset `line-height: 1.2`; compact and text-only actions use Flex centering with `line-height: 1`.
- Primary and secondary actions are `88rpx` high and center their label with `align-items` and `justify-content`, including Wot Design custom-class buttons.
- Buttons containing structured cards keep their own grid/flex layout; do not apply the text-only centering rule to ledger or task cards.
- Bottom-navigation labels use a `1` line-height so the icon-and-label group sits on the optical centre of the navigation rail.

### Status and feedback

- Status tags include a dot plus text.
- Loading, empty, error and read-only states must be explicit and centered in the current content region.
- Errors shown to users are actionable Chinese messages; raw backend text is not the primary message.

## Page hierarchy

- Home: greeting → daily summary → closure stage → core modules → priority tasks → shift.
- Ledger/list: header → summary → search/filter → records → empty/loading state.
- Detail/execution: identity → key facts → progress → work items → closure trail → final action.
- Quick report: reporter identity → location → hazard facts → evidence → submit note → primary action.

## Interaction rules

- Pressable cards subtly scale and reduce shadow; animations stop for reduced-motion preference.
- Search inputs have names, accessible labels and explicit search actions.
- Icon-only buttons always have an accessible label.
- Photos that open previews expose button semantics and a descriptive label.
- Do not place a primary submission control underneath the floating navigation.

## Implementation sources of truth

- Tokens and shared primitives: `src/styles/theme.scss`.
- Cross-page layout contracts: `src/styles/page-polish.scss`.
- Header: `src/components/SmisTopBar.vue`.
- Navigation: `src/components/SmisBottomNav.vue`.
- List record pattern: `src/components/SmisTaskCard.vue`.
- Search/status/list feedback: `src/components/SmisSearchBar.vue`, `src/components/SmisStatusTabs.vue`, `src/components/SmisListFooter.vue`.
- Form sections, location and evidence: `src/components/SmisFormSection.vue`, `src/components/SmisLocationField.vue`, `src/components/SmisEvidenceUpload.vue`.
- Empty state: `src/components/SmisEmpty.vue`.

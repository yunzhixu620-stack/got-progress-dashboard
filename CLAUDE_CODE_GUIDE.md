# Claude Code 接入指南：多语言任务进度面板

## 目标

把当前独立的 `got-progress-dashboard.html` 里的“多语言任务进度”能力，接入到 LQA 系统：

```text
https://lqa.qixuanzhen.site
```

推荐接入位置：

```text
/translation
```

也可以在 `/glossary` 页面增加入口，但任务管理更适合放在翻译协作工作台里，术语库页面只负责提供术语进度数据。

## 当前产物

本包包含：

- `got-progress-dashboard.html`：当前独立页面原型
- `got-progress-server.js`：本地共享保存服务，仅用于原型演示
- `got-progress-data.json`：当前种子数据
- `SYSTEM_INTEGRATION.md`：系统接入说明
- `CLAUDE_CODE_GUIDE.md`：给 Claude Code 的具体开发说明
- `API_MAPPING.md`：LQA 系统接口和语言映射

## 不要直接照搬的部分

接入 LQA 系统时，不要继续使用 GitHub Pages 或本地 `got-progress-server.js` 作为正式数据源。

原因：

- GitHub Pages 是静态页面，不能写入共享任务数据。
- GitHub Pages 与 `lqa.qixuanzhen.site` 不同源，不能稳定读取 LQA 登录态接口。
- 正式版本应使用 LQA 系统自己的后端接口和登录态。

## 推荐实现方式

在 LQA 系统中新增一个任务进度 Tab，例如：

```js
task_progress
```

放在 `translation.js` 的工作台 Tab 体系里，和这些 Tab 平级：

- 数据浏览
- 中→英校对
- 多语言录入
- 数据校验
- 导入数据
- 术语库
- 翻译统计
- 成员管理

## 数据来源

### 1. 术语库实时进度

GOT 术语库各语种进度必须对准这个接口：

```text
GET /api/translation/glossary/stats
```

页面当前已验证该接口被 `/static/glossary.js?v=20260630b` 使用。

接口返回中重点使用：

```js
stats.total
stats.confirmed_by_lang
```

计算方式：

```js
progress = Math.round(stats.confirmed_by_lang[langCode] / stats.total * 100)
```

示例：系统页面显示过：

```text
英语已确认 516/1747 (30%)
```

所以英语 GOT 术语库任务应显示：

```text
size = 1747
done = 516
progress = 30
```

### 2. 负责人列表

负责人应该来自系统成员接口：

```text
GET /api/permission/members
```

不要在任务面板里维护一套独立负责人名单。

### 3. 翻译工作量参考

可选接入：

```text
GET /api/translation/daily_changes?days=30
```

用于展示成员最近工作量，辅助排期。

## 需要新增的后端接口

如果 LQA 系统目前没有任务持久化接口，需要新增：

```text
GET    /api/translation/tasks
POST   /api/translation/tasks
PUT    /api/translation/tasks/:id
DELETE /api/translation/tasks/:id
```

任务字段建议：

```json
{
  "id": "term-es",
  "group": "GOT 术语库修改",
  "name": "西语 GOT 术语库",
  "lang": "es",
  "owner": "爻忍",
  "type": "术语库",
  "status": "进行中",
  "priority": "P0",
  "start": "2026/07/01",
  "due": "2026/07/02",
  "progress": 89,
  "size": 1747,
  "daily": 400,
  "note": "明天上午过完",
  "source": "glossary_stats"
}
```

其中 `source = glossary_stats` 的任务，进度由 `/api/translation/glossary/stats` 覆盖，不由用户手动改。

## 前端行为要求

1. 任务总览表支持：
   - 添加任务
   - 追加任务导入
   - 恢复整份数据
   - 自动排期
   - 导出 Excel/PDF
   - 修改负责人
   - 修改状态
   - 修改开始日期/截止日期
   - 修改 P0/P1/P2

2. 个人进度必须由任务列表实时聚合：
   - 按负责人分组
   - 展示任务数
   - 展示平均进度
   - 展示每个任务的优先级、状态、截止时间

3. GOT 术语库任务实时同步：
   - 从 `/api/translation/glossary/stats` 读取各语种已确认数
   - 按语言映射更新对应任务进度
   - 已确认数达到总数时，任务状态自动变为 `已完成`

## UI 建议

当前原型已经调整为三栏工作台：

- 左侧：任务分组、低进度关注、同步状态
- 中间：任务表格
- 右侧：快捷操作、负责人负载、辅助信息

接入 LQA 系统时，建议沿用系统现有视觉变量、按钮样式、表格样式，不要完全照搬原型 CSS。

## 导入任务兼容格式

追加任务导入应支持 JSON/CSV，并支持字段别名：

- 任务名称：`name` / `任务名称` / `任务名` / `名称` / `任务`
- 语种：`lang` / `语种` / `语言` / `目标语言`
- 负责人：`owner` / `负责人` / `人员` / `执行人` / `成员`
- 优先级：`priority` / `优先级` / `优先`
- 状态：`status` / `任务状态` / `状态`
- 开始日期：`start` / `开始日期` / `开始`
- 截止日期：`due` / `截止日期` / `截止` / `deadline`
- 进度：`progress` / `当前进度` / `进度` / `完成度`
- 任务量：`size` / `任务量` / `总量` / `总条数`
- 每日能力：`daily` / `每日能力` / `日处理量` / `日产能`
- 备注：`note` / `备注` / `说明`

## Claude Code 开发顺序

1. 在 LQA 代码仓库中找到 `/translation` 页面对应模板和 `static/translation.js`。
2. 在 Tab 列表中新增 `task_progress`。
3. 新增任务面板容器，例如 `#task-progress-content`。
4. 复用现有 `api()`、`showToast()`、`getCsrfToken()` 工具函数。
5. 新增 `loadTaskProgress()`。
6. 新增 `loadGlossaryProgressStats()`，读取 `/api/translation/glossary/stats`。
7. 新增任务 CRUD 后端接口或临时使用现有存储方案。
8. 渲染任务总览、个人进度、负责人负载。
9. 添加导入/导出/排期。
10. 做权限控制：只允许有编辑权限的人修改任务。


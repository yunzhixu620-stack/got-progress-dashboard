# LQA 任务进度接入包

这个压缩包用于交给 Claude Code 或接手工程师，把“多语言任务进度”功能接入：

```text
https://lqa.qixuanzhen.site/glossary
https://lqa.qixuanzhen.site/translation
```

## 文件说明

- `got-progress-dashboard.html`：当前独立原型页面，可作为 UI/交互参考。
- `lqa-task-progress-module.js`：建议搬进 LQA 系统前端的核心逻辑示例。
- `API_MAPPING.md`：术语库进度、成员、翻译统计接口映射。
- `CLAUDE_CODE_GUIDE.md`：给 Claude Code 的实施教程。
- `SYSTEM_INTEGRATION.md`：系统接入设计说明。
- `LOCAL_SYNC_SETUP.md`：先在你电脑上运行并读取 LQA 术语库进度的本机方案。
- `got-progress-data.json`：当前初始化任务数据。
- `got-progress-server.js`：本地共享原型服务，正式接入 LQA 时不建议使用。
- `lqa-cookie.example.txt`：本机代理读取 LQA 接口时的 Cookie 示例，不要提交真实 Cookie。

## 当前 UI 约定

- 任务表尽量压缩在中间区域，不使用横向进度条。
- 进度用紧凑数字输入框显示，例如 `70`。
- 优先级使用一个下拉选择框，当前值按 P0/P1/P2 着色，点击后向下展开选项。
- 负责人支持直接修改，正式接入时应使用 `/api/permission/members` 作为负责人来源。
- 独立原型页面的 GitHub Pages 不负责正式共享保存，正式共享保存必须接入 LQA 后端任务接口。

## 如果先接在个人电脑上

用 `start-got-progress-dashboard.bat` 启动，然后打开：

```text
http://localhost:8787/
```

不要使用 `file:///.../got-progress-dashboard.html`。

如果要让本机页面读取 LQA 术语库实时进度，需要按 `LOCAL_SYNC_SETUP.md` 配置 `lqa-cookie.txt`。真实 Cookie 只放在你自己的电脑上，不进入 GitHub，不进入交付包。

## 最重要的接口

术语库各语种实时进度必须对准：

```text
GET /api/translation/glossary/stats
```

使用：

```js
stats.total
stats.confirmed_by_lang
```

语言映射：

```js
{
  en: "en",
  de: "de",
  fr: "fr",
  es: "es",
  pt: "pt",
  ja: "jp",
  ko: "kr"
}
```

注意：原型页面中日语/韩语用 `ja/ko`，LQA 术语库接口中是 `jp/kr`。

## 推荐给 Claude Code 的第一句话

请阅读 `CLAUDE_CODE_GUIDE.md` 和 `API_MAPPING.md`，把 `got-progress-dashboard.html` 的任务进度能力接入 LQA 系统 `/translation` 工作台，新增一个“任务进度”Tab。GOT 术语库任务进度必须从 `/api/translation/glossary/stats` 实时读取，按语言分别映射到对应任务。

## 接入时最重要的判断

这个包不是让 Claude Code 继续维护一个 GitHub 静态网页，而是让 Claude Code 把任务进度模块做进 LQA 系统：

```text
https://lqa.qixuanzhen.site/translation
https://lqa.qixuanzhen.site/glossary
```

如果 Claude Code 问数据从哪里来，答案是：

- GOT 术语库进度来自 `/api/translation/glossary/stats`
- 负责人来自 `/api/permission/members`
- 自定义任务需要新增 `/api/translation/tasks` 持久化接口

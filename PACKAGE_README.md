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
- `got-progress-data.json`：当前初始化任务数据。
- `got-progress-server.js`：本地共享原型服务，正式接入 LQA 时不建议使用。

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


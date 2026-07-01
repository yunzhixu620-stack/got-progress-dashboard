# 接入 LQA 系统的建议

已登录查看 `https://lqa.qixuanzhen.site` 后，当前系统已有这些可复用能力：

- 术语库页面：`/glossary`
- 翻译协作页面：`/translation`
- 术语库统计接口：`/api/translation/glossary/stats`
- 翻译覆盖统计接口：`/api/translation/stats`
- 成员列表接口：`/api/permission/members`
- 成员工作量接口：`/api/translation/daily_changes?days=30`

## 推荐接入方式

把“多语言任务进度”作为 `translation.js` 里的一个新 Tab，例如：

- `task_progress`：任务进度

位置可以和现有这些 Tab 平级：

- 数据浏览
- 中→英校对
- 多语言录入
- 数据校验
- 导入数据
- 术语库
- 翻译统计
- 成员管理

## 自动进度来源

GOT 术语库任务不需要手动填进度，可以从：

```text
/api/translation/glossary/stats
```

读取：

- `total`
- `confirmed_by_lang`

然后按语种计算：

```text
progress = confirmed_by_lang[lang] / total
```

例如当前页面显示：

```text
英语已确认 516/1747 (30%)
```

## 负责人来源

负责人建议从：

```text
/api/permission/members
```

读取系统成员，作为任务负责人下拉选项。这样负责人和系统权限/成员管理保持一致。

## 个人进度联动

个人进度不应该单独维护，应该由任务列表实时聚合：

- 按负责人分组
- 汇总其负责的任务数量
- 计算平均进度
- 展示 P0/P1/P2 和截止时间

## 需要新增的后端能力

如果要在系统内持久保存自定义任务，需要新增任务接口，例如：

```text
GET    /api/translation/tasks
POST   /api/translation/tasks
PUT    /api/translation/tasks/:id
DELETE /api/translation/tasks/:id
```

任务字段建议：

```json
{
  "id": "task-id",
  "group": "GOT 术语库修改",
  "name": "西班牙语 GOT 术语库",
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
  "note": "明天上午过完"
}
```

如果是系统自动任务，例如 GOT 术语库，可以保存任务配置，但进度由 `glossary/stats` 覆盖。

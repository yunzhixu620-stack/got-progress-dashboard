# LQA 任务进度接口映射

## 核心接口

### 术语库统计

```text
GET /api/translation/glossary/stats
```

用途：

- GOT 术语库各语言实时进度
- 总术语数
- 每个语言已确认数

前端来源：

```text
/static/glossary.js?v=20260630b
```

已确认页面渲染字段：

```text
共 1747 条术语
英语已确认 516/1747 (30%)
```

预期数据结构：

```json
{
  "total": 1747,
  "confirmed_by_lang": {
    "en": 516,
    "de": 0,
    "fr": 0,
    "es": 1563,
    "pt": 0,
    "jp": 0,
    "kr": 0
  }
}
```

字段以真实接口返回为准。前端应容错处理缺失语言。

## 语言映射

任务面板语言码与 LQA 术语库接口语言码映射：

| 任务面板 | 中文名称 | LQA glossary code |
|---|---|---|
| en | 英语 | en |
| de | 德语 | de |
| fr | 法语 | fr |
| es | 西班牙语 | es |
| pt | 葡萄牙语 | pt |
| ja | 日语 | jp |
| ko | 韩语 | kr |

注意：

- 原型页面使用 `ja/ko`
- LQA 术语库脚本中使用 `jp/kr`
- 接入时必须做转换

## 进度计算

```js
function glossaryProgress(stats, langCode) {
  const total = Number(stats.total || 0);
  const done = Number((stats.confirmed_by_lang || {})[langCode] || 0);
  return {
    done,
    total,
    progress: total ? Math.round(done / total * 100) : 0
  };
}
```

任务状态自动更新建议：

```js
if (progress >= 100) status = "已完成";
else if (progress > 0 && status === "未开始") status = "进行中";
```

## 成员接口

```text
GET /api/permission/members
```

用途：

- 负责人下拉选项
- 个人进度聚合
- 权限判断

前端来源：

```text
/static/translation.js?v=20260605a
```

## 翻译统计接口

```text
GET /api/translation/stats
GET /api/translation/daily_changes?days=30
```

用途：

- 普通翻译覆盖率
- 成员工作量
- 可作为排期参考

## 推荐新增任务接口

```text
GET    /api/translation/tasks
POST   /api/translation/tasks
PUT    /api/translation/tasks/:id
DELETE /api/translation/tasks/:id
```

### 任务字段

| 字段 | 含义 | 示例 |
|---|---|---|
| id | 任务 ID | term-es |
| group | 任务分组 | GOT 术语库修改 |
| name | 任务名称 | 西语 GOT 术语库 |
| lang | 语言码 | es |
| owner | 负责人 | 爻忍 |
| type | 类型 | 术语库 |
| status | 状态 | 进行中 |
| priority | 优先级 | P0 |
| start | 开始日期 | 2026/07/01 |
| due | 截止日期 | 2026/07/02 |
| progress | 进度百分比 | 89 |
| size | 总任务量 | 1747 |
| daily | 每日能力 | 400 |
| note | 备注 | 明天上午过完 |
| source | 进度来源 | glossary_stats |

## source 说明

| source | 行为 |
|---|---|
| manual | 用户手动维护进度 |
| glossary_stats | 进度由 `/api/translation/glossary/stats` 覆盖 |
| translation_stats | 后续可由 `/api/translation/stats` 覆盖 |


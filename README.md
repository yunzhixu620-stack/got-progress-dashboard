# 多语言任务进度面板

这是一个用于管理 BALL 修改、GOT 术语库修改、GOT 修改的任务进度页面。

## 功能

- 任务总览和个人进度
- 状态、进度、优先级、开始日期、截止日期、备注可编辑
- 添加任务
- 导入新任务，支持 JSON 或 CSV
- 自动排期
- 导出 PDF
- 导出 Excel
- 本地服务模式支持共享保存

## 直接打开

打开 `got-progress-dashboard.html` 可以单机使用，数据会保存在当前浏览器。

## 共享保存

运行：

```bash
node got-progress-server.js
```

然后打开：

```text
http://localhost:8787/
```

同一个网络里的其他人可以打开你的局域网地址，例如：

```text
http://你的电脑IP:8787/
```

这种方式会把大家的修改保存到 `got-progress-data.json`。

## GitHub Pages

GitHub Pages 可以让大家打开页面，但它是静态网页，不能直接写入共享数据。要多人共享保存，需要运行 `got-progress-server.js`，或把这个 Node 服务部署到支持写文件/数据库的服务上。

# 本机同步模式

这个模式适合先在你的电脑上使用任务面板：

- 任务状态、负责人、日期、备注保存到本机 `got-progress-data.json`
- GOT 术语库进度从 LQA 系统接口实时读取

## 必须用服务地址打开

不要用：

```text
file:///C:/.../got-progress-dashboard.html
```

要用：

```text
http://localhost:8787/
```

启动方式：

```bat
start-got-progress-dashboard.bat
```

或：

```bash
node got-progress-server.js
```

## 配置 LQA 登录 Cookie

本机服务要读取：

```text
https://lqa.qixuanzhen.site/api/translation/glossary/stats
```

这个接口需要 LQA 登录态。因为本机服务不是浏览器，它不能自动拿到你浏览器里的登录态，所以需要在本机提供 Cookie。

做法：

1. 在浏览器登录 `https://lqa.qixuanzhen.site`
2. 从浏览器开发者工具里复制 `lqa.qixuanzhen.site` 请求的 Cookie
3. 在 `outputs` 目录新建：

```text
lqa-cookie.txt
```

4. 把 Cookie 放进去，格式类似：

```text
session=xxx; csrftoken=xxx; other=xxx
```

`lqa-cookie.txt` 已加入 `.gitignore`，不会提交到 GitHub。

## 同步逻辑

页面点击 `同步系统进度` 后会请求：

```text
GET http://localhost:8787/api/glossary-stats
```

本机服务再请求：

```text
GET https://lqa.qixuanzhen.site/api/translation/glossary/stats
```

然后按语言更新 GOT 术语库任务：

| 面板语言 | LQA 接口语言 |
|---|---|
| en | en |
| de | de |
| fr | fr |
| es | es |
| pt | pt |
| ja | jp |
| ko | kr |

## 注意

这只是本机临时方案。正式接入 LQA 系统时，不应该用 Cookie 文件，应该把任务进度模块直接做进 `lqa.qixuanzhen.site` 的同源系统里。

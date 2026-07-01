// Reference module for integrating task progress into lqa.qixuanzhen.site.
// This file is not required by the standalone dashboard. It is a concise
// implementation guide for Claude Code when editing the real LQA codebase.

const TASK_LANG_TO_GLOSSARY_LANG = {
  en: "en",
  de: "de",
  fr: "fr",
  es: "es",
  pt: "pt",
  ja: "jp",
  ko: "kr",
  jp: "jp",
  kr: "kr"
};

const TASK_FIELD_ALIASES = {
  group: ["group", "任务分组", "分组", "任务大类", "项目", "模块"],
  name: ["name", "任务名称", "任务名", "名称", "标题", "任务"],
  lang: ["lang", "语种", "语言", "目标语言", "language"],
  owner: ["owner", "负责人", "人员", "执行人", "成员", "ownerName", "assignee"],
  type: ["type", "任务类型", "类型"],
  status: ["status", "任务状态", "状态", "进度状态"],
  priority: ["priority", "优先级", "优先", "P"],
  start: ["start", "开始日期", "开始", "开始时间", "startDate"],
  due: ["due", "截止日期", "截止", "截止时间", "交付", "dueDate", "deadline"],
  progress: ["progress", "当前进度", "进度", "完成度", "百分比"],
  size: ["size", "任务量", "总量", "总条数", "条数"],
  daily: ["daily", "每日能力", "日处理量", "每天条数", "日产能"],
  note: ["note", "备注", "说明", "补充", "comment"]
};

async function loadGlossaryTaskProgress(api) {
  const stats = await api("/api/translation/glossary/stats");
  const total = Number(stats.total || 0);
  const confirmed = stats.confirmed_by_lang || {};

  return Object.entries(TASK_LANG_TO_GLOSSARY_LANG).reduce((acc, [taskLang, glossaryLang]) => {
    const done = Number(confirmed[glossaryLang] || 0);
    acc[taskLang] = {
      done,
      total,
      progress: total ? Math.round(done / total * 100) : 0
    };
    return acc;
  }, {});
}

function applyGlossaryStatsToTasks(tasks, glossaryProgressByLang) {
  return tasks.map(task => {
    if (task.source !== "glossary_stats" && task.group !== "GOT 术语库修改") {
      return task;
    }

    const progress = glossaryProgressByLang[task.lang];
    if (!progress) return task;

    const next = {
      ...task,
      size: progress.total,
      progress: progress.progress,
      note: upsertSystemNote(task.note, progress.done, progress.total)
    };

    if (next.progress >= 100) next.status = "已完成";
    else if (next.progress > 0 && next.status === "未开始") next.status = "进行中";

    return next;
  });
}

function groupTasksByOwner(tasks) {
  const grouped = new Map();
  for (const task of tasks) {
    const owner = task.owner || "未分配";
    if (!grouped.has(owner)) grouped.set(owner, []);
    grouped.get(owner).push(task);
  }

  return [...grouped.entries()].map(([owner, ownerTasks]) => ({
    owner,
    tasks: ownerTasks,
    count: ownerTasks.length,
    progress: ownerTasks.length
      ? Math.round(ownerTasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / ownerTasks.length)
      : 0
  }));
}

function normalizeImportedTask(raw) {
  const task = {};
  for (const [targetKey, aliases] of Object.entries(TASK_FIELD_ALIASES)) {
    for (const key of aliases) {
      if (raw[key] !== undefined && raw[key] !== "") {
        task[targetKey] = raw[key];
        break;
      }
    }
  }

  task.group ||= "GOT 修改";
  task.name ||= [task.lang, task.group].filter(Boolean).join(" ") || "新任务";
  task.status ||= "未开始";
  task.priority = normalizePriority(task.priority || "P1");
  task.progress = clamp(String(task.progress || "0").replace("%", ""));

  return task;
}

function normalizePriority(value) {
  const text = String(value || "").trim().toUpperCase();
  if (text.includes("0") || text.includes("紧急")) return "P0";
  if (text.includes("2") || text.includes("低")) return "P2";
  return "P1";
}

function upsertSystemNote(note, done, total) {
  const prefix = `系统确认 ${done}/${total}`;
  const rest = String(note || "").replace(/系统确认\s+\d+\/\d+\s*；?\s*/g, "").trim();
  return rest ? `${prefix}；${rest}` : prefix;
}

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}


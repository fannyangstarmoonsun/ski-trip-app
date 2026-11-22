(() => {
const T = window.TRIP;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- Saved state (stays on this phone) ----------
const KEY = "snowOnsenTrip.v1";
const defaults = { lang: "zh", cur: "JPY", rate: 2.9, flights: {}, stays: {}, visited: {}, expenses: [], tab: "plan", day: null };
let S = Object.assign({}, defaults);
try { S = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

// ---------- Words ----------
const W = {
  zh: { plan: "行程", stays: "交通住宿", phrases: "日语", money: "记账", day: "第{n}天", of: "共{n}天",
    swipe: "← 左右滑动换一天 →", openMap: "在 Google 地图打开 ↗", noMap: "没有网络时地图不能显示。点下面的导航按钮，有网络后就会打开 Google 地图。",
    nav: "导航", visited: "去过了", markVisited: "标记去过", tonight: "今晚住", noStay: "今天回家，没有住宿",
    notBooked: "还没订", booked: "已订", area: "建议区域", findHotels: "在 Google 地图找附近酒店 ↗",
    enterBooking: "填写已订酒店", hotelName: "酒店名称", hotelAddr: "地址（可不填）", saveBtn: "保存", cancel: "取消", edit: "修改",
    nights: "{n}晚", estCost: "今天预计花费", estNote: "价钱是估算，用来做预算。", prev: "← 前一天", next: "后一天 →",
    flights: "航班", stayList: "住宿", tbdTime: "时间未填", fillInSettings: "在设置里填", dep: "起飞", arr: "降落",
    phrasesTitle: "常用日语", tapShow: "点一下放大给店员看", play: "播放读音", close: "关闭", sos: "紧急电话",
    police: "警察", ambulance: "救护车／消防", hotline: "旅客热线（英语／华语）",
    spent: "已花", budget: "预算（全程估算）", left: "还剩", over: "超出", addExp: "记一笔", amount: "金额", note: "备注",
    notePh: "例如：白马拉面", whichDay: "哪一天", addBtn: "加上", byCat: "按类别", noExp: "还没有记录。在上面记下第一笔花费。",
    del: "删除", sure: "确定删除？", added: "已记上", savedT: "已保存",
    cats: { food: "吃饭", transport: "交通", stay: "住宿", ski: "滑雪", ticket: "门票", shop: "购物", other: "其他" },
    settings: "设置", rateLbl: "汇率：100 日元 = ? RM", rateHint: "出发前到 Wise 或银行看最新汇率，再改这里。",
    flightTimes: "航班时间", depTime: "起飞时间", arrTime: "降落时间", dataHint: "所有记账和修改只存在这部手机的浏览器里。换手机或清除浏览器资料会不见。",
    installTitle: "加到主画面", installHint: "iPhone：用 Safari 打开 → 点分享 → 「加入主画面」。Android：Chrome 菜单 → 「安装应用」。",
    today: "今天" },
  en: { plan: "Plan", stays: "Travel", phrases: "Phrases", money: "Spend", day: "Day {n}", of: "of {n}",
    swipe: "← Swipe to change day →", openMap: "Open in Google Maps ↗", noMap: "The map needs a connection. The navigate buttons below open Google Maps once you're online.",
    nav: "Navigate", visited: "Visited", markVisited: "Mark visited", tonight: "Tonight", noStay: "Flying home, no stay tonight",
    notBooked: "Not booked", booked: "Booked", area: "Suggested area", findHotels: "Find hotels nearby in Google Maps ↗",
    enterBooking: "Add my booking", hotelName: "Hotel name", hotelAddr: "Address (optional)", saveBtn: "Save", cancel: "Cancel", edit: "Edit",
    nights: "{n} night(s)", estCost: "Estimated spend today", estNote: "Prices are estimates for budgeting.", prev: "← Previous", next: "Next →",
    flights: "Flights", stayList: "Stays", tbdTime: "Time not set", fillInSettings: "Add in Settings", dep: "Departs", arr: "Arrives",
    phrasesTitle: "Useful Japanese", tapShow: "Tap to show it big to staff", play: "Play audio", close: "Close", sos: "Emergency numbers",
    police: "Police", ambulance: "Ambulance / fire", hotline: "Visitor hotline (English / Chinese)",
    spent: "Spent", budget: "Budget (trip estimate)", left: "left", over: "over", addExp: "Add an expense", amount: "Amount", note: "Note",
    notePh: "e.g. Ramen in Hakuba", whichDay: "Day", addBtn: "Add", byCat: "By category", noExp: "Nothing logged yet. Add your first expense above.",
    del: "Delete", sure: "Delete?", added: "Added", savedT: "Saved",
    cats: { food: "Food", transport: "Transport", stay: "Stay", ski: "Skiing", ticket: "Tickets", shop: "Shopping", other: "Other" },
    settings: "Settings", rateLbl: "Rate: 100 JPY = ? RM", rateHint: "Check the latest rate on Wise or your bank before you go, then update it here.",
    flightTimes: "Flight times", depTime: "Departure", arrTime: "Arrival", dataHint: "Expenses and edits are stored only in this phone's browser. Clearing browser data or switching phones will lose them.",
    installTitle: "Add to Home Screen", installHint: "iPhone: open in Safari → Share → \"Add to Home Screen\". Android: Chrome menu → \"Install app\".",
    today: "Today" },
};
const w = (k, n) => { const v = W[S.lang][k] != null ? W[S.lang][k] : k; return n == null ? v : v.replace("{n}", n); };
const t = o => (o && typeof o === "object") ? (o[S.lang] != null ? o[S.lang] : o.zh) : (o == null ? "" : o);

// ---------- Money ----------
const toJPY = (amt, cur) => cur === "RM" ? amt / S.rate * 100 : amt;
const money = jpy => S.cur === "RM"
  ? "RM " + (jpy * S.rate / 100).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : "¥" + Math.round(jpy).toLocaleString("en-US");
const other = jpy => S.cur === "RM" ? "¥" + Math.round(jpy).toLocaleString("en-US")
  : "RM " + (jpy * S.rate / 100).toFixed(2);

// ---------- Dates ----------
const startDate = new Date(T.start + "T00:00:00");
const dateOf = i => new Date(startDate.getTime() + i * 864e5);
const wd = { zh: ["周日","周一","周二","周三","周四","周五","周六"], en: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] };
const md = d => `${d.getMonth() + 1}/${d.getDate()}`;
const longDate = d => S.lang === "zh" ? `${d.getMonth() + 1}月${d.getDate()}日 · ${wd.zh[d.getDay()]}` : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const todayIdx = (() => { const n = new Date(); n.setHours(0,0,0,0); const i = Math.round((n - startDate) / 864e5); return i >= 0 && i < T.days.length ? i : -1; })();
if (S.day == null || S.day >= T.days.length) S.day = todayIdx >= 0 ? todayIdx : 0;

// ---------- Links ----------
const gNav = q => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}&travelmode=transit`;
const gRoute = (a, b) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(a)}&destination=${encodeURIComponent(b)}&travelmode=transit`;
const gSearch = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const gEmbed = q => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=13&hl=${S.lang === "zh" ? "zh-CN" : "en"}&output=embed`;

// ---------- Icons ----------
const I = {
  train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l-2-4M15 21l2-4"/><circle cx="9" cy="14" r=".5"/><circle cx="15" cy="14" r=".5"/></svg>',
  bus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 11h16M7 21v-3M17 21v-3"/><circle cx="8" cy="14.5" r=".5"/><circle cx="16" cy="14.5" r=".5"/></svg>',
  nav: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4.5 20.3l.7.7L12 18l6.8 3 .7-.7z"/></svg>',
  plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4M7.5 13.5h3M7.5 17h6"/></svg>',
  stays: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20V9l9-6 9 6v11"/><path d="M9 20v-6h6v6M3 20h18"/></svg>',
  phrases: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M9 9h6M9 12h4"/></svg>',
  money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></svg>',
  speak: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
};

// ---------- Toast ----------
const toast = msg => { const el = $("#toast"); el.textContent = msg; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 1800); };

// ---------- Header + tabs ----------
function renderChrome() {
  document.documentElement.lang = S.lang === "zh" ? "zh-Hans" : "en";
  const end = new Date(T.end + "T00:00:00");
  document.title = t(T.title);
  $("#appTitle").innerHTML = `${esc(t(T.short || T.title))}<small>${md(startDate)} – ${md(end)} · ${T.days.length}${S.lang === "zh" ? " 天" : " days"}</small>`;
  $("#curJPY").classList.toggle("on", S.cur === "JPY");
  $("#curRM").classList.toggle("on", S.cur === "RM");
  $("#langZh").classList.toggle("on", S.lang === "zh");
  $("#langEn").classList.toggle("on", S.lang === "en");
  $("#tabs").innerHTML = ["plan", "stays", "phrases", "money"].map(k =>
    `<button type="button" data-tab="${k}" class="${S.tab === k ? "on" : ""}" aria-current="${S.tab === k}">${I[k]}<span>${w(k)}</span></button>`).join("");
}

function render() {
  renderChrome();
  const v = $("#view");
  v.classList.remove("view-anim"); void v.offsetWidth; v.classList.add("view-anim");
  ({ plan: renderPlan, stays: renderStays, phrases: renderPhrases, money: renderMoney })[S.tab]();
  save();
}

// ---------- Plan ----------
function stayById(id) { return T.stays.find(s => s.id === id); }
function stayCard(st, idx) {
  const mine = S.stays[st.id] || {};
  const booked = !!mine.name || st.booked;
  const name = mine.name || st.name;
  const addr = mine.addr || st.address;
  const nightNo = idx != null ? Math.round((dateOf(idx) - new Date(st.checkIn + "T00:00:00")) / 864e5) + 1 : null;
  return `<div class="card stay" style="--rc:${T.regions[st.region].color}">
    <div class="stay-head">
      <h3>${booked ? esc(name) : esc(t(st.area))}</h3>
      <span class="status ${booked ? "ok" : "todo"}">${booked ? w("booked") : w("notBooked")}</span>
    </div>
    <p>${esc(t(T.regions[st.region]))} · ${md(new Date(st.checkIn + "T00:00:00"))} – ${md(new Date(st.checkOut + "T00:00:00"))} · ${w("nights", st.nights)}${nightNo ? ` · ${S.lang === "zh" ? `第${nightNo}/${st.nights}晚` : `night ${nightNo}/${st.nights}`}` : ""}</p>
    ${booked ? (addr ? `<p>${esc(addr)}</p>` : "") : `<p>${esc(t(st.why))}</p><p>${w("area")}: ${esc(t(st.area))} · ≈ ${money(st.budget)} / ${S.lang === "zh" ? "晚" : "night"}</p>`}
    <div class="ti-actions">
      ${booked ? `<a class="nav-btn" href="${gNav(addr || name)}" target="_blank" rel="noopener">${I.nav}${w("nav")}</a>` : `<a class="link" href="${gSearch(st.search)}" target="_blank" rel="noopener">${w("findHotels")}</a>`}
      <button class="ghost-btn" type="button" data-editstay="${st.id}">${booked ? w("edit") : w("enterBooking")}</button>
    </div>
    <form class="inline-form" data-stayform="${st.id}" hidden>
      <div class="field"><label for="hn-${st.id}-${idx == null ? "x" : idx}">${w("hotelName")}</label><input id="hn-${st.id}-${idx == null ? "x" : idx}" name="name" value="${esc(mine.name || "")}"></div>
      <div class="field"><label for="ha-${st.id}-${idx == null ? "x" : idx}">${w("hotelAddr")}</label><input id="ha-${st.id}-${idx == null ? "x" : idx}" name="addr" value="${esc(mine.addr || "")}"></div>
      <div class="row"><button class="ghost-btn" type="button" data-cancelstay="${st.id}">${w("cancel")}</button><button class="primary" type="submit">${w("saveBtn")}</button></div>
    </form>
  </div>`;
}

function renderPlan() {
  const i = S.day, d = T.days[i], dt = dateOf(i), rc = T.regions[d.region].color;
  const chips = T.days.map((x, j) => {
    const dj = dateOf(j);
    return `<button type="button" class="day-chip ${j === i ? "on" : ""} ${j === todayIdx ? "today" : ""}" data-day="${j}" style="--rc:${T.regions[x.region].color}" aria-label="${w("day", j + 1)}">
      <b>D${j + 1}</b><span class="num">${md(dj)}</span><i>${esc(t(T.regions[x.region]))}</i></button>`;
  }).join("");

  const items = d.items.map((it, k) => {
    const vid = `${i}-${k}`;
    if (it.type === "move") {
      return `<div class="ti move" style="--rc:${rc}">
        <div class="ti-time">${esc(it.time)}</div>
        <div class="ti-rail"><span class="dot">${I[it.mode] || I.train}</span></div>
        <div class="ti-body">
          <div class="ti-name">${esc(t(it.label))}</div>
          <div class="dur">${esc(t(it.dur))}</div>
          ${it.tip ? `<div class="ti-tip">${esc(t(it.tip))}</div>` : ""}
          <div class="ti-actions"><a class="ghost-btn" href="${gRoute(it.from, it.to)}" target="_blank" rel="noopener">${w("nav")} ↗</a></div>
        </div></div>`;
    }
    const seen = !!S.visited[vid];
    return `<div class="ti" style="--rc:${rc}">
      <div class="ti-time">${esc(it.time)}</div>
      <div class="ti-rail"><span class="dot"></span></div>
      <div class="ti-body">
        <div class="ti-name">${esc(t(it.name))}</div>
        ${it.ja ? `<div class="ti-ja ja">${esc(it.ja)}</div>` : ""}
        ${it.note ? `<div class="ti-note">${esc(t(it.note))}</div>` : ""}
        <div class="ti-actions">
          <a class="nav-btn" href="${gNav(it.q)}" target="_blank" rel="noopener">${I.nav}${w("nav")}</a>
          <button type="button" class="ghost-btn ${seen ? "done" : ""}" data-visit="${vid}">${seen ? "✓ " + w("visited") : w("markVisited")}</button>
        </div>
      </div></div>`;
  }).join("");

  const total = d.costs.reduce((a, c) => a + c[2], 0);
  const st = d.stay ? stayById(d.stay) : null;

  $("#view").innerHTML = `
    <div class="days" id="dayStrip">${chips}</div>
    <section class="card hero" style="--rc:${rc}" id="hero">
      <div class="hero-meta"><span class="region">${esc(t(T.regions[d.region]))}</span><span>${longDate(dt)}</span><span>· ${w("day", i + 1)} / ${T.days.length}</span>${i === todayIdx ? `<span class="status todo">${w("today")}</span>` : ""}</div>
      <h2>${esc(t(d.title))}</h2>
      <p>${esc(t(d.summary))}</p>
    </section>
    <div class="swipe-hint">${w("swipe")}</div>
    <section class="card map-wrap">
      ${navigator.onLine ? `<iframe title="Map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${gEmbed(d.map)}"></iframe>` : `<div class="offline-map">${w("noMap")}</div>`}
      <div class="map-bar"><span class="ja">${esc(d.map)}</span><a href="${gSearch(d.map)}" target="_blank" rel="noopener">${w("openMap")}</a></div>
    </section>
    <section class="card timeline">${items}</section>
    <div class="section-title">${w("tonight")}</div>
    ${st ? stayCard(st, i) : `<div class="card stay"><p>${esc(t(d.noStay)) || w("noStay")}</p></div>`}
    <section class="card costs" ${d.costs.length ? "" : "hidden"}>
      <div class="costs-head"><h3>${w("estCost")}</h3><span class="big num">${money(total)}</span></div>
      ${d.costs.map(c => `<div class="cost-row"><span>${esc(S.lang === "zh" ? c[0] : c[1])}</span><span>${money(c[2])}</span></div>`).join("")}
      <div class="fineprint">${w("estNote")} ≈ ${other(total)}</div>
    </section>
    <div class="pager">
      <button type="button" data-step="-1" ${i === 0 ? "disabled" : ""}>${w("prev")}</button>
      <button type="button" data-step="1" ${i === T.days.length - 1 ? "disabled" : ""}>${w("next")}</button>
    </div>`;

  const on = $(".day-chip.on");
  if (on) on.scrollIntoView({ block: "nearest", inline: "center" });
}

// ---------- Stays & flights ----------
function renderStays() {
  const fl = T.flights.map(f => {
    const mine = S.flights[f.id] || {};
    const dep = mine.dep || f.dep, arr = mine.arr || f.arr;
    const fd = new Date(f.date + "T00:00:00");
    return `<div class="card flight">
      <div class="flight-top"><span class="flight-code">${esc(f.code)}</span><span class="dur">${esc(f.airline)} · ${longDate(fd)}</span></div>
      <div class="flight-route">
        <div class="apt">${esc(f.from.code)}<small>${esc(t(f.from))}</small></div>
        <div class="line"></div>
        <div class="apt to">${esc(f.to.code)}<small>${esc(t(f.to))}</small></div>
      </div>
      <div class="flight-times">
        <span>${w("dep")} ${dep ? esc(dep) : `<span class="tbd">${w("tbdTime")}</span>`}</span>
        <span>${w("arr")} ${arr ? esc(arr) : `<span class="tbd">${w("tbdTime")}</span>`}</span>
      </div>
      <div class="dur">${esc(t(f.note))}</div>
      ${!dep || !arr ? `<div><button type="button" class="ghost-btn" data-open="settings">${w("fillInSettings")}</button></div>` : ""}
    </div>`;
  }).join("");
  $("#view").innerHTML = `
    <div class="section-title">${w("flights")}</div>${fl}
    <div class="section-title">${w("stayList")}</div>${T.stays.map(s => stayCard(s)).join("")}`;
}

// ---------- Phrases ----------
let phraseCat = 0;
function renderPhrases() {
  const g = T.phrases[phraseCat];
  $("#view").innerHTML = `
    <div class="cats">${T.phrases.map((c, j) => `<button type="button" data-cat="${j}" class="${j === phraseCat ? "on" : ""}">${esc(t(c.cat))}</button>`).join("")}</div>
    <div class="dur" style="padding:0 2px">${w("tapShow")}</div>
    ${g.list.map((p, j) => `<div class="card phrase">
        <div class="jp">${esc(p[0])}</div>
        <div class="ro">${esc(p[1])}</div>
        <div class="mean">${esc(S.lang === "zh" ? p[2] : p[3])}</div>
        <div class="side">
          <button type="button" class="round" data-speak="${j}" aria-label="${w("play")}">${I.speak}</button>
          <button type="button" class="round" data-show="${j}" aria-label="${w("tapShow")}">${I.expand}</button>
        </div>
      </div>`).join("")}
    <div class="card sos">
      <h3>${w("sos")}</h3>
      <div class="sos-nums">
        <span><b>110</b> ${w("police")}</span>
        <span><b>119</b> ${w("ambulance")}</span>
      </div>
      <div class="sos-nums"><span><b>050-3816-2787</b> ${w("hotline")}</span></div>
    </div>`;
}
function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text); u.lang = "ja-JP"; u.rate = .85;
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith("ja")); if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) {}
}
function showBig(p) {
  $("#overlayRoot").innerHTML = `<div class="show-card" role="dialog" aria-modal="true">
    <div><div class="jp">${esc(p[0])}</div><div class="mean">${esc(p[1])}<br>${esc(S.lang === "zh" ? p[2] : p[3])}</div>
    <div class="close"><button type="button" class="primary" data-closebig>${w("close")}</button></div></div></div>`;
}

// ---------- Money ----------
const CATS = ["food", "transport", "stay", "ski", "ticket", "shop", "other"];
let newCat = "food", pendingDel = null;
function renderMoney() {
  const ex = S.expenses;
  const spent = ex.reduce((a, e) => a + toJPY(e.amt, e.cur), 0);
  const budget = T.days.reduce((a, d) => a + d.costs.reduce((b, c) => b + c[2], 0), 0);
  const pct = budget ? Math.min(100, spent / budget * 100) : 0;
  const byCat = CATS.map(c => [c, ex.filter(e => e.cat === c).reduce((a, e) => a + toJPY(e.amt, e.cur), 0)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
  const maxCat = byCat.length ? byCat[0][1] : 1;
  const dayOpts = T.days.map((d, j) => `<option value="${j}" ${j === (todayIdx >= 0 ? todayIdx : S.day) ? "selected" : ""}>D${j + 1} · ${md(dateOf(j))} · ${esc(t(T.regions[d.region]))}</option>`).join("");

  const groups = {};
  ex.forEach(e => (groups[e.day] = groups[e.day] || []).push(e));
  const list = Object.keys(groups).map(Number).sort((a, b) => b - a).map(dj => {
    const rows = groups[dj].slice().sort((a, b) => b.ts - a.ts);
    const sum = rows.reduce((a, e) => a + toJPY(e.amt, e.cur), 0);
    return `<div class="exp-day"><h4><span>D${dj + 1} · ${longDate(dateOf(dj))}</span><span class="num">${money(sum)}</span></h4>
      ${rows.map(e => `<div class="exp">
        <div class="what">${esc(e.note || w("cats")[e.cat])}<small>${esc(w("cats")[e.cat])}</small></div>
        <div class="amt">${money(toJPY(e.amt, e.cur))}<small>${e.cur === "RM" ? "RM " + e.amt.toFixed(2) : "¥" + Math.round(e.amt).toLocaleString("en-US")}</small></div>
        <button type="button" class="del ${pendingDel === e.id ? "confirm" : ""}" data-del="${e.id}" aria-label="${w("del")}">${pendingDel === e.id ? w("sure") : "✕"}</button>
      </div>`).join("")}</div>`;
  }).join("");

  $("#view").innerHTML = `
    <section class="card sum">
      <div class="sum-top">
        <div><small>${w("spent")}</small><div class="big">${money(spent)}</div><small>≈ ${other(spent)}</small></div>
        <div style="text-align:right"><small>${w("budget")}</small><b class="num">${money(budget)}</b><small>${spent <= budget ? `${money(budget - spent)} ${w("left")}` : `${money(spent - budget)} ${w("over")}`}</small></div>
      </div>
      <div class="bar ${spent > budget ? "over" : ""}"><i style="width:${pct}%"></i></div>
      ${byCat.length ? `<h3 style="font-size:14px">${w("byCat")}</h3><div class="cat-rows">${byCat.map(([c, v]) => `<div class="cat-row"><span>${w("cats")[c]}</span><div class="bar"><i style="width:${v / maxCat * 100}%"></i></div><span>${money(v)}</span></div>`).join("")}</div>` : ""}
    </section>
    <form class="card add" id="addForm">
      <h3>${w("addExp")}</h3>
      <div class="field"><label for="amt">${w("amount")}</label>
        <div class="amount-row"><input id="amt" name="amt" type="number" inputmode="decimal" min="0" step="any" required placeholder="0"><select id="amtCur" name="cur"><option value="JPY" ${S.cur === "JPY" ? "selected" : ""}>¥ JPY</option><option value="RM" ${S.cur === "RM" ? "selected" : ""}>RM</option></select></div>
      </div>
      <div class="chips" role="group" aria-label="Category">${CATS.map(c => `<button type="button" data-newcat="${c}" class="${newCat === c ? "on" : ""}">${w("cats")[c]}</button>`).join("")}</div>
      <div class="row">
        <div class="field"><label for="expNote">${w("note")}</label><input id="expNote" name="note" placeholder="${w("notePh")}"></div>
        <div class="field"><label for="expDay">${w("whichDay")}</label><select id="expDay" name="day">${dayOpts}</select></div>
      </div>
      <button class="primary" type="submit">${w("addBtn")}</button>
    </form>
    <section class="card">${ex.length ? list : `<div class="empty">${w("noExp")}</div>`}</section>`;
}

// ---------- Settings ----------
function openSettings() {
  const f = T.flights.map(fl => {
    const m = S.flights[fl.id] || {};
    return `<h3>${esc(fl.code)} · ${esc(fl.from.code)} → ${esc(fl.to.code)} · ${md(new Date(fl.date + "T00:00:00"))}</h3>
      <div class="row">
        <div class="field"><label for="dep-${fl.id}">${w("depTime")}</label><input id="dep-${fl.id}" type="time" data-fl="${fl.id}" data-k="dep" value="${esc(m.dep || fl.dep)}"></div>
        <div class="field"><label for="arr-${fl.id}">${w("arrTime")}</label><input id="arr-${fl.id}" type="time" data-fl="${fl.id}" data-k="arr" value="${esc(m.arr || fl.arr)}"></div>
      </div>`;
  }).join("");
  $("#sheetRoot").innerHTML = `<div class="sheet-bg" data-closesheet></div>
    <form class="sheet" id="settingsForm" role="dialog" aria-modal="true" aria-label="${w("settings")}">
      <h2>${w("settings")}</h2>
      <div class="field"><label for="rate">${w("rateLbl")}</label><input id="rate" type="number" step="0.01" min="0.01" inputmode="decimal" value="${S.rate}"></div>
      <p class="hint">${w("rateHint")}</p>
      <h3 style="font-size:16px;color:var(--fg)">${w("flightTimes")}</h3>
      ${f}
      <button class="primary" type="submit">${w("saveBtn")}</button>
      <h3 style="font-size:16px;color:var(--fg)">${w("installTitle")}</h3>
      <p class="hint" style="margin:0">${w("installHint")}</p>
      <p class="hint" style="margin:0">${w("dataHint")}</p>
    </form>`;
}

// ---------- Events ----------
document.addEventListener("click", e => {
  const el = e.target.closest("button, [data-closesheet]");
  if (!el) return;
  const ds = el.dataset;
  if (el.id === "curJPY") { S.cur = "JPY"; render(); }
  else if (el.id === "curRM") { S.cur = "RM"; render(); }
  else if (el.id === "langZh") { S.lang = "zh"; render(); }
  else if (el.id === "langEn") { S.lang = "en"; render(); }
  else if (el.id === "openSettings" || ds.open === "settings") openSettings();
  else if ("closesheet" in ds) $("#sheetRoot").innerHTML = "";
  else if (ds.tab) { S.tab = ds.tab; pendingDel = null; render(); window.scrollTo(0, 0); }
  else if (ds.day) { S.day = +ds.day; render(); }
  else if (ds.step) { S.day = Math.max(0, Math.min(T.days.length - 1, S.day + +ds.step)); render(); window.scrollTo(0, 0); }
  else if (ds.visit) { S.visited[ds.visit] = !S.visited[ds.visit]; save(); el.classList.toggle("done", S.visited[ds.visit]); el.textContent = S.visited[ds.visit] ? "✓ " + w("visited") : w("markVisited"); }
  else if (ds.editstay) { const f = $(`[data-stayform="${ds.editstay}"]`, el.closest(".stay")); f.hidden = !f.hidden; if (!f.hidden) f.querySelector("input").focus(); }
  else if (ds.cancelstay) { el.closest("form").hidden = true; }
  else if (ds.cat) { phraseCat = +ds.cat; render(); }
  else if (ds.speak) speak(T.phrases[phraseCat].list[+ds.speak][0]);
  else if (ds.show) showBig(T.phrases[phraseCat].list[+ds.show]);
  else if ("closebig" in ds) $("#overlayRoot").innerHTML = "";
  else if (ds.newcat) { newCat = ds.newcat; document.querySelectorAll("[data-newcat]").forEach(b => b.classList.toggle("on", b === el)); }
  else if (ds.del) {
    if (pendingDel === ds.del) { S.expenses = S.expenses.filter(x => x.id !== ds.del); pendingDel = null; }
    else { pendingDel = ds.del; setTimeout(() => { if (pendingDel === ds.del) { pendingDel = null; if (S.tab === "money") render(); } }, 3000); }
    render();
  }
});

document.addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  if (f.id === "addForm") {
    const amt = parseFloat(f.amt.value);
    if (!(amt > 0)) return;
    S.expenses.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), amt, cur: f.cur.value, cat: newCat, note: f.note.value.trim(), day: +f.day.value, ts: Date.now() });
    render(); toast(w("added"));
  } else if (f.id === "settingsForm") {
    const r = parseFloat($("#rate").value); if (r > 0) S.rate = r;
    f.querySelectorAll("[data-fl]").forEach(inp => { S.flights[inp.dataset.fl] = Object.assign({}, S.flights[inp.dataset.fl] || {}, { [inp.dataset.k]: inp.value }); });
    $("#sheetRoot").innerHTML = ""; render(); toast(w("savedT"));
  } else if (f.dataset.stayform) {
    S.stays[f.dataset.stayform] = { name: f.name.value.trim(), addr: f.addr.value.trim() };
    render(); toast(w("savedT"));
  }
});

document.addEventListener("keydown", e => { if (e.key === "Escape") { $("#sheetRoot").innerHTML = ""; $("#overlayRoot").innerHTML = ""; } });

// Swipe between days (not on the map or the day strip)
let sx = null, sy = null;
document.addEventListener("touchstart", e => {
  if (S.tab !== "plan" || e.target.closest(".days, .map-wrap, input, select, textarea")) { sx = null; return; }
  sx = e.touches[0].clientX; sy = e.touches[0].clientY;
}, { passive: true });
document.addEventListener("touchend", e => {
  if (sx == null) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    const n = S.day + (dx < 0 ? 1 : -1);
    if (n >= 0 && n < T.days.length) { S.day = n; render(); window.scrollTo(0, 0); }
  }
}, { passive: true });

window.addEventListener("online", () => S.tab === "plan" && render());
window.addEventListener("offline", () => S.tab === "plan" && render());

render();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
})();

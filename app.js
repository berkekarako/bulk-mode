/* ============ BULK MODE — uygulama mantığı ============ */
"use strict";

/* ---------- storage ---------- */
const STORE_KEY = "bulkTracker.v1";

const defaultState = () => ({
  daily: {},              // { "2026-09-05": { checks: {id:true}, water: 0, bottles: [0.5, 1] } }
  weights: {},            // { "2026-09-05": 74.5 }
  workout: {
    next: "A",
    exHistory: {},        // { "Machine Chest Press": [{d, w}] }
    sessions: []          // [{d, program}]
  },
  gymDays: {},            // { "2026-09-05": true }
  plan: {},               // { "2026-09-07": "A" } — takvimde planlanan program
  market: [],             // [{id, text, done}]
  settings: {
    plannedDays: [],      // haftanın gün indexleri (0=Pzt)
    weightTime: "08:00"
  },
  reminders: {}           // { lastWeight: "2026-09-05", lastGym: 1757... }
});

let state = load();

function load() {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = Object.assign(base, parsed);
      merged.settings = Object.assign(defaultState().settings, parsed.settings || {});
      merged.reminders = parsed.reminders || {};
      merged.plan = parsed.plan || {};
      return merged;
    }
  } catch (e) { /* bozuk veri -> sıfırla */ }
  return base;
}
function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

/* ---------- tarih yardımcıları ---------- */
const pad = n => String(n).padStart(2, "0");
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => keyOf(new Date());

function mondayOf(d) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Pzt=0 ... Paz=6
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function dayData(key) {
  if (!state.daily[key]) state.daily[key] = { checks: {}, water: 0, bottles: [] };
  if (!state.daily[key].bottles) state.daily[key].bottles = [];
  return state.daily[key];
}
const fmtShort = d => `${d.getDate()} ${d.toLocaleDateString("tr-TR", { month: "short" })}`;

/* ---------- veri tanımları ---------- */
const CHECK_GROUPS = {
  breakfastList: [
    { id: "bf-egg", label: "Yumurta (2-3 adet)" },
    { id: "bf-bread", label: "Fırında salçalı kaşarlı ekmek" },
    { id: "bf-nut", label: "Fındık ezmesi / Sarelle", sub: "1 tatlı kaşığı" },
    { id: "bf-oj", label: "Portakal suyu" },
    { id: "bf-cuc", label: "Salatalık" }
  ],
  lunchList: [
    { id: "lunch", label: "Öğün yendi", sub: "İskender / tavuklu makarna önceliği — hamburger en aza" }
  ],
  dinnerList: [
    { id: "dinner", label: "Öğün yendi", sub: "Evde: köfte + pilav · Dışarıda: tavuk / et ağırlıklı" }
  ],
  suppMorning: [{ id: "sp-d3", label: "Vitamin D3" }],
  suppPre: [{ id: "sp-pre", label: "Pre-workout", optional: true }],
  suppPost: [
    { id: "sp-protein", label: "Protein shake" },
    { id: "sp-crea", label: "Creatine Monohydrate" }
  ],
  suppNight: [{ id: "sp-mag", label: "Magnesium Glycinate" }]
};

const MEAL_IDS = ["bf-egg", "bf-bread", "bf-nut", "bf-oj", "bf-cuc", "lunch", "dinner"];

const PROGRAMS = {
  A: {
    name: "A — İtiş",
    ex: [
      { n: "Machine Chest Press", t: "3 × 10" },
      { n: "Shoulder Press Machine", t: "3 × 10" },
      { n: "Pec Deck", t: "3 × 12" },
      { n: "Dambıl Lateral Raise", t: "3 × 15" },
      { n: "Triceps Pushdown (Cable)", t: "3 × 12" }
    ]
  },
  B: {
    name: "B — Çekiş",
    ex: [
      { n: "Lat Pulldown", t: "3 × 10" },
      { n: "Seated Row Machine", t: "3 × 10" },
      { n: "Dambıl Biceps Curl", t: "3 × 12" },
      { n: "Face Pull (Cable)", t: "3 × 15" },
      { n: "Dambıl Shrug", t: "3 × 12" }
    ]
  },
  C: {
    name: "C — Bacak & Karın",
    ex: [
      { n: "Leg Press", t: "3 × 12" },
      { n: "Leg Extension", t: "3 × 12" },
      { n: "Leg Curl", t: "3 × 12" },
      { n: "Calf Raise Machine", t: "3 × 15" },
      { n: "Plank", t: "3 × 45 sn", bodyweight: true }
    ]
  }
};
const CYCLE = ["A", "B", "C"];
const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const WEEK_GOAL = 3;
const BOTTLES = [0.5, 1, 1.5];
const WATER_GOAL = 3; // litre

/* ---------- genel UI ---------- */
const $ = id => document.getElementById(id);

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2400);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

/* sekmeler */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    $("page-" + btn.dataset.page).classList.remove("hidden");
    window.scrollTo(0, 0);
  });
});

/* segmentler (Bugün sayfası) */
document.querySelectorAll(".seg").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg").forEach(b => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".seg-page").forEach(p => p.classList.add("hidden"));
    $("seg-" + btn.dataset.seg).classList.remove("hidden");
  });
});

function renderHeader() {
  $("headerDate").textContent = new Date().toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", weekday: "long"
  });
}

/* ---------- checkbox listeleri ---------- */
function renderChecks() {
  const d = dayData(todayKey());
  for (const [containerId, items] of Object.entries(CHECK_GROUPS)) {
    const wrap = $(containerId);
    wrap.innerHTML = "";
    for (const item of items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "check-item" + (d.checks[item.id] ? " checked" : "");
      btn.innerHTML =
        `<span class="box">${d.checks[item.id] ? "✓" : ""}</span>` +
        `<span class="txt">${item.label}${item.sub ? `<span class="sub">${item.sub}</span>` : ""}</span>` +
        (item.optional ? `<span class="opt">opsiyonel</span>` : "");
      btn.addEventListener("click", () => {
        const dd = dayData(todayKey());
        dd.checks[item.id] = !dd.checks[item.id];
        save();
        renderChecks();
      });
      wrap.appendChild(btn);
    }
  }
}

/* ---------- su (şişe sistemi) ---------- */
function bottleSVG(liters) {
  // boyut şişe hacmiyle büyür
  const h = liters === 0.5 ? 30 : liters === 1 ? 40 : 50;
  const y0 = 52 - h;
  return `<svg viewBox="0 0 28 54" class="bottle-svg" style="height:${h + 10}px" aria-hidden="true">
    <rect x="10" y="${y0}" width="8" height="4" rx="1" class="b-cap"/>
    <path d="M11 ${y0 + 4} L9 ${y0 + 9} L9 50 Q9 52 11 52 L17 52 Q19 52 19 50 L19 ${y0 + 9} L17 ${y0 + 4} Z" class="b-body"/>
    <path d="M11 ${y0 + 14} Q14 ${y0 + 16} 17 ${y0 + 14}" class="b-line"/>
  </svg>`;
}

function dayLiters(key) {
  const dd = state.daily[key];
  if (!dd) return 0;
  const b = (dd.bottles || []).reduce((s, v) => s + v, 0);
  return b + (dd.water || 0) * 0.25; // eski bardak kayıtları ~0.25L
}

function renderWater() {
  const tk = todayKey();
  const d = dayData(tk);
  const total = dayLiters(tk);

  $("waterTag").textContent = total >= WATER_GOAL
    ? `${total.toFixed(1)} L ✓`
    : `${total.toFixed(1)} / ${WATER_GOAL} L`;

  const bar = $("bottleBar");
  bar.innerHTML = "";
  for (const l of BOTTLES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bottle-btn";
    btn.innerHTML = bottleSVG(l) + `<span class="bottle-label">${l} L</span>`;
    btn.addEventListener("click", () => {
      dayData(todayKey()).bottles.push(l);
      save();
      renderWater(); renderCalendar(); renderReport();
      const t2 = dayLiters(todayKey());
      toast(t2 >= WATER_GOAL ? `Su hedefi tamam! 💧 ${t2.toFixed(1)} L` : `+${l} L — toplam ${t2.toFixed(1)} L`);
    });
    bar.appendChild(btn);
  }

  const log = $("bottleLog");
  log.innerHTML = "";
  if (!d.bottles.length) {
    log.innerHTML = `<span class="bottle-empty">Bugün henüz şişe eklenmedi.</span>`;
  } else {
    d.bottles.forEach((l, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "bottle-logged";
      b.title = "Kaldır";
      b.innerHTML = bottleSVG(l) + `<span class="bottle-label">${l}</span>`;
      b.addEventListener("click", () => {
        dayData(todayKey()).bottles.splice(i, 1);
        save();
        renderWater(); renderCalendar(); renderReport();
        toast(`-${l} L kaldırıldı`);
      });
      log.appendChild(b);
    });
  }
}

/* ---------- kilo ---------- */
function sortedWeightKeys() {
  return Object.keys(state.weights).sort();
}

function renderWeight() {
  const tk = todayKey();
  const today = state.weights[tk];
  $("weightTodayTag").textContent = today ? `${today} kg ✓` : "girilmedi";
  $("weightInput").value = today || "";
  $("weightHint").textContent = today
    ? "Bugünün kaydı alındı — değiştirmek istersen yeni değeri yazıp kaydet."
    : `Her gün saat ${state.settings.weightTime} civarı tartıl, sabit saat en sağlıklı takip.`;

  const keys = sortedWeightKeys();

  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  const monthKeys = keys.filter(k => k >= keyOf(cutoff));
  if (monthKeys.length >= 2) {
    const delta = state.weights[monthKeys[monthKeys.length - 1]] - state.weights[monthKeys[0]];
    $("weightDeltaTag").textContent = `30 gün: ${delta >= 0 ? "+" : ""}${delta.toFixed(1)} kg`;
  } else {
    $("weightDeltaTag").textContent = "30 gün: —";
  }

  const chart = $("weightChart");
  const pts = keys.slice(-30).map(k => ({ k, v: state.weights[k] }));
  if (pts.length < 2) {
    chart.innerHTML = `<div class="weight-empty">Grafik için en az 2 kayıt gerekli. Her gün gir, gidişatı burada gör. 📈</div>`;
  } else {
    const w = 300, h = 90, padX = 6, padT = 12, padB = 16;
    const vals = pts.map(p => p.v);
    const min = Math.min(...vals), max = Math.max(...vals);
    const span = (max - min) || 1;
    const x = i => padX + i * (w - 2 * padX) / (pts.length - 1);
    const y = v => padT + (1 - (v - min) / span) * (h - padT - padB);
    const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
    const lastP = pts[pts.length - 1];
    chart.innerHTML =
      `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
         <path class="wline" d="${line}"/>
         <circle class="wdot" cx="${x(pts.length - 1).toFixed(1)}" cy="${y(lastP.v).toFixed(1)}" r="3.5"/>
         <text class="wtext" x="${padX}" y="${h - 4}">${min.toFixed(1)}–${max.toFixed(1)} kg · son ${pts.length} kayıt</text>
       </svg>`;
  }

  const recent = $("weightRecent");
  recent.innerHTML = "";
  const lastKeys = keys.slice(-5).reverse();
  for (const k of lastKeys) {
    const idx = keys.indexOf(k);
    const prev = idx > 0 ? state.weights[keys[idx - 1]] : null;
    const delta = prev !== null ? state.weights[k] - prev : null;
    const [yy, mm, dd] = k.split("-");
    const row = document.createElement("div");
    row.className = "weight-row";
    row.innerHTML =
      `<span class="wd">${dd}.${mm}.${yy}</span>
       <span class="wv">${state.weights[k]} kg` +
      (delta !== null
        ? `<span class="wdelta ${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "+" : ""}${delta.toFixed(1)}</span>`
        : "") +
      `</span>`;
    recent.appendChild(row);
  }
}

$("weightSave").addEventListener("click", () => {
  const v = parseFloat($("weightInput").value);
  if (isNaN(v) || v < 20 || v > 300) { toast("Geçerli bir kilo gir (20–300 kg)"); return; }
  state.weights[todayKey()] = Math.round(v * 10) / 10;
  save();
  renderWeight(); renderCalendar(); renderReport();
  hideBanner();
  toast(`Kilo kaydedildi: ${state.weights[todayKey()]} kg ⚖️`);
});

/* ---------- antrenman ---------- */
const openDetails = new Set();

/* bugüne takvimden plan atandıysa rotasyonun önüne geçer */
function currentLetter() {
  const tk = todayKey();
  if (state.plan[tk] && !state.gymDays[tk]) return state.plan[tk];
  return state.workout.next;
}

function renderWorkout() {
  const letter = currentLetter();
  const planned = state.plan[todayKey()] === letter && letter !== state.workout.next;
  const prog = PROGRAMS[letter];
  $("programLetter").textContent = letter;
  $("programName").textContent = prog.name;
  document.querySelector(".program-sub").textContent =
    planned ? "Bugün planlanan (takvim)" : "Sıradaki antrenman";

  $("cycleStrip").innerHTML = CYCLE.map(l =>
    `<div class="cycle-step${l === letter ? " now" : ""}">${PROGRAMS[l].name}</div>`
  ).join("");

  const list = $("exerciseList");
  list.innerHTML = "";
  for (const ex of prog.ex) {
    const hist = state.workout.exHistory[ex.n] || [];
    const last = hist.length ? hist[hist.length - 1] : null;
    const trend = hist.slice(-3).map(h => h.w).join(" → ");
    const improving = hist.length >= 2 && hist[hist.length - 1].w > hist[hist.length - 2].w;
    const isOpen = openDetails.has(ex.n);

    const card = document.createElement("div");
    card.className = "exercise" + (isOpen ? " open" : "");
    card.innerHTML =
      `<button type="button" class="exercise-top">
         <div class="exercise-name">${ex.n}</div>
         <div class="exercise-target">${ex.t}</div>
         <div class="exercise-chevron">▾</div>
       </button>
       <div class="exercise-bottom">
         <input class="weight-input" type="number" inputmode="decimal" step="0.5" min="0"
                placeholder="${last ? last.w : "—"}" data-ex="${ex.n}"
                aria-label="${ex.n} ağırlık">
         <span class="weight-kg">${ex.bodyweight ? "sn/kg" : "kg"}</span>
         <div class="weight-hist">
           ${last ? `<div class="last">Son: ${last.w}${ex.bodyweight ? "" : " kg"}</div>` : `<div class="last muted">İlk seans</div>`}
           ${trend ? `<div class="trend${improving ? " up" : ""}">${trend}${improving ? " ▲" : ""}</div>` : ""}
         </div>
       </div>
       ${isOpen ? exerciseDetailHTML(ex.n) : ""}`;

    card.querySelector(".exercise-top").addEventListener("click", () => {
      if (openDetails.has(ex.n)) openDetails.delete(ex.n);
      else openDetails.add(ex.n);
      const entered = {};
      document.querySelectorAll(".weight-input[data-ex]").forEach(i => { if (i.value) entered[i.dataset.ex] = i.value; });
      renderWorkout();
      document.querySelectorAll(".weight-input[data-ex]").forEach(i => { if (entered[i.dataset.ex]) i.value = entered[i.dataset.ex]; });
    });

    list.appendChild(card);
  }

  const sessions = state.workout.sessions;
  $("finishHint").textContent = sessions.length
    ? `Toplam ${sessions.length} antrenman tamamlandı`
    : "Harekete dokun: makine animasyonu + çalışan kaslar. Ağırlığı gir, bitince butona bas.";
}

$("finishWorkout").addEventListener("click", () => {
  const letter = currentLetter();
  const tk = todayKey();

  let saved = 0;
  document.querySelectorAll(".weight-input[data-ex]").forEach(inp => {
    const v = parseFloat(inp.value);
    if (!isNaN(v) && v > 0) {
      const name = inp.dataset.ex;
      if (!state.workout.exHistory[name]) state.workout.exHistory[name] = [];
      state.workout.exHistory[name].push({ d: tk, w: v });
      saved++;
    }
  });

  state.workout.sessions.push({ d: tk, program: letter });
  state.gymDays[tk] = true;
  delete state.plan[tk]; // plan yerine getirildi
  state.workout.next = CYCLE[(CYCLE.indexOf(letter) + 1) % CYCLE.length];
  save();

  renderWorkout();
  renderCalendar();
  renderReport();
  hideBanner();
  toast(`${PROGRAMS[letter].name} tamam! 💪 Sıradaki: ${state.workout.next}` +
        (saved ? ` · ${saved} ağırlık kaydedildi` : ""));
});

/* ---------- hafta yardımcıları ---------- */
function weekMeta(offsetWeeks = 0) {
  const mon = mondayOf(new Date());
  mon.setDate(mon.getDate() + offsetWeeks * 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    days.push(d);
  }
  return days;
}
const gymCount = days => days.filter(d => state.gymDays[keyOf(d)]).length;

function calcStreak() {
  let streak = 0;
  if (gymCount(weekMeta(0)) >= WEEK_GOAL) streak++;
  for (let i = -1; i > -520; i--) {
    if (gymCount(weekMeta(i)) >= WEEK_GOAL) streak++;
    else break;
  }
  return streak;
}

/* ---------- takvim + sürükle-bırak planlama ---------- */
let calOffset = 0;

function sessionLetterOf(key) {
  for (let i = state.workout.sessions.length - 1; i >= 0; i--) {
    if (state.workout.sessions[i].d === key) return state.workout.sessions[i].program;
  }
  return null;
}

function renderCalendar() {
  const days = weekMeta(calOffset);
  const tk = todayKey();
  const now = new Date(); now.setHours(0, 0, 0, 0);

  $("weekRange").textContent =
    `${fmtShort(days[0])} – ${fmtShort(days[6])}` + (calOffset === 0 ? "" : "");
  $("calToday").classList.toggle("hidden", calOffset === 0);

  // program kaynak çipleri
  const chips = $("planChips");
  chips.innerHTML = "";
  for (const l of CYCLE) {
    const c = document.createElement("div");
    c.className = "plan-chip";
    c.textContent = PROGRAMS[l].name;
    c.dataset.letter = l;
    attachDrag(c, l, null);
    chips.appendChild(c);
  }

  // gün satırları
  const rows = $("calRows");
  rows.innerHTML = "";
  days.forEach((d, i) => {
    const k = keyOf(d);
    const done = !!state.gymDays[k];
    const doneLetter = done ? sessionLetterOf(k) : null;
    const plan = state.plan[k];
    const liters = dayLiters(k);
    const weight = state.weights[k];
    const isToday = k === tk;

    const row = document.createElement("div");
    row.className = "cal-row"
      + (isToday ? " cal-today" : "")
      + (state.settings.plannedDays.includes(i) ? " cal-target" : "")
      + (d > now ? " cal-future" : "");
    row.dataset.key = k;

    const badges = [];
    if (done) badges.push(`<button type="button" class="cal-badge cb-done" data-act="undone">💪 ${doneLetter || "✓"}</button>`);
    if (plan) badges.push(`<span class="cal-badge cb-plan" data-plan="${plan}">${plan} · ${PROGRAMS[plan].name.split("— ")[1]}</span>`);
    if (liters > 0) badges.push(`<span class="cal-badge cb-info">💧 ${liters.toFixed(1)}L</span>`);
    if (weight) badges.push(`<span class="cal-badge cb-info">⚖️ ${weight}</span>`);

    row.innerHTML =
      `<div class="cal-day">
         <span class="cal-dname">${DAY_NAMES[i]}</span>
         <span class="cal-dnum">${d.getDate()}</span>
       </div>
       <div class="cal-badges">${badges.join("") || `<span class="cal-empty">—</span>`}</div>
       ${done ? "" : `<button type="button" class="cal-mark" data-act="done" title="Gidilmiş işaretle">💪</button>`}`;

    // yapıldı işaretle / geri al
    const markBtn = row.querySelector('[data-act="done"]');
    if (markBtn) markBtn.addEventListener("click", () => {
      state.gymDays[k] = true;
      save(); renderCalendar(); renderReport(); renderWorkout();
    });
    const undoneBtn = row.querySelector('[data-act="undone"]');
    if (undoneBtn) undoneBtn.addEventListener("click", () => {
      delete state.gymDays[k];
      save(); renderCalendar(); renderReport(); renderWorkout();
    });

    // planlanan rozet: sürüklenebilir (taşı) / dokun (kaldır)
    const planBadge = row.querySelector(".cb-plan");
    if (planBadge) attachDrag(planBadge, plan, k);

    rows.appendChild(row);
  });

  $("plannedDaysHint").innerHTML = state.settings.plannedDays.length
    ? `Sabit spor günlerin: <b>${state.settings.plannedDays.map(i => DAY_NAMES[i]).join(" · ")}</b> — plan rozetine dokunursan kaldırılır.`
    : `Programı (A/B/C) yukarıdan tutup bir güne bırak. Plan rozetine dokunursan kaldırılır; rozetleri günler arasında da taşıyabilirsin.`;

  // ilerleme (görünen hafta)
  const count = gymCount(days);
  $("weekCountLabel").textContent = `${count} / ${WEEK_GOAL} antrenman` + (calOffset === 0 ? "" : " (bu hafta değil)");
  $("weekStatusLabel").textContent =
    count >= WEEK_GOAL ? "Hedef tamam ✓" : (calOffset < 0 ? "Hedef kaçtı" : `${WEEK_GOAL - count} kaldı`);
  $("weekProgressFill").style.width = Math.min(100, (count / WEEK_GOAL) * 100) + "%";

  $("streakNum").textContent = calcStreak();
}

$("calPrev").addEventListener("click", () => { calOffset--; renderCalendar(); });
$("calNext").addEventListener("click", () => { calOffset++; renderCalendar(); });
$("calToday").addEventListener("click", () => { calOffset = 0; renderCalendar(); });

/* --- pointer tabanlı sürükle-bırak (dokunmatik uyumlu) --- */
let drag = null;

function attachDrag(el, letter, fromKey) {
  el.style.touchAction = "none";
  el.addEventListener("pointerdown", e => {
    e.preventDefault();
    const ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    ghost.textContent = PROGRAMS[letter].name;
    document.body.appendChild(ghost);
    drag = { letter, fromKey, ghost, moved: false, x0: e.clientX, y0: e.clientY };
    positionGhost(e.clientX, e.clientY);
  });
}
function positionGhost(x, y) {
  drag.ghost.style.left = x + "px";
  drag.ghost.style.top = y + "px";
}
function rowAtPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  return el ? el.closest(".cal-row") : null;
}
window.addEventListener("pointermove", e => {
  if (!drag) return;
  if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) > 8) drag.moved = true;
  positionGhost(e.clientX, e.clientY);
  document.querySelectorAll(".cal-row.drop-hover").forEach(r => r.classList.remove("drop-hover"));
  const row = rowAtPoint(e.clientX, e.clientY);
  if (row) row.classList.add("drop-hover");
});
window.addEventListener("pointerup", e => {
  if (!drag) return;
  const { letter, fromKey, ghost, moved } = drag;
  ghost.remove();
  document.querySelectorAll(".cal-row.drop-hover").forEach(r => r.classList.remove("drop-hover"));
  const row = moved ? rowAtPoint(e.clientX, e.clientY) : null;

  if (moved && row) {
    const key = row.dataset.key;
    state.plan[key] = letter;
    if (fromKey && fromKey !== key) delete state.plan[fromKey];
    toast(`${PROGRAMS[letter].name} → ${formatKeyShort(key)} planlandı 📅`);
  } else if (moved && fromKey) {
    delete state.plan[fromKey];
    toast("Plan kaldırıldı");
  } else if (!moved && fromKey) {
    delete state.plan[fromKey];
    toast("Plan kaldırıldı");
  } else if (!moved) {
    toast("Programı tutup bir günün üzerine sürükle 👆");
  }
  drag = null;
  save();
  renderCalendar(); renderWorkout();
});
window.addEventListener("pointercancel", () => {
  if (!drag) return;
  drag.ghost.remove();
  document.querySelectorAll(".cal-row.drop-hover").forEach(r => r.classList.remove("drop-hover"));
  drag = null;
});
function formatKeyShort(k) {
  const [y, m, d] = k.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_NAMES[(date.getDay() + 6) % 7]} ${d}`;
}

/* ---------- haftalık rapor ---------- */
function weekWater(days) {
  return days.reduce((sum, d) => sum + dayLiters(keyOf(d)), 0);
}
function weekMealRatio(days) {
  const now = new Date(); now.setHours(23, 59, 59, 0);
  let done = 0, total = 0;
  for (const d of days) {
    if (d > now) continue;
    total += MEAL_IDS.length;
    const dd = state.daily[keyOf(d)];
    if (dd) done += MEAL_IDS.filter(id => dd.checks[id]).length;
  }
  return total ? Math.round(100 * done / total) : 0;
}

function renderReport() {
  const thisW = weekMeta(0), lastW = weekMeta(-1);

  const water = weekWater(thisW), waterLast = weekWater(lastW);
  const elapsed = thisW.filter(d => d <= new Date()).length || 1;

  const count = gymCount(thisW);
  const programs = state.workout.sessions
    .filter(s => thisW.some(d => keyOf(d) === s.d))
    .map(s => s.program).join(", ");

  const mealPct = weekMealRatio(thisW);

  const keys = sortedWeightKeys();
  const monStr = keyOf(thisW[0]), sunStr = keyOf(thisW[6]);
  const wkKeys = keys.filter(k => k >= monStr && k <= sunStr);
  let weightWeekTxt = "bu hafta kayıt yok";
  if (wkKeys.length >= 2) {
    const dw = state.weights[wkKeys[wkKeys.length - 1]] - state.weights[wkKeys[0]];
    weightWeekTxt = `bu hafta ${dw >= 0 ? "+" : ""}${dw.toFixed(1)} kg`;
  } else if (wkKeys.length === 1) {
    weightWeekTxt = `bu hafta tek kayıt: ${state.weights[wkKeys[0]]} kg`;
  }
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  const moKeys = keys.filter(k => k >= keyOf(cutoff));
  let weightMonthTxt = "30 günlük veri yok";
  if (moKeys.length >= 2) {
    const dm = state.weights[moKeys[moKeys.length - 1]] - state.weights[moKeys[0]];
    weightMonthTxt = `son 30 gün ${dm >= 0 ? "+" : ""}${dm.toFixed(1)} kg`;
  }

  const rows = [
    {
      ico: "💧",
      main: `${water.toFixed(1)} L su içtin`,
      sub: `günde ort. ${(water / elapsed).toFixed(1)} L · geçen hafta ${waterLast.toFixed(1)} L`
    },
    {
      ico: "🏋️",
      main: count >= WEEK_GOAL
        ? `Antrenman hedefi tamam: ${count}/${WEEK_GOAL} ✓`
        : `Antrenman: ${count}/${WEEK_GOAL} — ${WEEK_GOAL - count} seans kaldı`,
      sub: programs ? `tamamlanan programlar: ${programs}` : "bu hafta henüz program tamamlanmadı"
    },
    {
      ico: "🍽",
      main: `Beslenme listesinin %${mealPct}'i işaretlendi`,
      sub: "bugüne kadarki günler üzerinden"
    },
    {
      ico: "⚖️",
      main: weightWeekTxt,
      sub: weightMonthTxt
    }
  ];

  $("reportBody").innerHTML = rows.map(r =>
    `<div class="report-row">
       <div class="report-ico">${r.ico}</div>
       <div><div class="report-main">${r.main}</div><div class="report-sub">${r.sub}</div></div>
     </div>`
  ).join("");
}

/* ---------- ayarlar ---------- */
function renderSettings() {
  const chips = $("dayChips");
  chips.innerHTML = "";
  DAY_NAMES.forEach((name, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "day-chip" + (state.settings.plannedDays.includes(i) ? " on" : "");
    b.textContent = name;
    b.addEventListener("click", () => {
      const arr = state.settings.plannedDays;
      const idx = arr.indexOf(i);
      if (idx >= 0) arr.splice(idx, 1);
      else { arr.push(i); arr.sort((a, b2) => a - b2); }
      save();
      renderSettings(); renderCalendar();
    });
    chips.appendChild(b);
  });

  $("weightTimeInput").value = state.settings.weightTime;
  renderNotifStatus();
}

$("weightTimeInput").addEventListener("change", e => {
  state.settings.weightTime = e.target.value || "08:00";
  save();
  renderWeight();
  toast(`Kilo hatırlatması: ${state.settings.weightTime}`);
});

function notifSupported() {
  return "Notification" in window;
}
function renderNotifStatus() {
  const s = $("notifStatus"), b = $("notifBtn");
  if (!notifSupported()) {
    s.textContent = "bu tarayıcıda yok — ana ekrana ekleyince açılır (iOS 16.4+)";
    b.disabled = true;
    return;
  }
  const p = Notification.permission;
  s.textContent = p === "granted" ? "izin verildi ✓" : (p === "denied" ? "reddedildi — tarayıcı ayarından aç" : "izin bekleniyor");
  b.disabled = p === "granted";
}
$("notifBtn").addEventListener("click", async () => {
  if (!notifSupported()) return;
  await Notification.requestPermission();
  renderNotifStatus();
  if (Notification.permission === "granted") notify("Bildirimler açık 🔔", "Kilo ve spor hatırlatmaları buradan gelecek.");
});

async function notify(title, body) {
  try {
    if (notifSupported() && Notification.permission === "granted") {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) { await reg.showNotification(title, { body, icon: "icons/icon-192.png", badge: "icons/icon-192.png" }); return; }
      new Notification(title, { body, icon: "icons/icon-192.png" });
    }
  } catch (e) { /* sessizce geç — banner zaten görünüyor */ }
}

/* ---------- hatırlatma motoru ---------- */
function showBanner(text) {
  $("bannerText").textContent = text;
  $("reminderBanner").classList.remove("hidden");
}
function hideBanner() { $("reminderBanner").classList.add("hidden"); }
$("bannerClose").addEventListener("click", hideBanner);

function checkReminders() {
  const now = new Date();
  const tk = todayKey();

  // 1) kilo hatırlatması
  const [hh, mm] = (state.settings.weightTime || "08:00").split(":").map(Number);
  const due = now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm);
  if (due && !state.weights[tk] && state.reminders.lastWeight !== tk) {
    state.reminders.lastWeight = tk;
    save();
    showBanner("⚖️ Kilonu girmeyi unutma — Bugün › Kilo sekmesi.");
    notify("Kilo zamanı ⚖️", "Bugünkü kilonu girmeyi unutma.");
  }

  // 2) spor günü: ayarlardaki sabit günler VEYA takvimde bugüne plan varsa
  const weekIdx = (now.getDay() + 6) % 7;
  const gymToday = state.settings.plannedDays.includes(weekIdx) || !!state.plan[tk];
  if (gymToday && !state.gymDays[tk] && now.getHours() >= 9 && now.getHours() < 22) {
    const last = state.reminders.lastGym || 0;
    if (Date.now() - last >= 55 * 60 * 1000) {
      state.reminders.lastGym = Date.now();
      save();
      const p = state.plan[tk];
      const msg = p ? `🏋️ Bugün ${PROGRAMS[p].name} planlı — antrenmana gitmeyi unutma!`
                    : "🏋️ Bugün spor günü — antrenmana gitmeyi unutma!";
      showBanner(msg);
      notify("Spor günü 🏋️", p ? `Bugün ${PROGRAMS[p].name} var, unutma!` : "Bugün antrenman var, unutma!");
    }
  }
}

/* ---------- gece yarısı yenileme ---------- */
let currentDay = todayKey();
setInterval(() => {
  if (todayKey() !== currentDay) {
    currentDay = todayKey();
    renderAll();
    toast("Yeni gün başladı 🌅");
  }
  checkReminders();
}, 60 * 1000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    if (todayKey() !== currentDay) { currentDay = todayKey(); renderAll(); }
    checkReminders();
  }
});

/* ---------- market ---------- */
function renderMarket() {
  const list = $("marketList");
  list.innerHTML = "";
  if (!state.market.length) {
    list.innerHTML = `<div class="market-empty">Liste boş — yukarıdan ürün ekle.</div>`;
  }
  for (const item of state.market) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "check-item" + (item.done ? " checked" : "");
    row.innerHTML =
      `<span class="box">${item.done ? "✓" : ""}</span>` +
      `<span class="txt">${escapeHtml(item.text)}</span>`;
    row.addEventListener("click", () => {
      item.done = !item.done;
      save(); renderMarket();
    });
    list.appendChild(row);
  }
  const doneCount = state.market.filter(i => i.done).length;
  $("marketCount").textContent = `${state.market.length - doneCount} kalan`;
  $("clearDone").classList.toggle("hidden", doneCount === 0);
}

$("marketForm").addEventListener("submit", e => {
  e.preventDefault();
  const inp = $("marketInput");
  const text = inp.value.trim();
  if (!text) return;
  state.market.push({ id: Date.now(), text, done: false });
  inp.value = "";
  save(); renderMarket();
});

$("clearDone").addEventListener("click", () => {
  state.market = state.market.filter(i => !i.done);
  save(); renderMarket();
});

/* ---------- başlat ---------- */
function renderAll() {
  renderHeader();
  renderChecks();
  renderWater();
  renderWeight();
  renderWorkout();
  renderCalendar();
  renderReport();
  renderSettings();
}
renderAll();
checkReminders();

/* ---------- service worker ---------- */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

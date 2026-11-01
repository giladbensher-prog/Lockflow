/* LOCKFLOW — the daily app.
   React (UMD global) + the LOCKFLOW component bundle (window.LOCKFLOWDesignSystem_076a4d).
   All data lives in this browser (localStorage). iPhone data (calendar, reminders, health)
   arrives through the URL fragment (#sync=...) from the LOCKFLOW shortcut — fragments are
   never sent to the server.
   Build: ./build.sh  →  app.js */
(function () {
  if (!window.React || !window.ReactDOM || !window.LOCKFLOWDesignSystem_076a4d) {
    document.getElementById('root').innerHTML =
      '<p style="padding:32px 20px;color:#a1a1a6;font:15px system-ui">LOCKFLOW needs a connection the first time it opens. Connect and reload.</p>';
    return;
  }
  const { useState, useEffect } = React;
  const {
    Card, TaskItem, Anchor, ProgressRing, DotGrid, LineChart, Stat, FloatingBar, DailyReport,
  } = window.LOCKFLOWDesignSystem_076a4d;

  const SECTIONS = ['GYM', 'BIZ', 'SOCIAL'];
  const TABS = ['TODAY', ...SECTIONS];
  const KEY = 'lockflow:v1';
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAYKEY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const SPORTS = ['Running', 'Gym', 'Cycling', 'Swimming', 'Football', 'Basketball', 'Tennis', 'Padel',
    'Yoga', 'Pilates', 'Martial arts', 'CrossFit', 'Climbing', 'Walking'];
  const CONTENT = ['Talking head', 'Tutorials', 'Behind the scenes', 'Before / after', 'Day in the life',
    'Product', 'Reviews', 'Podcast clips', 'Trends'];
  const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', url: (h) => `https://instagram.com/${h}` },
    { id: 'tiktok', label: 'TikTok', url: (h) => `https://tiktok.com/@${h}` },
    { id: 'youtube', label: 'YouTube', url: (h) => `https://youtube.com/@${h}` },
    { id: 'facebook', label: 'Facebook', url: (h) => `https://facebook.com/${h}` },
    { id: 'linkedin', label: 'LinkedIn', url: (h) => `https://linkedin.com/in/${h}` },
    { id: 'x', label: 'X', url: (h) => `https://x.com/${h}` },
  ];

  /* ---------- dates ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dateOf = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const longDate = (d) => `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const lastDays = (today, n) => Array.from({ length: n }, (_, i) => keyOf(addDays(dateOf(today), i - n + 1)));

  /* ---------- numbers from Shortcuts (locale-agnostic) ---------- */
  function toInt(v) {
    if (v == null) return null;
    const s = String(v).split(/[.,](?=\d{1,2}(\D|$))/)[0].replace(/[^\d]/g, '');
    return s ? parseInt(s, 10) : null;
  }
  function toDec(v) {
    if (v == null) return null;
    let s = String(v).trim().replace(/[^\d.,-]/g, '');
    if (!s) return null;
    const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
    if (lc > -1 && ld > -1) {
      const dec = lc > ld ? ',' : '.';
      s = s.split(dec === ',' ? '.' : ',').join('').replace(dec, '.');
    } else if (lc > -1) {
      const after = s.length - lc - 1;
      s = s.split(',').length === 2 && after <= 2 ? s.replace(',', '.') : s.split(',').join('');
    }
    const n = parseFloat(s);
    return isFinite(n) ? n : null;
  }
  const round1 = (n) => Math.round(n * 10) / 10;

  /* ---------- sync payload ----------
     One record per line, fields split by "|":
       T|yyyy-MM-dd            date of the data
       E|HH:mm|HH:mm|title     calendar event today (00:00|00:00 = all day)
       R|list|title            reminder due today
       S|steps   K|km   M|exercise minutes                               */
  function parseSync(text) {
    const out = { date: null, events: [], reminders: [], steps: null, km: null, exMin: null };
    String(text).split(/\r?\n/).forEach((raw) => {
      const line = raw.trim();
      if (!line) return;
      const parts = line.split('|');
      const t = parts[0].trim().toUpperCase();
      const val = (parts[1] || '').trim();
      if (t === 'T') { if (/^\d{4}-\d{2}-\d{2}$/.test(val)) out.date = val; }
      else if (t === 'E') {
        const title = parts.slice(3).join('|').trim();
        if (title) out.events.push({ start: val, end: (parts[2] || '').trim(), title });
      } else if (t === 'R') {
        const title = parts.slice(2).join('|').trim();
        if (title) out.reminders.push({ list: val, title });
      } else if (t === 'S') out.steps = toInt(val);
      else if (t === 'K') out.km = toDec(val);
      else if (t === 'M') out.exMin = toInt(val);
    });
    out.events.sort((a, b) => (a.start || '').localeCompare(b.start || ''));
    return out;
  }
  function readHashSync() {
    const h = location.hash;
    if (!h || h.length < 2) return null;
    const value = new URLSearchParams(h.slice(1)).get('sync');
    if (value == null) return null;
    history.replaceState(null, '', location.pathname + location.search);
    return value;
  }
  const isAllDay = (e) => (!e.start && !e.end) || (e.start === '00:00' && (e.end === '00:00' || e.end === '23:59'));
  function syncSummary(p) {
    const bits = [`${p.events.length} event${p.events.length === 1 ? '' : 's'}`, `${p.reminders.length} reminder${p.reminders.length === 1 ? '' : 's'}`];
    if (p.steps != null) bits.push(`${p.steps.toLocaleString('de-DE')} steps`);
    return 'Synced · ' + bits.join(' · ');
  }
  function samplePayload(today) {
    return [
      `T|${today}`, 'S|6420', 'K|4,8', 'M|34',
      'E|09:30|10:00|Standup with the team', 'E|13:00|14:00|ארוחת צהריים עם דנה', 'E|18:30|19:30|Long run, easy pace',
      'R|Work|Reply to store supplier', 'R|אישי|להתקשר לאמא',
    ].join('\n');
  }

  /* ---------- state ---------- */
  const emptySection = () => ({ anchor: null, tasks: [] });
  const emptyDay = () => ({ GYM: emptySection(), BIZ: emptySection(), SOCIAL: emptySection() });
  const defaults = () => ({
    v: 1, days: {}, health: {}, sync: null, settings: { weekGoal: 4, pmHour: 16 },
    profile: null, onboarding: null, plans: {},
  });

  /* ---------- weeks (Sunday → Saturday) ---------- */
  const weekOf = (k) => keyOf(addDays(dateOf(k), -dateOf(k).getDay()));
  const nextWeekOf = (k) => keyOf(addDays(dateOf(weekOf(k)), 7));
  const weekDays = (wk) => Array.from({ length: 7 }, (_, i) => keyOf(addDays(dateOf(wk), i)));
  const shortDate = (k) => { const d = dateOf(k); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };

  /* ---------- profile (from onboarding) ----------
     gym.days: fixed training days, or [] with gym.perWeek for a schedule that moves.
     gym.planner: 'ai' (AI plans) · 'mix' (AI drafts, you shape it) · 'self' (your own plan). */
  const PLANNERS = {
    ai: 'AI plans your training',
    mix: 'AI drafts, you shape it',
    self: 'You plan your own training',
  };
  const emptyProfile = () => ({
    gym: { sports: [], other: '', days: [], perWeek: null, planner: null, conditions: '', minutes: null, firstPlan: null },
    biz: { name: '', what: '', stage: '', focus: '', next: [] },
    social: { postsPerWeek: 3, platforms: {}, types: [], other: '', style: '', ideas: [], note: '' },
  });
  function mergeProfile(p) {
    if (!p) return null;
    const e = emptyProfile();
    const gym = { ...e.gym, ...(p.gym || {}) };
    if (gym.planner === 'claude') gym.planner = 'ai';
    return { ...p, gym, biz: { ...e.biz, ...(p.biz || {}) }, social: { ...e.social, ...(p.social || {}) } };
  }
  const trainingTarget = (state) => {
    const g = state.profile && state.profile.gym;
    return (g && (g.days.length || g.perWeek)) || state.settings.weekGoal;
  };
  /* Which of a week's planned sessions are done: a closed GYM anchor with the same title. */
  function sessionsDone(state, plan, wk) {
    const done = plan.sessions.map(() => false);
    weekDays(wk).forEach((k) => {
      const a = state.days[k] && state.days[k].GYM.anchor;
      if (!a || !a.done) return;
      const i = plan.sessions.findIndex((s, j) => !done[j] && s.title === a.title);
      if (i > -1) done[i] = true;
    });
    return done;
  }
  const withOther = (list, other) => [...list, ...(other && other.trim() ? [other.trim()] : [])];
  const dayList = (days) => [...days].sort((a, b) => a - b).map((d) => DAY3[d]).join(', ');
  function profileUrl(id, v) {
    const s = (v || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    if (/^[\w.-]+\.[a-z]{2,}\//i.test(s)) return 'https://' + s;
    const p = PLATFORMS.find((x) => x.id === id);
    return p ? p.url(s.replace(/^@/, '')) : s;
  }
  const linkedPlatforms = (social) => PLATFORMS
    .filter((p) => (social.platforms[p.id] || '').trim())
    .map((p) => ({ ...p, href: profileUrl(p.id, social.platforms[p.id]) }));

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        const d = defaults();
        const plans = { ...(s.plans || {}) };
        // earlier versions kept one weekday plan on the profile
        const old = s.profile && s.profile.gym && s.profile.gym.plan;
        if (old && old.days) {
          const wk = weekOf(old.at || keyOf(new Date()));
          if (!plans[wk]) {
            plans[wk] = {
              sessions: Object.keys(old.days).map(Number).sort((a, b) => a - b).map((day) => ({ title: old.days[day], day })),
              goal: old.goal || '', note: '', status: 'accepted',
            };
          }
          delete s.profile.gym.plan;
        }
        return {
          ...d, ...s, plans,
          settings: { ...d.settings, ...(s.settings || {}) },
          profile: mergeProfile(s.profile),
          onboarding: s.onboarding && s.onboarding.profile ? { ...s.onboarding, profile: mergeProfile(s.onboarding.profile) } : null,
        };
      }
    } catch (e) { /* storage unavailable — run in memory */ }
    return defaults();
  }
  function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ } }

  function prevDayKey(state, today) {
    const keys = Object.keys(state.days).filter((k) => k < today).sort();
    return keys[keys.length - 1] || null;
  }
  /* Make sure today exists; carry yesterday's unfinished tasks forward. */
  function withDay(state, today) {
    if (state.days[today]) return state;
    const day = emptyDay();
    const prev = prevDayKey(state, today);
    if (prev && (dateOf(today) - dateOf(prev)) / 864e5 <= 14) {
      SECTIONS.forEach((s) => {
        const src = state.days[prev][s] || emptySection();
        day[s].tasks = src.tasks.filter((t) => !t.done && t.title.trim())
          .map((t) => ({ id: uid(), title: t.title, done: false, carried: true }));
      });
    }
    const cutoff = keyOf(addDays(dateOf(today), -400));
    const days = { ...state.days, [today]: day };
    Object.keys(days).forEach((k) => { if (k < cutoff) delete days[k]; });
    return { ...state, days };
  }
  function applySync(state, p, today) {
    const date = p.date || today;
    const health = { ...state.health };
    if (p.steps != null || p.km != null || p.exMin != null) {
      const prev = health[date] || {};
      health[date] = {
        steps: p.steps != null ? p.steps : prev.steps != null ? prev.steps : null,
        km: p.km != null ? p.km : prev.km != null ? prev.km : null,
        exMin: p.exMin != null ? p.exMin : prev.exMin != null ? prev.exMin : null,
      };
    }
    return {
      ...state, health,
      sync: { at: new Date().toISOString(), date, events: p.events, reminders: p.reminders, steps: p.steps, km: p.km, exMin: p.exMin },
    };
  }

  /* ---------- derived numbers ---------- */
  const anchorDone = (day, sec) => !!(day && day[sec] && day[sec].anchor && day[sec].anchor.done);
  function gymSessions(state, today) {
    return lastDays(today, 7).filter((k) => anchorDone(state.days[k], 'GYM') || ((state.health[k] || {}).exMin || 0) >= 20).length;
  }
  const anchorsClosed = (state, today, sec) => lastDays(today, 7).filter((k) => anchorDone(state.days[k], sec)).length;
  const tasksDone = (state, today, sec) => lastDays(today, 7)
    .reduce((n, k) => n + ((state.days[k] && state.days[k][sec].tasks.filter((t) => t.done).length) || 0), 0);

  function monthsFor(state, today, sec) {
    const t = dateOf(today);
    const out = [];
    for (let m = 2; m >= 0; m--) {
      const first = new Date(t.getFullYear(), t.getMonth() - m, 1);
      const len = m === 0 ? t.getDate() : new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      const days = [];
      for (let d = 1; d <= len; d++) {
        const day = state.days[keyOf(new Date(first.getFullYear(), first.getMonth(), d))];
        const s = day && day[sec];
        days.push(s && s.anchor && s.anchor.done ? 2 : s && (s.anchor || s.tasks.some((x) => x.done)) ? 1 : 0);
      }
      out.push({ label: MONTHS[first.getMonth()], days });
    }
    return out;
  }

  function buildReport(state, today) {
    const day = state.days[today] || emptyDay();
    const set = SECTIONS.filter((s) => day[s].anchor).length;
    const closed = SECTIONS.filter((s) => anchorDone(day, s)).length;
    let verdict;
    if (set === 0) verdict = 'No anchor was set today. Tomorrow, start with one.';
    else if (closed === 3) verdict = 'All three anchors closed. A full day.';
    else if (closed > 0) verdict = 'Anchor closed. A quiet, solid day.';
    else verdict = 'The anchor stayed open today. Make tomorrow’s smaller.';
    const actions = [];
    SECTIONS.forEach((s) => day[s].tasks.filter((t) => !t.done && t.title.trim()).forEach((t) => actions.push(t.title)));
    let warning;
    const four = lastDays(today, 4);
    if (four.every((k) => state.days[k]) &&
        four.every((k) => !anchorDone(state.days[k], 'GYM') && ((state.health[k] || {}).exMin || 0) < 20)) {
      warning = 'Four days without training — keep tomorrow’s GYM anchor small.';
    }
    return { verdict, number: closed, unit: `of ${set || 3}`, numberLabel: 'Anchors closed today', actions: actions.slice(0, 3), warning };
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); } finally { ta.remove(); }
    });
  }

  /* ---------- Claude bridge ----------
     The phone app can't call Claude directly (no server, no API key), so it hands a
     prompt to the Claude app — which knows the user from their chats — and reads back
     a fixed KEY: value template. */
  const RULES = 'Write the values in the language we usually talk in. Keep the keys in English exactly as written, one per line. ' +
    'Reply with only the template, inside a code block. If you don’t know something, write ? instead of guessing.';
  function bizPrompt() {
    return [
      'I’m setting up LOCKFLOW, my daily planning app. Based on what you know about me and my business from our conversations, fill in this template. Keep every line short.',
      RULES, '',
      'LOCKFLOW-BIZ',
      'NAME: the business name',
      'WHAT: what it does, one sentence',
      'STAGE: where it stands right now, one sentence',
      'FOCUS: the one thing that matters most this month',
      'NEXT: a concrete next step that fits in one day',
      'NEXT: another one',
      'NEXT: another one',
    ].join('\n');
  }
  /* Training plans: fixed days use SUN…SAT keys; a schedule that moves uses S1, S2, … */
  const PLAN_RULES = 'Write the values in the language we usually talk in. Keep the keys in English exactly as written, one per line, ' +
    'and put the template inside a code block. If you don’t know something, write ? instead of guessing.';
  function gymBasics(g) {
    const days = [...g.days].sort((a, b) => a - b);
    return [
      `Sports: ${withOther(g.sports, g.other).join(', ') || 'not set'}`,
      days.length ? `Training days: ${days.map((d) => WEEKDAYS[d]).join(', ')}`
        : `Sessions this week: ${g.perWeek || 3}, on no fixed days — my schedule moves week to week`,
      g.minutes ? `Time per session: about ${g.minutes} minutes` : null,
      g.conditions && g.conditions.trim() ? `My conditions: ${g.conditions.trim()}` : null,
    ].filter(Boolean);
  }
  function sessionKeys(g) {
    const days = [...g.days].sort((a, b) => a - b);
    return days.length ? days.map((d) => DAYKEY[d]) : Array.from({ length: g.perWeek || 3 }, (_, i) => `S${i + 1}`);
  }
  function planTemplate(plan) {
    return [
      'LOCKFLOW-GYM',
      ...plan.sessions.map((s, i) => `${s.day != null ? DAYKEY[s.day] : `S${i + 1}`}: ${s.title || '?'}`),
      `GOAL: ${plan.goal || '?'}`,
      `NOTE: ${plan.note || ''}`,
    ].join('\n');
  }
  function planPrompt(p, wk, report) {
    const g = p.gym;
    return [
      `I use LOCKFLOW, my daily planning app. Plan my training for the week starting ${longDate(dateOf(wk))}.`,
      ...gymBasics(g),
      report ? `How last week went: ${report}` : null,
      'Use what you know about my fitness and goals from our conversations. One line per session: what, how much, how hard.',
      g.planner === 'mix'
        ? 'This is a first draft we’ll shape together. Keep it simple, and on the NOTE line say what you assumed about my conditions and what you’d like to know. Then ask me if I’m happy with it. If I’m not, we adjust it together — every time you change it, send the full template again.'
        : 'After the plan, ask me if I’m happy with it. If I’m not, adjust it with me — every time you change it, send the full template again.',
      PLAN_RULES, '',
      'LOCKFLOW-GYM',
      ...sessionKeys(g).map((k) => `${k}: the workout`),
      'GOAL: what this week builds toward, one sentence',
      'NOTE: assumptions or questions, or leave empty',
    ].filter((x) => x !== null).join('\n');
  }
  function revisePrompt(p, wk, plan, feedback) {
    return [
      `Here is my LOCKFLOW training plan for the week starting ${longDate(dateOf(wk))}:`,
      planTemplate(plan), '',
      `What I want to change: ${feedback.trim() || '(I’ll tell you in the chat)'}`,
      ...gymBasics(p.gym),
      'Adjust the plan to fit. If something doesn’t fit my real conditions, ask me. Every time you change it, send the full updated template again.',
      PLAN_RULES,
    ].join('\n');
  }
  function socialPrompt(p) {
    const s = p.social;
    const links = linkedPlatforms(s).map((x) => `${x.label}: ${x.href}`);
    return [
      'I’m setting up LOCKFLOW, my daily planning app. Look at my content and suggest what to post next.',
      links.length ? `My pages:\n${links.join('\n')}` : 'My pages: none yet',
      `I want to post ${s.postsPerWeek} times a week.`,
      `What I make: ${withOther(s.types, s.other).join(', ') || 'not set'}.`,
      'Open the links if you can. If you can’t, say so on the NOTE line and work from what you know about me from our conversations.',
      RULES, '',
      'LOCKFLOW-SOCIAL',
      'STYLE: what’s working in my content right now, one sentence',
      'IDEA: a specific video idea, one line',
      'IDEA: another one', 'IDEA: another one', 'IDEA: another one', 'IDEA: another one',
      'NOTE: anything I should know, or leave empty',
    ].join('\n');
  }
  function parseKV(text) {
    const out = [];
    String(text).split(/\r?\n/).forEach((line) => {
      const m = line.replace(/^[\s>*\-`#]+/, '').replace(/\*\*/g, '').match(/^([A-Za-z][A-Za-z0-9]{1,5})\s*[:：]\s*(.*)$/);
      if (!m) return;
      const v = m[2].trim().replace(/^["“]|["”]$/g, '').trim();
      if (v && v !== '?' && v !== '…' && v !== '...') out.push([m[1].toUpperCase(), v]);
    });
    return out;
  }
  function parseBiz(text) {
    const r = { name: '', what: '', stage: '', focus: '', next: [] };
    parseKV(text).forEach(([k, v]) => {
      if (k === 'NAME') r.name = v; else if (k === 'WHAT') r.what = v; else if (k === 'STAGE') r.stage = v;
      else if (k === 'FOCUS') r.focus = v; else if (k === 'NEXT') r.next.push(v);
    });
    r.ok = !!(r.name || r.what || r.focus || r.next.length);
    return r;
  }
  function parsePlan(text) {
    const r = { sessions: [], goal: '', note: '' };
    parseKV(text).forEach(([k, v]) => {
      const i = DAYKEY.indexOf(k);
      if (i > -1) r.sessions.push({ title: v, day: i });
      else if (/^S\d{1,2}$/.test(k)) r.sessions.push({ title: v, day: null });
      else if (k === 'GOAL') r.goal = v;
      else if (k === 'NOTE') r.note = v;
    });
    // if a day appears twice, keep its last value
    const lastFor = {};
    r.sessions.forEach((s, idx) => { if (s.day != null) lastFor[s.day] = idx; });
    r.sessions = r.sessions.filter((s, idx) => s.day == null || lastFor[s.day] === idx);
    r.sessions.sort((a, b) => (a.day == null ? 9 : a.day) - (b.day == null ? 9 : b.day));
    r.ok = r.sessions.length > 0;
    return r;
  }
  const blankPlan = (g) => ({
    sessions: g.days.length ? [...g.days].sort((a, b) => a - b).map((day) => ({ title: '', day }))
      : Array.from({ length: g.perWeek || 3 }, () => ({ title: '', day: null })),
    goal: '', note: '',
  });
  const cleanPlan = (plan) => ({
    sessions: plan.sessions.map((s) => ({ ...s, title: s.title.trim() })).filter((s) => s.title),
    goal: (plan.goal || '').trim(), note: (plan.note || '').trim(), status: 'accepted', at: keyOf(new Date()),
  });

  /* The week in numbers — shown on Saturday and handed to the AI with the next plan. */
  function weekReport(state, wk) {
    const upTo = keyOf(new Date());
    const ks = weekDays(wk).filter((k) => k <= upTo);
    const target = trainingTarget(state);
    const sessions = ks.filter((k) => anchorDone(state.days[k], 'GYM') || ((state.health[k] || {}).exMin || 0) >= 20).length;
    const km = round1(ks.reduce((n, k) => n + ((state.health[k] || {}).km || 0), 0));
    const anchors = SECTIONS.map((s) => [s, ks.filter((k) => anchorDone(state.days[k], s)).length]);
    const plan = state.plans[wk];
    const done = plan ? sessionsDone(state, plan, wk) : [];
    const missed = plan ? plan.sessions.filter((s, i) => !done[i]).map((s) => s.title) : [];
    let verdict;
    if (sessions >= target) verdict = 'A full training week. Keep the load steady.';
    else if (sessions === 0) verdict = 'No training logged this week. Start next week small.';
    else verdict = `${sessions} of ${target} sessions. Plan what you can finish.`;
    const text = `${sessions} of ${target} sessions${km ? `, ${km} km` : ''}${missed.length ? `; missed: ${missed.join('; ')}` : ''}.`;
    return { sessions, target, km, anchors, missed, verdict, text, hasData: ks.some((k) => state.days[k]) };
  }
  function parseSocial(text) {
    const r = { style: '', ideas: [], note: '' };
    parseKV(text).forEach(([k, v]) => {
      if (k === 'STYLE') r.style = v; else if (k === 'IDEA') r.ideas.push(v); else if (k === 'NOTE') r.note = v;
    });
    r.ok = r.ideas.length > 0 || !!r.style;
    return r;
  }

  /* ---------- small pieces ---------- */
  function Label({ children, right }) {
    return (
      <div className="label-row">
        <span className="eyebrow">{children}</span>
        {right && <span className="meta">{right}</span>}
      </div>
    );
  }
  const colCard = { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16, minHeight: 150 };

  function AnchorEditor({ anchor, suggestions = [], note, onSave, onClear }) {
    const [title, setTitle] = useState(anchor ? anchor.title : '');
    const [why, setWhy] = useState(anchor ? anchor.why || '' : '');
    const submit = (e) => {
      e.preventDefault();
      const t = title.trim();
      if (t) onSave({ title: t, why: why.trim(), done: anchor ? anchor.done : false });
    };
    return (
      <form className="anchor-editor" onSubmit={submit}>
        <div className="eyebrow">Today’s anchor</div>
        <input id="anchor-title" className="field field-lg" dir="auto" value={title} enterKeyHint="done"
          onChange={(e) => setTitle(e.target.value)} placeholder="The one thing for today" />
        <input id="anchor-why" className="field" dir="auto" value={why} enterKeyHint="done"
          onChange={(e) => setWhy(e.target.value)} placeholder="Why it matters (optional)" />
        {note && !title && <div className="meta">{note}</div>}
        {!title && suggestions.slice(0, 4).map((s, i) => (
          <button key={i} type="button" className="chip" onClick={() => { setTitle(s.title); setWhy(s.why || ''); }}>
            <span className="chip-label">{s.label}</span>
            <span dir="auto">{s.title}</span>
          </button>
        ))}
        <div className="actions">
          {onClear && <button type="button" className="btn-quiet" onClick={onClear}>Remove anchor</button>}
          <button type="submit" className="btn" disabled={!title.trim()}>Set anchor</button>
        </div>
      </form>
    );
  }

  function Tasks({ tasks, editing, onChange, tint }) {
    const [draft, setDraft] = useState('');
    const add = (e) => {
      e.preventDefault();
      const t = draft.trim();
      if (!t) return;
      onChange([...tasks, { id: uid(), title: t, done: false }]);
      setDraft('');
    };
    return (
      <Card index={1} padding="18px 20px" tint={tint}>
        {tasks.length > 0 && (
          <div className="list">
            {tasks.map((t) => editing ? (
              <div key={t.id} className="edit-row">
                <input className="field" dir="auto" value={t.title} aria-label="Task"
                  onChange={(e) => onChange(tasks.map((x) => x.id === t.id ? { ...x, title: e.target.value } : x))} />
                <button type="button" className="btn-quiet" onClick={() => onChange(tasks.filter((x) => x.id !== t.id))}>Remove</button>
              </div>
            ) : (
              <TaskItem key={t.id} title={t.title} tag={t.carried ? 'carried' : undefined} done={t.done}
                onToggle={() => onChange(tasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))} />
            ))}
          </div>
        )}
        {!editing && (
          <form onSubmit={add} className="add-row" style={{ marginTop: tasks.length ? 16 : 0 }}>
            <span className="add-ring" aria-hidden="true" />
            <input className="field-bare" dir="auto" value={draft} enterKeyHint="done" aria-label="Add a task"
              onChange={(e) => setDraft(e.target.value)} placeholder="Add a task" />
          </form>
        )}
        {editing && tasks.length === 0 && <div className="meta">No tasks yet.</div>}
      </Card>
    );
  }

  function GymStats({ state, today, weekGoal }) {
    const h = state.health[today] || {};
    const sessions = gymSessions(state, today);
    const series = lastDays(today, 7).map((k) => (state.health[k] || {}).km);
    const known = series.filter((v) => v != null);
    const total = round1(known.reduce((a, b) => a + b, 0));
    return (
      <>
        <div className="two-col">
          <Card index={2} padding={20} style={colCard}>
            <ProgressRing value={sessions} max={weekGoal} size={64}>{sessions}</ProgressRing>
            <div className="meta">of {weekGoal} sessions<br />last 7 days</div>
          </Card>
          <Card index={3} padding={20} style={colCard}>
            {h.steps != null
              ? <Stat value={h.steps} label="Steps today" />
              : <div><div className="stat-empty">—</div><div className="meta" style={{ marginTop: 6 }}>Steps today</div></div>}
            <div className="meta">{h.exMin != null ? `${h.exMin} min exercise` : 'Synced from Health'}</div>
          </Card>
        </div>
        <Card index={4} padding="18px 20px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {known.length > 0
            ? <Stat value={total} unit="km" label="Distance · last 7 days" />
            : <div><div className="stat-empty">—</div><div className="meta" style={{ marginTop: 6 }}>Distance · last 7 days</div></div>}
          {known.length >= 2
            ? <LineChart data={series.map((v) => v || 0)} width={130} height={44} />
            : <span className="meta" style={{ textAlign: 'end', maxWidth: 130 }}>Trend appears after two synced days</span>}
        </Card>
      </>
    );
  }

  function WeekStats({ state, today, sec, tint }) {
    const closed = anchorsClosed(state, today, sec);
    const done = tasksDone(state, today, sec);
    const posts = sec === 'SOCIAL' && state.profile ? state.profile.social.postsPerWeek : null;
    return (
      <div className="two-col">
        <Card index={2} tint={tint} padding={20} style={colCard}>
          <ProgressRing value={closed} max={posts || 7} size={64}>{closed}</ProgressRing>
          <div className="meta">{posts ? <>of {posts} posts<br />last 7 days</> : <>of 7 anchors closed<br />last 7 days</>}</div>
        </Card>
        <Card index={3} tint={tint} padding={20} style={colCard}>
          <Stat value={done} label="Tasks done · 7 days" />
        </Card>
      </div>
    );
  }

  /* What onboarding knows about today, per area. */
  function sectionContext(sec, state, today) {
    const profile = state.profile;
    const dow = dateOf(today).getDay();
    const out = { suggestions: [], note: null, focus: null, links: [] };
    if (!profile) return out;
    if (sec === 'GYM') {
      const g = profile.gym;
      const wk = weekOf(today);
      const plan = state.plans[wk];
      const rest = 'Rest day. Nothing planned — set an anchor only if you want one.';
      if (plan && plan.sessions.length) {
        const done = sessionsDone(state, plan, wk);
        const ti = plan.sessions.findIndex((s, i) => s.day === dow && !done[i]);
        if (ti > -1) out.suggestions.push({ label: 'Today’s plan', title: plan.sessions[ti].title });
        else if (plan.sessions.every((s) => s.day == null)) {
          const ni = done.indexOf(false);
          if (ni > -1) out.suggestions.push({ label: `Next session · ${done.filter(Boolean).length + 1} of ${plan.sessions.length}`, title: plan.sessions[ni].title });
          else out.note = 'Every session this week is done.';
        } else if (!plan.sessions.some((s) => s.day === dow)) out.note = rest;
        if (plan.goal) out.focus = { label: 'This week', text: plan.goal };
      } else if (g.days.length && !g.days.includes(dow)) out.note = rest;
    } else if (sec === 'BIZ') {
      profile.biz.next.forEach((t) => out.suggestions.push({ label: 'Next step', title: t }));
      if (profile.biz.focus) out.focus = { label: 'Focus this month', text: profile.biz.focus };
    } else if (sec === 'SOCIAL') {
      profile.social.ideas.forEach((t) => out.suggestions.push({ label: 'Idea', title: t }));
      out.links = linkedPlatforms(profile.social);
    }
    return out;
  }

  /* Saturday: review the week and plan the next. Any other day: plan this week if it has no plan. */
  function weekToPlan(state, today) {
    const p = state.profile;
    if (!p || !p.gym.planner) return null;
    const thisWk = weekOf(today), nextWk = nextWeekOf(today);
    if (dateOf(today).getDay() === 6 && !state.plans[nextWk]) return nextWk;
    if (!state.plans[thisWk]) return thisWk;
    return null;
  }
  function WeekPrompt({ state, today, openPlan, skipWeek }) {
    const wk = weekToPlan(state, today);
    if (!wk) return null;
    const next = wk !== weekOf(today);
    return (
      <Card index={0} radius="lg" padding="20px 20px 18px" style={{ border: '1px solid var(--border-strong)' }}>
        <Label right={`From ${shortDate(wk)}`}>{next ? 'Next week' : 'This week'}</Label>
        <div className="empty">{next ? 'Your week in review, and next week’s training plan.' : 'No training plan for this week yet.'}</div>
        <div className="actions start" style={{ marginTop: 14 }}>
          <button type="button" className="btn" onClick={() => openPlan(wk)}>{next ? 'Review & plan' : 'Plan this week'}</button>
          {!next && <button type="button" className="btn-quiet" onClick={() => skipWeek(wk)}>Not this week</button>}
        </div>
      </Card>
    );
  }

  function PlanList({ plan, done }) {
    return (
      <div className="rows">
        {plan.sessions.map((s, i) => (
          <div className={'row' + (done && done[i] ? ' row-done' : '')} key={i}>
            <span className="time">{s.day != null ? DAY3[s.day] : `#${i + 1}`}</span>
            <span className="row-title" dir="auto">{s.title}</span>
          </div>
        ))}
        {(plan.goal || plan.note) && <div className="meta" dir="auto">{[plan.goal, plan.note].filter(Boolean).join(' · ')}</div>}
      </div>
    );
  }

  function SectionScreen({ sec, state, today, updateSection, updateProfile, openPlan, skipWeek }) {
    const day = state.days[today] || emptyDay();
    const s = day[sec];
    const [editing, setEditing] = useState(false);
    const prev = prevDayKey(state, today);
    const prevAnchor = prev && state.days[prev][sec].anchor && !state.days[prev][sec].anchor.done ? state.days[prev][sec].anchor : null;
    const tint = sec === 'SOCIAL' ? 'var(--social-tint)' : undefined;
    const ctx = sectionContext(sec, state, today);
    const suggestions = [...(prevAnchor ? [{ label: 'Still open from yesterday', title: prevAnchor.title, why: prevAnchor.why }] : []), ...ctx.suggestions];
    const toggleEdit = () => {
      if (editing) updateSection(sec, (x) => ({ ...x, tasks: x.tasks.filter((t) => t.title.trim()) }));
      setEditing(!editing);
    };
    const saveAnchor = (a) => {
      updateSection(sec, (x) => ({ ...x, anchor: a }));
      // a picked suggestion is used up
      if (sec === 'BIZ') updateProfile((p) => ({ ...p, biz: { ...p.biz, next: p.biz.next.filter((t) => t !== a.title) } }));
      if (sec === 'SOCIAL') updateProfile((p) => ({ ...p, social: { ...p.social, ideas: p.social.ideas.filter((t) => t !== a.title) } }));
      if (editing) toggleEdit();
    };
    const wk = weekOf(today);
    const plan = sec === 'GYM' && state.plans[wk] && state.plans[wk].sessions.length ? state.plans[wk] : null;
    const planDone = plan ? sessionsDone(state, plan, wk) : [];
    return (
      <div className="stack">
        {sec === 'GYM' && <WeekPrompt state={state} today={today} openPlan={openPlan} skipWeek={skipWeek} />}
        {ctx.focus && (
          <div className="focus">
            <div className="eyebrow">{ctx.focus.label}</div>
            <div className="focus-text" dir="auto">{ctx.focus.text}</div>
          </div>
        )}
        {(s.anchor || s.tasks.length > 0) && (
          <div className="screen-tools"><button type="button" className="text-btn" onClick={toggleEdit}>{editing ? 'Done' : 'Edit'}</button></div>
        )}
        {!s.anchor || editing ? (
          <AnchorEditor key={String(editing)} anchor={s.anchor} suggestions={!s.anchor ? suggestions : []} note={!s.anchor ? ctx.note : null}
            onSave={saveAnchor}
            onClear={s.anchor ? () => updateSection(sec, (x) => ({ ...x, anchor: null })) : null} />
        ) : (
          <Anchor title={s.anchor.title} why={s.anchor.why} done={s.anchor.done} index={0}
            onToggle={() => updateSection(sec, (x) => ({ ...x, anchor: { ...x.anchor, done: !x.anchor.done } }))} />
        )}
        <Tasks tasks={s.tasks} editing={editing} tint={tint} onChange={(tasks) => updateSection(sec, (x) => ({ ...x, tasks }))} />
        {plan && (
          <Card index={2} padding="18px 20px">
            <Label right={`${planDone.filter(Boolean).length} of ${plan.sessions.length} done`}>This week’s plan</Label>
            <PlanList plan={plan} done={planDone} />
            <div className="actions start" style={{ marginTop: 8 }}>
              <button type="button" className="btn-quiet" onClick={() => openPlan(wk)}>Change the plan</button>
            </div>
          </Card>
        )}
        <div style={{ height: 12 }} />
        {sec === 'GYM'
          ? <GymStats state={state} today={today} weekGoal={trainingTarget(state)} />
          : <WeekStats state={state} today={today} sec={sec} tint={tint} />}
        <Card index={5} padding="20px 20px 18px" tint={tint}>
          <DotGrid months={monthsFor(state, today, sec)} today={dateOf(today).getDate()} gap={6} />
        </Card>
        {ctx.links.length > 0 && (
          <div className="links">
            {ctx.links.map((l) => <a key={l.id} className="text-btn" href={l.href} target="_blank" rel="noopener">{l.label}</a>)}
          </div>
        )}
      </div>
    );
  }

  function TodayAM({ state, today, onToggleAnchor, goTab, openSettings, openPlan, skipWeek }) {
    const day = state.days[today] || emptyDay();
    const sync = state.sync;
    const synced = sync && sync.date === today;
    return (
      <div className="stack">
        <WeekPrompt state={state} today={today} openPlan={openPlan} skipWeek={skipWeek} />
        <Card index={0} radius="lg" padding="22px 20px 20px">
          <Label>Today’s anchors</Label>
          <div className="list">
            {SECTIONS.map((sec) => {
              const a = day[sec].anchor;
              const ctx = sectionContext(sec, state, today);
              const plan = sec === 'GYM' && ctx.suggestions[0];
              return (
                <div key={sec} className="anchor-row">
                  <div className="tag">{sec}</div>
                  {a ? <TaskItem title={a.title} done={a.done} onToggle={() => onToggleAnchor(sec)} />
                     : <button type="button" className="ghost-row" onClick={() => goTab(sec)}>
                         {plan ? <><span className="chip-label">{plan.label}</span><span dir="auto">{plan.title}</span></>
                           : sec === 'GYM' && ctx.note ? 'Rest day' : `Set the ${sec} anchor`}
                       </button>}
                </div>
              );
            })}
          </div>
        </Card>
        <Card index={1} padding="18px 20px">
          <Label right={synced ? `Synced ${hhmm(new Date(sync.at))}` : null}>Calendar</Label>
          {!synced ? (
            <div className="hint">
              <div className="empty">Not synced today.</div>
              <div className="meta">Open LOCKFLOW from the shortcut to bring in your calendar, reminders and Health.</div>
              <div className="actions start"><a className="btn" href="setup.html">Set up iPhone sync</a></div>
            </div>
          ) : sync.events.length === 0 ? (
            <div className="empty">Nothing on the calendar today.</div>
          ) : (
            <div className="rows">
              {sync.events.map((e, i) => (
                <div className="row" key={i}>
                  <span className="time">{isAllDay(e) ? 'All day' : e.start}</span>
                  <span className="row-title" dir="auto">{e.title}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        {synced && (
          <Card index={2} padding="18px 20px">
            <Label>Reminders</Label>
            {sync.reminders.length === 0 ? <div className="empty">No reminders due today.</div> : (
              <div className="rows">
                {sync.reminders.map((r, i) => (
                  <div className="row" key={i}>
                    <span className="dot" aria-hidden="true" />
                    <span className="row-title" dir="auto">{r.title}</span>
                    {r.list && <span className="tag" dir="auto">{r.list}</span>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
        <button type="button" className="link-row" onClick={openSettings}>Settings &amp; iPhone sync</button>
      </div>
    );
  }

  function TodayPM({ state, today, onToggleAnchor, openPlan, skipWeek }) {
    const day = state.days[today] || emptyDay();
    const open = SECTIONS.filter((s) => day[s].anchor && !day[s].anchor.done);
    return (
      <div className="stack">
        <WeekPrompt state={state} today={today} openPlan={openPlan} skipWeek={skipWeek} />
        <DailyReport {...buildReport(state, today)} index={0} />
        {open.length > 0 && (
          <Card index={1} padding="18px 20px">
            <Label>Still open</Label>
            <div className="list">
              {open.map((sec) => (
                <div key={sec} className="anchor-row">
                  <div className="tag">{sec}</div>
                  <TaskItem title={day[sec].anchor.title} done={false} onToggle={() => onToggleAnchor(sec)} />
                </div>
              ))}
            </div>
          </Card>
        )}
        <div className="goodnight">Good night.</div>
      </div>
    );
  }

  function Stepper({ id, value, min, max, onChange, format }) {
    return (
      <div className="stepper">
        <button type="button" aria-label="Less" disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <span id={id} className="stepper-val">{format ? format(value) : value}</span>
        <button type="button" aria-label="More" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    );
  }

  function Settings({ state, setState, onClose, flash, applyText, openSetup, openPlan }) {
    const [paste, setPaste] = useState('');
    const [restore, setRestore] = useState('');
    const s = state.settings;
    const sync = state.sync;
    const set = (k, v) => setState((st) => ({ ...st, settings: { ...st.settings, [k]: v } }));
    const standalone = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    const today = keyOf(new Date());
    const doRestore = () => {
      try {
        const data = JSON.parse(restore);
        if (!data || typeof data.days !== 'object') throw new Error('shape');
        setState({ ...defaults(), ...data, settings: { ...defaults().settings, ...(data.settings || {}) } });
        setRestore('');
        flash('Backup restored');
      } catch (e) { flash('That doesn’t look like a LOCKFLOW backup'); }
    };
    return (
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="sheet-head">
          <div className="title">Settings</div>
          <button type="button" className="pill" onClick={onClose}>Done</button>
        </div>
        <div className="stack">
          {standalone && (
            <div className="note">You opened the home-screen web app. iPhone keeps its data separate from Safari, and sync always opens Safari. Use the LOCKFLOW shortcut icon instead.</div>
          )}
          {state.profile && (
            <Card padding="18px 20px" animate={false}>
              <Label>Your setup</Label>
              <ProfileSummary profile={state.profile} />
              <div className="actions start" style={{ marginTop: 16 }}>
                <button type="button" className="btn" onClick={() => openSetup(null)}>Edit setup</button>
              </div>
              <div className="claude-links">
                <div className="eyebrow">Ask the AI again</div>
                {state.profile.gym.planner && <button type="button" className="btn-quiet" onClick={() => { onClose(); openPlan(weekToPlan(state, keyOf(new Date())) || weekOf(keyOf(new Date()))); }}>Training plan</button>}
                <button type="button" className="btn-quiet" onClick={() => openSetup(['bizClaude', 'biz'])}>Update my business</button>
                <button type="button" className="btn-quiet" onClick={() => openSetup(['ideas'])}>New post ideas</button>
              </div>
            </Card>
          )}
          <Card padding="18px 20px" animate={false}>
            <Label>iPhone sync</Label>
            <div className="meta">
              {sync ? `Last sync ${sync.date === today ? 'today' : sync.date} at ${hhmm(new Date(sync.at))} · ${sync.events.length} events · ${sync.reminders.length} reminders${sync.steps != null ? ` · ${sync.steps.toLocaleString('de-DE')} steps` : ''}${sync.km != null ? ` · ${round1(sync.km)} km` : ''}` : 'Not synced yet.'}
            </div>
            <div className="actions start" style={{ marginTop: 14 }}>
              <a className="btn" href="setup.html">Setup guide</a>
              <button type="button" className="btn-quiet" onClick={() => { applyText(samplePayload(today)); onClose(); }}>Try sample data</button>
            </div>
            <details>
              <summary>Paste sync text</summary>
              <textarea id="paste-sync" className="field mono" rows={6} dir="ltr" value={paste}
                onChange={(e) => setPaste(e.target.value)} placeholder={'T|2026-10-31\nE|09:30|10:00|Standup\nR|Work|Reply to supplier\nS|6400'} />
              <div className="actions start"><button type="button" className="btn" disabled={!paste.trim()} onClick={() => { applyText(paste); setPaste(''); onClose(); }}>Apply</button></div>
            </details>
          </Card>
          <Card padding="18px 20px" animate={false}>
            <Label>Rhythm</Label>
            <div className="setting-row"><label htmlFor="goal">Training sessions per week</label>
              <Stepper id="goal" value={s.weekGoal} min={1} max={7} onChange={(v) => set('weekGoal', v)} /></div>
            <div className="setting-row"><label htmlFor="pm">Evening close-out from</label>
              <Stepper id="pm" value={s.pmHour} min={12} max={23} format={(v) => `${pad(v)}:00`} onChange={(v) => set('pmHour', v)} /></div>
          </Card>
          <Card padding="18px 20px" animate={false}>
            <Label>Backup</Label>
            <div className="meta">Everything lives in this browser on this phone. Copy a backup now and then and keep it in Notes.</div>
            <div className="actions start" style={{ marginTop: 14 }}>
              <button type="button" className="btn" onClick={() => copyText(JSON.stringify(state)).then(() => flash('Backup copied'), () => flash('Copy didn’t work — try again'))}>Copy backup</button>
            </div>
            <details>
              <summary>Restore from backup</summary>
              <textarea id="restore" className="field mono" rows={4} dir="ltr" value={restore} onChange={(e) => setRestore(e.target.value)} placeholder="Paste a backup here" />
              <div className="actions start"><button type="button" className="btn" disabled={!restore.trim()} onClick={doRestore}>Restore</button></div>
            </details>
            <button type="button" className="btn-warn" onClick={() => {
              if (confirm('Erase every day, task and synced value on this phone?')) { setState(defaults()); flash('Erased'); }
            }}>Erase all data</button>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------- onboarding ---------- */
  const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  function Chips({ options, selected, onToggle }) {
    return (
      <div className="chips">
        {options.map((o) => {
          const value = typeof o === 'object' ? o.value : o;
          const label = typeof o === 'object' ? o.label : o;
          const on = selected.includes(value);
          return <button key={String(value)} type="button" className="chip-toggle" aria-pressed={on} onClick={() => onToggle(value)}>{label}</button>;
        })}
      </div>
    );
  }

  function OptionCard({ selected, title, body, onClick }) {
    return (
      <button type="button" className="option-card" aria-pressed={selected} onClick={onClick}>
        <span className="option-title">{title}</span>
        <span className="option-body">{body}</span>
      </button>
    );
  }

  function PreviewList({ rows, foot }) {
    return (
      <div className="rows" style={{ marginTop: 10 }}>
        {rows.map(([k, v], i) => (
          <div className="row" key={i}><span className="time">{k}</span><span className="row-title" dir="auto">{v}</span></div>
        ))}
        {foot && <div className="meta" dir="auto">{foot}</div>}
      </div>
    );
  }

  function ClaudeBridge({ id, prompt, parse, onParsed, preview }) {
    const [answer, setAnswer] = useState('');
    const [copied, setCopied] = useState(false);
    const result = answer.trim() ? parse(answer) : null;
    useEffect(() => { onParsed(result && result.ok ? result : null); }, [answer]);
    const pasteClip = () => {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then((t) => { if (t) setAnswer(t); }, () => {});
      }
    };
    return (
      <div className="bridge">
        <div className="bridge-step">
          <span className="bridge-n">1</span>
          <div className="bridge-main">
            <div className="bridge-title">Copy the prompt, then paste it into a new Claude chat</div>
            <div className="actions start">
              <a className="btn" href="https://claude.ai/new" target="_blank" rel="noopener"
                onClick={() => { copyText(prompt).then(() => setCopied(true), () => {}); }}>
                {copied ? 'Copy again & open Claude' : 'Copy & open Claude'}
              </a>
            </div>
            <details><summary>See the prompt</summary><pre className="prompt">{prompt}</pre></details>
          </div>
        </div>
        <div className="bridge-step">
          <span className="bridge-n">2</span>
          <div className="bridge-main">
            <div className="bridge-title">Paste Claude’s answer here</div>
            <textarea id={id} className="field mono" rows={5} dir="auto" value={answer}
              onChange={(e) => setAnswer(e.target.value)} placeholder="Paste the whole answer" />
            <div className="actions start"><button type="button" className="btn-quiet" onClick={pasteClip}>Paste from clipboard</button></div>
            {result && (result.ok
              ? <div className="got"><div className="eyebrow">Got it</div>{preview(result)}</div>
              : <div className="note">I couldn’t find the LOCKFLOW template in that. Copy Claude’s whole answer and paste it again.</div>)}
          </div>
        </div>
      </div>
    );
  }

  function PlanEditor({ plan, setPlan }) {
    const set = (i, patch) => setPlan({ ...plan, sessions: plan.sessions.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
    return (
      <div className="form">
        {plan.sessions.map((s, i) => (
          <div className="edit-row" key={i}>
            <span className="time">{s.day != null ? DAY3[s.day] : `#${i + 1}`}</span>
            <input className="field" dir="auto" aria-label={`Session ${i + 1}`} value={s.title} placeholder="The workout"
              onChange={(e) => set(i, { title: e.target.value })} />
            <button type="button" className="btn-quiet" onClick={() => setPlan({ ...plan, sessions: plan.sessions.filter((_, j) => j !== i) })}>Remove</button>
          </div>
        ))}
        <div className="actions start">
          <button type="button" className="btn-quiet" onClick={() => setPlan({ ...plan, sessions: [...plan.sessions, { title: '', day: null }] })}>Add a session</button>
        </div>
        <label htmlFor="plan-goal">Goal for the week</label>
        <input id="plan-goal" className="field" dir="auto" value={plan.goal || ''} onChange={(e) => setPlan({ ...plan, goal: e.target.value })} />
      </div>
    );
  }

  /* The weekly loop: the AI proposes → "Happy with this plan?" → yes locks it in,
     no opens changes — with the AI (feedback about real conditions) or by hand.
     'self' starts in the editor. */
  function PlanReview({ profile, wk, report, initial, onAccept }) {
    const g = profile.gym;
    const self = g.planner === 'self';
    const [mode, setModeRaw] = useState(initial ? 'review' : self ? 'change' : 'get');
    const [draft, setDraft] = useState(initial || blankPlan(g));
    const [parsed, setParsed] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [round, setRound] = useState(0);
    const setMode = (m) => { setParsed(null); setModeRaw(m); };
    const ready = cleanPlan(draft).sessions.length > 0;

    const question = (plan) => (
      <div className="plan-q">
        <div className="bridge-title">Happy with this plan?</div>
        <div className="actions start">
          <button type="button" className="btn" onClick={() => onAccept(cleanPlan(plan))}>Yes, lock it in</button>
          <button type="button" className="btn-quiet" onClick={() => { setDraft({ ...plan, goal: plan.goal || '', note: plan.note || '' }); setMode('change'); }}>No, change it</button>
        </div>
      </div>
    );

    if (mode === 'get') {
      return (
        <div className="stack-lg">
          <ClaudeBridge id={`plan-${wk}`} prompt={planPrompt(profile, wk, report)} parse={parsePlan} onParsed={setParsed}
            preview={(r) => <PlanList plan={r} />} />
          {parsed && question(parsed)}
          <button type="button" className="btn-quiet" style={{ justifySelf: 'start' }} onClick={() => setMode('change')}>Write it myself instead</button>
        </div>
      );
    }
    if (mode === 'review') {
      return (
        <div className="stack-lg">
          <Card padding="18px 20px" animate={false}><Label>The plan</Label><PlanList plan={draft} /></Card>
          {question(draft)}
        </div>
      );
    }
    const withAI = (
      <Card key="ai" padding="18px 20px" animate={false}>
        <Label>{self ? 'Want the AI’s take?' : 'Change it with the AI'}</Label>
        <p className="meta" style={{ margin: '0 0 12px' }}>Tell it what doesn’t fit: your time, the weather, your gear, where you can ride or run. You can keep talking it through in Claude, then paste the final plan here.</p>
        <textarea id={`plan-feedback-${wk}`} className="field" rows={3} dir="auto" value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Only 45 minutes on Tuesday. Rain on Thursday, so the trainer, not the road." />
        <div style={{ height: 18 }} />
        <ClaudeBridge key={round} id={`plan-rev-${wk}`} prompt={revisePrompt(profile, wk, draft, feedback)} parse={parsePlan} onParsed={setParsed}
          preview={(r) => <PlanList plan={r} />} />
        {parsed && (
          <div className="actions start" style={{ marginTop: 14 }}>
            <button type="button" className="btn" onClick={() => { setDraft(parsed); setRound((r) => r + 1); setMode('review'); }}>Review the new plan</button>
          </div>
        )}
      </Card>
    );
    const byHand = (
      <Card key="hand" padding="18px 20px" animate={false}>
        <Label>{self ? 'Your week' : 'Or edit it yourself'}</Label>
        <PlanEditor plan={draft} setPlan={setDraft} />
        <div className="actions start" style={{ marginTop: 16 }}>
          <button type="button" className="btn" disabled={!ready} onClick={() => onAccept(cleanPlan(draft))}>Save the plan</button>
        </div>
      </Card>
    );
    return <div className="stack-lg">{self ? [byHand, withAI] : [withAI, byHand]}</div>;
  }

  function PlanSheet({ state, wk, onClose, onAccept }) {
    const p = state.profile;
    const today = keyOf(new Date());
    const thisWk = weekOf(today);
    const reviewWk = wk === thisWk ? keyOf(addDays(dateOf(thisWk), -7)) : thisWk;
    const rep = weekReport(state, reviewWk);
    const existing = state.plans[wk] && state.plans[wk].sessions.length ? state.plans[wk] : null;
    return (
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Training plan">
        <div className="sheet-head">
          <div>
            <div className="eyebrow">{PLANNERS[p.gym.planner] || 'Training'}</div>
            <div className="title">Week of {shortDate(wk)}</div>
          </div>
          <button type="button" className="pill" onClick={onClose}>Close</button>
        </div>
        <div className="stack">
          {rep.hasData && (
            <Card padding="18px 20px" animate={false}>
              <Label>{reviewWk === thisWk ? 'This week so far' : 'Last week'}</Label>
              <div className="report-row">
                <Stat value={rep.sessions} unit={`of ${rep.target}`} label="Sessions" />
                {rep.km > 0 && <Stat value={rep.km} unit="km" label="Distance" />}
              </div>
              <div className="summary-main" style={{ marginTop: 16 }}>{rep.verdict}</div>
              <div className="meta" dir="auto" style={{ marginTop: 4 }}>
                Anchors closed · {rep.anchors.map(([s, n]) => `${s} ${n}`).join(' · ')}{rep.missed.length ? ` · Missed: ${rep.missed.join(', ')}` : ''}
              </div>
            </Card>
          )}
          <PlanReview key={wk} profile={p} wk={wk} report={rep.hasData ? rep.text : null} initial={existing} onAccept={onAccept} />
        </div>
      </div>
    );
  }

  function ProfileSummary({ profile }) {
    const g = profile.gym, b = profile.biz, s = profile.social;
    const rows = [
      ['GYM', [
        withOther(g.sports, g.other).join(', ') || 'No sport picked',
        g.days.length ? `${g.days.length} fixed day${g.days.length === 1 ? '' : 's'} · ${dayList(g.days)}`
          : g.perWeek ? `${g.perWeek} time${g.perWeek === 1 ? '' : 's'} a week · no fixed days` : null,
        g.planner ? PLANNERS[g.planner] + (g.minutes ? ` · ${g.minutes} min sessions` : '') : null,
        g.planner && g.planner !== 'self' && g.conditions.trim() ? 'Your conditions are noted for the AI' : null,
      ]],
      ['BIZ', [
        b.name || 'Business not described yet',
        b.focus ? `Focus · ${b.focus}` : null,
        b.next.length ? `${b.next.length} next step${b.next.length === 1 ? '' : 's'} from Claude` : null,
      ]],
      ['SOCIAL', [
        `${s.postsPerWeek} post${s.postsPerWeek === 1 ? '' : 's'} a week`,
        linkedPlatforms(s).map((x) => x.label).join(', ') || null,
        s.ideas.length ? `${s.ideas.length} idea${s.ideas.length === 1 ? '' : 's'} from Claude` : null,
      ]],
    ];
    return (
      <div className="summary">
        {rows.map(([k, lines]) => (
          <div key={k} className="summary-row">
            <div className="tag">{k}</div>
            <div className="summary-lines">
              {lines.filter(Boolean).map((l, i) => <div key={i} dir="auto" className={i === 0 ? 'summary-main' : 'meta'}>{l}</div>)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function conditionsHint(sports) {
    if (sports.includes('Cycling')) return 'Road bike. Flat routes near home, one climb 20 minutes away. Indoor trainer when it rains.';
    if (sports.includes('Running')) return 'Park loop of 5 km near home, a track 10 minutes away. My knee feels it after 15 km.';
    if (sports.includes('Gym') || sports.includes('CrossFit')) return 'Gym near the office with full equipment. At home: dumbbells up to 20 kg.';
    if (sports.includes('Swimming')) return '25 m pool, open three mornings a week. Sea swims in summer.';
    return 'Where you train, what gear you have, how much time, anything that hurts.';
  }

  const OB_STEPS = [
    { id: 'welcome', sec: 'LOCKFLOW' },
    { id: 'sports', sec: 'GYM' },
    { id: 'days', sec: 'GYM' },
    { id: 'planner', sec: 'GYM' },
    { id: 'conditions', sec: 'GYM', when: (p) => p.gym.planner === 'ai' || p.gym.planner === 'mix' },
    { id: 'plan', sec: 'GYM', when: (p) => !!p.gym.planner },
    { id: 'bizClaude', sec: 'BIZ', bridge: true },
    { id: 'biz', sec: 'BIZ' },
    { id: 'post', sec: 'SOCIAL' },
    { id: 'content', sec: 'SOCIAL' },
    { id: 'ideas', sec: 'SOCIAL', bridge: true },
    { id: 'done', sec: 'LOCKFLOW' },
  ];
  const visibleSteps = (p, only) => OB_STEPS.filter((s) => (only ? only.includes(s.id) : true) && (!s.when || s.when(p)));

  function Onboarding({ ob, setOb, onDone, onCancel }) {
    const p = ob.profile;
    const steps = visibleSteps(p, ob.only);
    let i = steps.findIndex((s) => s.id === ob.stepId);
    if (i < 0) i = 0;
    const step = steps[i];
    const [parsed, setParsed] = useState(null);
    const bodyRef = React.useRef(null);
    useEffect(() => { setParsed(null); if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [step.id]);

    const setP = (sec, patch) => setOb((o) => ({ ...o, profile: { ...o.profile, [sec]: { ...o.profile[sec], ...patch } } }));
    const advance = (np) => {
      const prof = np || p;
      const ns = visibleSteps(prof, ob.only);
      const j = ns.findIndex((s) => s.id === step.id);
      if (j === -1 || j === ns.length - 1) { onDone(prof); return; }
      setOb((o) => ({ ...o, profile: prof, stepId: ns[j + 1].id }));
    };
    const back = () => { if (i > 0) setOb((o) => ({ ...o, stepId: steps[i - 1].id })); };
    const useParsed = () => {
      if (!parsed) return;
      if (step.id === 'bizClaude') {
        advance({ ...p, biz: { ...p.biz, name: parsed.name || p.biz.name, what: parsed.what || p.biz.what, stage: parsed.stage || p.biz.stage, focus: parsed.focus || p.biz.focus, next: parsed.next.length ? parsed.next : p.biz.next } });
      } else if (step.id === 'ideas') advance({ ...p, social: { ...p.social, style: parsed.style, ideas: parsed.ideas, note: parsed.note } });
    };
    const last = i === steps.length - 1;
    const progress = steps.length > 1 ? i / (steps.length - 1) : 1;

    let body;
    switch (step.id) {
      case 'welcome':
        body = (
          <>
            <div className="ob-wordmark">LOCKFLOW</div>
            <h1 className="ob-q">One anchor a day.</h1>
            <p className="ob-sub">A few questions so LOCKFLOW fits your week: how you train, where your business stands, how often you post. About three minutes. You can change all of it later in Settings.</p>
          </>
        );
        break;
      case 'sports':
        body = (
          <>
            <h1 className="ob-q">What do you train?</h1>
            <p className="ob-sub">Pick everything you do.</p>
            <Chips options={SPORTS} selected={p.gym.sports} onToggle={(v) => setP('gym', { sports: toggleIn(p.gym.sports, v) })} />
            <input id="ob-sport-other" className="field ob-gap" dir="auto" value={p.gym.other} placeholder="Something else"
              onChange={(e) => setP('gym', { other: e.target.value })} />
          </>
        );
        break;
      case 'days': {
        const g = p.gym;
        body = (
          <>
            <h1 className="ob-q">How often can you train?</h1>
            <p className="ob-sub">Pick fixed days, or just a number if your week moves around.</p>
            <div className="ob-label">Fixed days</div>
            <Chips options={DAY3.map((label, value) => ({ label, value }))} selected={g.days}
              onToggle={(v) => setP('gym', { days: toggleIn(g.days, v), perWeek: null })} />
            <div className="ob-or" aria-hidden="true"><span>or</span></div>
            <div className="ob-label">My schedule moves · times a week</div>
            <Chips options={[1, 2, 3, 4, 5, 6, 7]} selected={g.perWeek ? [g.perWeek] : []}
              onToggle={(v) => setP('gym', { perWeek: g.perWeek === v ? null : v, days: [] })} />
            <p className="meta ob-gap" style={{ minHeight: 40 }}>
              {g.days.length ? `${g.days.length} fixed day${g.days.length === 1 ? '' : 's'}: ${dayList(g.days)}. Your weekly ring counts toward this.`
                : g.perWeek ? `${g.perWeek} time${g.perWeek === 1 ? '' : 's'} a week, any days. Every Saturday you plan the next week, so it fits how that week looks.`
                  : ''}
            </p>
          </>
        );
        break;
      }
      case 'planner':
        body = (
          <>
            <h1 className="ob-q">Which training plan?</h1>
            <p className="ob-sub">Every Saturday you get next week’s plan and a short report on this one. You say if you’re happy with it, or change it.</p>
            <div className="options">
              <OptionCard selected={p.gym.planner === 'ai'} onClick={() => setP('gym', { planner: 'ai' })}
                title="AI plan" body="The AI plans your week from your sports, your schedule and what it knows about you. You approve it, or ask for changes." />
              <OptionCard selected={p.gym.planner === 'self'} onClick={() => setP('gym', { planner: 'self' })}
                title="My own plan" body="You write the week yourself. LOCKFLOW shows today’s session and counts the week." />
              <OptionCard selected={p.gym.planner === 'mix'} onClick={() => setP('gym', { planner: 'mix' })}
                title="Mix both" body="The AI drafts a starting plan, then you shape it together around your real conditions: where you train, your gear, your time." />
            </div>
          </>
        );
        break;
      case 'conditions':
        body = (
          <>
            <h1 className="ob-q">What should the AI know?</h1>
            <p className="ob-sub">So it plans for your real life, not a random week. Where you train, your gear, your routes, anything that hurts.</p>
            <textarea id="ob-conditions" className="field" rows={5} dir="auto" value={p.gym.conditions}
              placeholder={conditionsHint(p.gym.sports)} onChange={(e) => setP('gym', { conditions: e.target.value })} />
            <div className="ob-label ob-gap">Time per session</div>
            <Chips options={[30, 45, 60, 90].map((m) => ({ value: m, label: `${m} min` }))} selected={p.gym.minutes ? [p.gym.minutes] : []}
              onToggle={(v) => setP('gym', { minutes: p.gym.minutes === v ? null : v })} />
          </>
        );
        break;
      case 'plan':
        body = (
          <>
            <h1 className="ob-q">{p.gym.planner === 'self' ? 'Write this week' : 'Get this week’s plan'}</h1>
            <p className="ob-sub">
              {p.gym.planner === 'self' ? 'One line per session. You can change it any time.'
                : p.gym.planner === 'mix' ? 'The AI sends a first draft. If it doesn’t fit, say no and shape it together.'
                  : 'The AI plans your week. If it doesn’t fit, say no and tell it what to change.'}
            </p>
            <PlanReview profile={p} wk={weekOf(keyOf(new Date()))} report={null} initial={p.gym.firstPlan}
              onAccept={(plan) => advance({ ...p, gym: { ...p.gym, firstPlan: plan } })} />
          </>
        );
        break;
      case 'bizClaude':
        body = (
          <>
            <h1 className="ob-q">Tell LOCKFLOW about your business</h1>
            <p className="ob-sub">You’ve worked on it with Claude, so let Claude fill this in from your chats. You can edit everything on the next screen.</p>
            <ClaudeBridge id="ob-biz" prompt={bizPrompt(p)} parse={parseBiz} onParsed={setParsed}
              preview={(r) => <PreviewList rows={[['Name', r.name], ['Stage', r.stage], ['Focus', r.focus], ...r.next.map((n) => ['Next', n])].filter(([, v]) => v)} />} />
          </>
        );
        break;
      case 'biz':
        body = (
          <>
            <h1 className="ob-q">Your business</h1>
            <div className="form">
              <label htmlFor="ob-biz-name">Name</label>
              <input id="ob-biz-name" className="field" dir="auto" value={p.biz.name} onChange={(e) => setP('biz', { name: e.target.value })} />
              <label htmlFor="ob-biz-what">What it does</label>
              <textarea id="ob-biz-what" className="field" rows={2} dir="auto" value={p.biz.what} onChange={(e) => setP('biz', { what: e.target.value })} />
              <label htmlFor="ob-biz-stage">Where it stands now</label>
              <input id="ob-biz-stage" className="field" dir="auto" value={p.biz.stage} onChange={(e) => setP('biz', { stage: e.target.value })} />
              <label htmlFor="ob-biz-focus">The one focus this month</label>
              <input id="ob-biz-focus" className="field" dir="auto" value={p.biz.focus} onChange={(e) => setP('biz', { focus: e.target.value })} />
            </div>
            {p.biz.next.length > 0 && (
              <div className="ob-block">
                <div className="eyebrow">Next steps · offered when you set a BIZ anchor</div>
                <div className="rows" style={{ marginTop: 12 }}>
                  {p.biz.next.map((n, k) => (
                    <div className="row" key={k}>
                      <span className="row-title" dir="auto">{n}</span>
                      <button type="button" className="btn-quiet" onClick={() => setP('biz', { next: p.biz.next.filter((_, x) => x !== k) })}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
        break;
      case 'post': {
        const selected = Object.keys(p.social.platforms);
        body = (
          <>
            <h1 className="ob-q">How often do you want to post?</h1>
            <Chips options={[1, 2, 3, 4, 5, 6, 7]} selected={[p.social.postsPerWeek]} onToggle={(v) => setP('social', { postsPerWeek: v })} />
            <p className="ob-sub ob-gap">times a week. Your SOCIAL ring counts toward this.</p>
            <div className="ob-label">Where you post</div>
            <Chips options={PLATFORMS.map((x) => ({ value: x.id, label: x.label }))} selected={selected}
              onToggle={(v) => {
                const next = { ...p.social.platforms };
                if (v in next) delete next[v]; else next[v] = '';
                setP('social', { platforms: next });
              }} />
            {selected.length > 0 && (
              <div className="form ob-gap">
                {PLATFORMS.filter((x) => selected.includes(x.id)).map((x) => (
                  <React.Fragment key={x.id}>
                    <label htmlFor={`ob-link-${x.id}`}>{x.label}</label>
                    <input id={`ob-link-${x.id}`} className="field" dir="ltr" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                      placeholder="@handle or link" value={p.social.platforms[x.id]}
                      onChange={(e) => setP('social', { platforms: { ...p.social.platforms, [x.id]: e.target.value } })} />
                  </React.Fragment>
                ))}
              </div>
            )}
          </>
        );
        break;
      }
      case 'content':
        body = (
          <>
            <h1 className="ob-q">What do you make?</h1>
            <p className="ob-sub">The kinds of videos you post, or want to.</p>
            <Chips options={CONTENT} selected={p.social.types} onToggle={(v) => setP('social', { types: toggleIn(p.social.types, v) })} />
            <input id="ob-content-other" className="field ob-gap" dir="auto" value={p.social.other} placeholder="Something else"
              onChange={(e) => setP('social', { other: e.target.value })} />
          </>
        );
        break;
      case 'ideas':
        body = (
          <>
            <h1 className="ob-q">Let Claude look at your content</h1>
            <p className="ob-sub">Claude reviews your pages and suggests what to post next. The ideas show up when you set a SOCIAL anchor.</p>
            {linkedPlatforms(p.social).length === 0 && (
              <p className="note" style={{ marginBottom: 16 }}>No page links yet, so Claude will work from what it knows about you. You can add links in Settings → Edit setup.</p>
            )}
            <ClaudeBridge id="ob-ideas" prompt={socialPrompt(p)} parse={parseSocial} onParsed={setParsed}
              preview={(r) => <PreviewList rows={r.ideas.map((t) => ['Idea', t])} foot={[r.style, r.note].filter(Boolean).join(' · ')} />} />
          </>
        );
        break;
      default:
        body = (
          <>
            <h1 className="ob-q">You’re set.</h1>
            <p className="ob-sub">This is what LOCKFLOW works with. Change any of it in Settings.</p>
            <ProfileSummary profile={p} />
          </>
        );
    }

    let primary;
    if (step.id === 'plan') {
      primary = p.gym.firstPlan
        ? <button type="button" className="btn btn-lg" onClick={() => advance()}>Continue</button>
        : <button type="button" className="btn-quiet" onClick={() => advance()}>Skip for now</button>;
    } else if (step.bridge) {
      primary = (
        <div className="ob-foot-right">
          <button type="button" className="btn-quiet" onClick={() => advance()}>{step.id === 'bizClaude' ? 'Write it myself' : 'Skip for now'}</button>
          <button type="button" className="btn btn-lg" disabled={!parsed} onClick={useParsed}>Use this</button>
        </div>
      );
    } else {
      const label = step.id === 'welcome' ? 'Start' : step.id === 'done' ? 'Open LOCKFLOW' : last ? 'Save' : 'Continue';
      const disabled = step.id === 'planner' && !p.gym.planner;
      primary = <button type="button" className="btn btn-lg" disabled={disabled} onClick={() => advance()}>{label}</button>;
    }

    return (
      <div className="ob" role="dialog" aria-modal="true" aria-label="Set up LOCKFLOW">
        <div className="ob-head">
          <div className="ob-bar" aria-hidden="true"><span style={{ width: `${Math.max(4, progress * 100)}%` }} /></div>
          <div className="ob-head-row">
            <span className="eyebrow">{step.id === 'welcome' ? '' : step.sec}</span>
            {onCancel && <button type="button" className="text-btn" onClick={onCancel}>Cancel</button>}
          </div>
        </div>
        <div className="ob-body" ref={bodyRef} key={step.id}>{body}</div>
        <div className="ob-foot">
          {i > 0 ? <button type="button" className="btn-quiet" onClick={back}>Back</button> : <span />}
          {primary}
        </div>
      </div>
    );
  }

  /* ---------- app ---------- */
  function useNow() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
      const tick = () => setNow(new Date());
      const id = setInterval(tick, 60000);
      document.addEventListener('visibilitychange', tick);
      window.addEventListener('focus', tick);
      return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); window.removeEventListener('focus', tick); };
    }, []);
    return now;
  }

  function App() {
    const [state, setState] = useState(loadState);
    const now = useNow();
    const today = keyOf(now);
    const autoSession = now.getHours() < state.settings.pmHour ? 'am' : 'pm';
    const [override, setOverride] = useState(null);
    const session = override && override.day === today && override.auto === autoSession ? override.session : autoSession;
    const [tab, setTab] = useState('TODAY');
    const [sheet, setSheet] = useState(false);
    const [planWeek, setPlanWeek] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => { saveState(state); }, [state]);
    useEffect(() => { setState((s) => withDay(s, today)); }, [today]);
    useEffect(() => {
      if (!toast) return undefined;
      const id = setTimeout(() => setToast(null), 2600);
      return () => clearTimeout(id);
    }, [toast]);

    const applyText = (text) => {
      const p = parseSync(text);
      const t = keyOf(new Date());
      setState((s) => applySync(withDay(s, t), p, t));
      setToast(syncSummary(p));
      setTab('TODAY');
    };
    useEffect(() => {
      const handle = () => { const raw = readHashSync(); if (raw != null) applyText(raw); };
      handle();
      window.addEventListener('hashchange', handle);
      return () => window.removeEventListener('hashchange', handle);
    }, []);

    const updateSection = (sec, fn) => setState((s0) => {
      const s = withDay(s0, today);
      const d = s.days[today];
      return { ...s, days: { ...s.days, [today]: { ...d, [sec]: fn(d[sec]) } } };
    });
    const toggleAnchor = (sec) => updateSection(sec, (x) => (x.anchor ? { ...x, anchor: { ...x.anchor, done: !x.anchor.done } } : x));
    const updateProfile = (fn) => setState((s) => (s.profile ? { ...s, profile: fn(s.profile) } : s));

    /* onboarding: first run, or reopened from Settings */
    const onboarded = !!(state.profile && state.profile.onboarded);
    const freshOb = (s) => ({ stepId: 'welcome', profile: s.profile || emptyProfile(), only: null });
    const ob = state.onboarding || (onboarded ? null : freshOb(state));
    const setOb = (fn) => setState((s) => ({ ...s, onboarding: fn(s.onboarding || freshOb(s)) }));
    const finishOnboarding = (prof) => {
      const wk = weekOf(keyOf(new Date()));
      setState((s) => {
        const plans = { ...s.plans };
        if (prof.gym.firstPlan && prof.gym.firstPlan.sessions.length) plans[wk] = prof.gym.firstPlan;
        return {
          ...s, plans,
          profile: { ...prof, gym: { ...prof.gym, firstPlan: null }, onboarded: true },
          onboarding: null,
          settings: { ...s.settings, weekGoal: prof.gym.days.length || prof.gym.perWeek || s.settings.weekGoal },
        };
      });
      setTab('TODAY');
    };
    const openPlan = (wk) => { setSheet(false); setPlanWeek(wk); };
    const acceptPlan = (wk, plan) => {
      setState((s) => ({ ...s, plans: { ...s.plans, [wk]: plan } }));
      setPlanWeek(null);
      setToast(`Plan locked in · week of ${shortDate(wk)}`);
    };
    const skipWeek = (wk) => setState((s) => ({ ...s, plans: { ...s.plans, [wk]: { sessions: [], goal: '', note: '', status: 'skipped' } } }));
    const openSetup = (only) => {
      setSheet(false);
      setState((s) => ({ ...s, onboarding: { stepId: only ? only[0] : 'sports', profile: s.profile || emptyProfile(), only } }));
    };

    if (ob) {
      return (
        <div className="app">
          <Onboarding ob={ob} setOb={setOb} onDone={finishOnboarding}
            onCancel={onboarded ? () => setState((s) => ({ ...s, onboarding: null })) : null} />
          {toast && <div className="toast" role="status">{toast}</div>}
        </div>
      );
    }

    let content;
    if (tab === 'TODAY') {
      content = session === 'am'
        ? <TodayAM state={state} today={today} onToggleAnchor={toggleAnchor} goTab={setTab} openSettings={() => setSheet(true)} openPlan={openPlan} skipWeek={skipWeek} />
        : <TodayPM state={state} today={today} onToggleAnchor={toggleAnchor} openPlan={openPlan} skipWeek={skipWeek} />;
    } else {
      content = <SectionScreen key={tab} sec={tab} state={state} today={today} updateSection={updateSection} updateProfile={updateProfile} openPlan={openPlan} skipWeek={skipWeek} />;
    }

    return (
      <div className="app">
        <header className="top">
          <div>
            <div className="eyebrow">{tab}</div>
            <div className="title">{session === 'am' ? longDate(now) : 'Closing the day'}</div>
          </div>
          <button type="button" className="pill" aria-label={session === 'am' ? 'Switch to evening close-out' : 'Switch to morning plan'}
            onClick={() => setOverride({ day: today, auto: autoSession, session: session === 'am' ? 'pm' : 'am' })}>
            {session === 'am' ? '9:00 AM' : '8:00 PM'}
          </button>
        </header>
        <main className="scroll" key={tab + session}>{content}</main>
        <div className="fade" aria-hidden="true" />
        <FloatingBar items={TABS} active={tab} onChange={setTab}
          style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', zIndex: 3 }} />
        {sheet && <Settings state={state} setState={setState} onClose={() => setSheet(false)} flash={setToast} applyText={applyText} openSetup={openSetup} openPlan={openPlan} />}
        {planWeek && state.profile && (
          <PlanSheet state={state} wk={planWeek} onClose={() => setPlanWeek(null)} onAccept={(plan) => acceptPlan(planWeek, plan)} />
        )}
        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();

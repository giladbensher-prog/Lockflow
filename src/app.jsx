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
    profile: null, onboarding: null,
  });

  /* ---------- profile (from onboarding) ---------- */
  const emptyProfile = () => ({
    gym: { sports: [], other: '', days: [], planner: null, plan: null },
    biz: { name: '', what: '', stage: '', focus: '', next: [] },
    social: { postsPerWeek: 3, platforms: {}, types: [], other: '', style: '', ideas: [], note: '' },
  });
  function mergeProfile(p) {
    if (!p) return null;
    const e = emptyProfile();
    return { ...p, gym: { ...e.gym, ...(p.gym || {}) }, biz: { ...e.biz, ...(p.biz || {}) }, social: { ...e.social, ...(p.social || {}) } };
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
        return {
          ...d, ...s,
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
  function gymPrompt(p) {
    const g = p.gym;
    const days = [...g.days].sort((a, b) => a - b);
    return [
      'I’m setting up LOCKFLOW, my daily planning app. Plan my training week.',
      `Sports: ${withOther(g.sports, g.other).join(', ') || 'not set'}`,
      `Training days: ${days.map((d) => WEEKDAYS[d]).join(', ') || 'any'}`,
      'Use what you know about my fitness and goals from our conversations. One workout per training day, short enough for one line: what, how much, how hard.',
      RULES, '',
      'LOCKFLOW-GYM',
      ...(days.length ? days : [0, 1, 2, 3, 4, 5, 6]).map((d) => `${DAYKEY[d]}: the workout`),
      'GOAL: what this week builds toward, one sentence',
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
      const m = line.replace(/^[\s>*\-`#]+/, '').replace(/\*\*/g, '').match(/^([A-Za-z]{2,6})\s*[:：]\s*(.*)$/);
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
  function parseGym(text) {
    const r = { days: {}, goal: '' };
    parseKV(text).forEach(([k, v]) => {
      const i = DAYKEY.indexOf(k);
      if (i > -1) r.days[i] = v; else if (k === 'GOAL') r.goal = v;
    });
    r.ok = Object.keys(r.days).length > 0;
    return r;
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
      const planned = g.plan && g.plan.days ? g.plan.days[dow] : null;
      if (planned) out.suggestions.push({ label: 'Today’s plan', title: planned });
      else if (g.days.length && !g.days.includes(dow)) out.note = 'Rest day. Nothing planned — set an anchor only if you want one.';
      if (g.plan && g.plan.goal) out.focus = { label: 'This week', text: g.plan.goal };
    } else if (sec === 'BIZ') {
      profile.biz.next.forEach((t) => out.suggestions.push({ label: 'Next step', title: t }));
      if (profile.biz.focus) out.focus = { label: 'Focus this month', text: profile.biz.focus };
    } else if (sec === 'SOCIAL') {
      profile.social.ideas.forEach((t) => out.suggestions.push({ label: 'Idea', title: t }));
      out.links = linkedPlatforms(profile.social);
    }
    return out;
  }

  function SectionScreen({ sec, state, today, updateSection, updateProfile }) {
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
    return (
      <div className="stack">
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
        <div style={{ height: 12 }} />
        {sec === 'GYM'
          ? <GymStats state={state} today={today} weekGoal={state.settings.weekGoal} />
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

  function TodayAM({ state, today, onToggleAnchor, goTab, openSettings }) {
    const day = state.days[today] || emptyDay();
    const sync = state.sync;
    const synced = sync && sync.date === today;
    return (
      <div className="stack">
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
                         {plan ? <><span className="chip-label">Today’s plan</span><span dir="auto">{plan.title}</span></>
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

  function TodayPM({ state, today, onToggleAnchor }) {
    const day = state.days[today] || emptyDay();
    const open = SECTIONS.filter((s) => day[s].anchor && !day[s].anchor.done);
    return (
      <div className="stack">
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

  function Settings({ state, setState, onClose, flash, applyText, openSetup }) {
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
                <div className="eyebrow">Ask Claude again</div>
                {state.profile.gym.planner === 'claude' && <button type="button" className="btn-quiet" onClick={() => openSetup(['plan'])}>New training week</button>}
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

  function ProfileSummary({ profile }) {
    const g = profile.gym, b = profile.biz, s = profile.social;
    const rows = [
      ['GYM', [
        withOther(g.sports, g.other).join(', ') || 'No sport picked',
        g.days.length ? `${g.days.length} day${g.days.length === 1 ? '' : 's'} a week · ${dayList(g.days)}` : null,
        g.planner === 'claude' ? (g.plan ? 'Claude plans · this week is ready' : 'Claude plans your workouts') : g.planner === 'self' ? 'You plan your workouts' : null,
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

  const OB_STEPS = [
    { id: 'welcome', sec: 'LOCKFLOW' },
    { id: 'sports', sec: 'GYM' },
    { id: 'days', sec: 'GYM' },
    { id: 'planner', sec: 'GYM' },
    { id: 'plan', sec: 'GYM', bridge: true, when: (p) => p.gym.planner === 'claude' },
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
      if (step.id === 'plan') advance({ ...p, gym: { ...p.gym, plan: { days: parsed.days, goal: parsed.goal, at: keyOf(new Date()) } } });
      else if (step.id === 'bizClaude') {
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
      case 'days':
        body = (
          <>
            <h1 className="ob-q">Which days can you train?</h1>
            <p className="ob-sub">{p.gym.days.length ? `${p.gym.days.length} day${p.gym.days.length === 1 ? '' : 's'} a week.` : 'Pick the days that usually work.'} Your weekly ring counts toward this.</p>
            <Chips options={DAY3.map((label, value) => ({ label, value }))} selected={p.gym.days}
              onToggle={(v) => setP('gym', { days: toggleIn(p.gym.days, v) })} />
          </>
        );
        break;
      case 'planner':
        body = (
          <>
            <h1 className="ob-q">Who plans your workouts?</h1>
            <div className="options">
              <OptionCard selected={p.gym.planner === 'claude'} onClick={() => setP('gym', { planner: 'claude' })}
                title="Claude plans them" body="Claude builds your week from your sports, your days and what it knows about you. Each morning LOCKFLOW shows today’s workout." />
              <OptionCard selected={p.gym.planner === 'self'} onClick={() => setP('gym', { planner: 'self' })}
                title="I plan my own" body="LOCKFLOW keeps the anchor and counts the week. You decide what each session is." />
            </div>
          </>
        );
        break;
      case 'plan':
        body = (
          <>
            <h1 className="ob-q">Get this week from Claude</h1>
            <p className="ob-sub">One workout for each training day. Claude uses what it already knows about you from your chats.</p>
            <ClaudeBridge id="ob-plan" prompt={gymPrompt(p)} parse={parseGym} onParsed={setParsed}
              preview={(r) => <PreviewList rows={Object.keys(r.days).map(Number).sort((a, b) => a - b).map((d) => [DAY3[d], r.days[d]])} foot={r.goal} />} />
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
    if (step.bridge) {
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
      setState((s) => ({
        ...s,
        profile: { ...prof, onboarded: true },
        onboarding: null,
        settings: { ...s.settings, weekGoal: prof.gym.days.length || s.settings.weekGoal },
      }));
      setTab('TODAY');
    };
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
        ? <TodayAM state={state} today={today} onToggleAnchor={toggleAnchor} goTab={setTab} openSettings={() => setSheet(true)} />
        : <TodayPM state={state} today={today} onToggleAnchor={toggleAnchor} />;
    } else {
      content = <SectionScreen key={tab} sec={tab} state={state} today={today} updateSection={updateSection} updateProfile={updateProfile} />;
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
        {sheet && <Settings state={state} setState={setState} onClose={() => setSheet(false)} flash={setToast} applyText={applyText} openSetup={openSetup} />}
        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();

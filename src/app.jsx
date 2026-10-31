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
  const defaults = () => ({ v: 1, days: {}, health: {}, sync: null, settings: { weekGoal: 4, pmHour: 16 } });

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        return { ...defaults(), ...s, settings: { ...defaults().settings, ...(s.settings || {}) } };
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

  function AnchorEditor({ anchor, suggestion, onSave, onClear }) {
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
          onChange={(e) => setTitle(e.target.value)} placeholder="The one thing that makes today a success" />
        <input id="anchor-why" className="field" dir="auto" value={why} enterKeyHint="done"
          onChange={(e) => setWhy(e.target.value)} placeholder="Why it matters (optional)" />
        {suggestion && !title && (
          <button type="button" className="chip" onClick={() => { setTitle(suggestion.title); setWhy(suggestion.why || ''); }}>
            Still open from yesterday · <span dir="auto">{suggestion.title}</span>
          </button>
        )}
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
    return (
      <div className="two-col">
        <Card index={2} tint={tint} padding={20} style={colCard}>
          <ProgressRing value={closed} max={7} size={64}>{closed}</ProgressRing>
          <div className="meta">of 7 anchors closed<br />last 7 days</div>
        </Card>
        <Card index={3} tint={tint} padding={20} style={colCard}>
          <Stat value={done} label="Tasks done · 7 days" />
        </Card>
      </div>
    );
  }

  function SectionScreen({ sec, state, today, updateSection }) {
    const day = state.days[today] || emptyDay();
    const s = day[sec];
    const [editing, setEditing] = useState(false);
    const prev = prevDayKey(state, today);
    const prevAnchor = prev && state.days[prev][sec].anchor && !state.days[prev][sec].anchor.done ? state.days[prev][sec].anchor : null;
    const tint = sec === 'SOCIAL' ? 'var(--social-tint)' : undefined;
    const toggleEdit = () => {
      if (editing) updateSection(sec, (x) => ({ ...x, tasks: x.tasks.filter((t) => t.title.trim()) }));
      setEditing(!editing);
    };
    return (
      <div className="stack">
        {(s.anchor || s.tasks.length > 0) && (
          <div className="screen-tools"><button type="button" className="text-btn" onClick={toggleEdit}>{editing ? 'Done' : 'Edit'}</button></div>
        )}
        {!s.anchor || editing ? (
          <AnchorEditor key={String(editing)} anchor={s.anchor} suggestion={!s.anchor ? prevAnchor : null}
            onSave={(a) => { updateSection(sec, (x) => ({ ...x, anchor: a })); if (editing) toggleEdit(); }}
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
              return (
                <div key={sec} className="anchor-row">
                  <div className="tag">{sec}</div>
                  {a ? <TaskItem title={a.title} done={a.done} onToggle={() => onToggleAnchor(sec)} />
                     : <button type="button" className="ghost-row" onClick={() => goTab(sec)}>Set the {sec} anchor</button>}
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

  function Settings({ state, setState, onClose, flash, applyText }) {
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

    let content;
    if (tab === 'TODAY') {
      content = session === 'am'
        ? <TodayAM state={state} today={today} onToggleAnchor={toggleAnchor} goTab={setTab} openSettings={() => setSheet(true)} />
        : <TodayPM state={state} today={today} onToggleAnchor={toggleAnchor} />;
    } else {
      content = <SectionScreen key={tab} sec={tab} state={state} today={today} updateSection={updateSection} />;
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
        {sheet && <Settings state={state} setState={setState} onClose={() => setSheet(false)} flash={setToast} applyText={applyText} />}
        {toast && <div className="toast" role="status">{toast}</div>}
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();

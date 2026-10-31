/* @ds-bundle: {"format":4,"namespace":"LOCKFLOWDesignSystem_076a4d","components":[{"name":"Anchor","sourcePath":"components/core/Anchor.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"DailyReport","sourcePath":"components/core/DailyReport.jsx"},{"name":"DotGrid","sourcePath":"components/core/DotGrid.jsx"},{"name":"FloatingBar","sourcePath":"components/core/FloatingBar.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"LineChart","sourcePath":"components/core/LineChart.jsx"},{"name":"PaceBar","sourcePath":"components/core/PaceBar.jsx"},{"name":"ProgressRing","sourcePath":"components/core/ProgressRing.jsx"},{"name":"Stat","sourcePath":"components/core/Stat.jsx"},{"name":"TaskItem","sourcePath":"components/core/TaskItem.jsx"}],"sourceHashes":{"components/core/Anchor.jsx":"8f66c03ab823","components/core/Card.jsx":"52a7fe46e089","components/core/DailyReport.jsx":"d8c18915acc1","components/core/DotGrid.jsx":"f62a3e25f1ad","components/core/FloatingBar.jsx":"b0ddd4db1169","components/core/Icon.jsx":"9808515ee7db","components/core/LineChart.jsx":"4283a28ffe21","components/core/PaceBar.jsx":"939e93ea86c3","components/core/ProgressRing.jsx":"e63fc38c3988","components/core/Stat.jsx":"130960968d47","components/core/TaskItem.jsx":"a228682949b3","ui_kits/lockflow/BizScreen.jsx":"515e2554c704","ui_kits/lockflow/GymScreen.jsx":"bc829cf359ca","ui_kits/lockflow/Shell.jsx":"84fb8eb67482","ui_kits/lockflow/SocialScreen.jsx":"231bbfdec9e1","ui_kits/lockflow/data.js":"a8f42ed25e11"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LOCKFLOWDesignSystem_076a4d = window.LOCKFLOWDesignSystem_076a4d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Card.jsx
try { (() => {
// Tone-stepped surface. Sizes vary on purpose; never an even grid.
function Card({
  children,
  level = 1,
  radius = 'md',
  padding = 20,
  tint,
  style,
  onClick,
  index = 0,
  animate = true,
  ...rest
}) {
  const bg = tint || (level === 0 ? 'var(--bg-1)' : level === 2 ? 'var(--surface-card-2)' : 'var(--surface-card)');
  const rad = radius === 'lg' ? 'var(--radius-lg)' : radius === 'sm' ? 'var(--radius-sm)' : 'var(--radius-md)';
  return React.createElement('div', {
    onClick,
    ...rest,
    style: {
      background: bg,
      borderRadius: rad,
      padding,
      boxSizing: 'border-box',
      boxShadow: 'var(--shadow-card)',
      cursor: onClick ? 'pointer' : 'default',
      animation: animate ? `lf-in var(--dur-slow) var(--ease-out) ${index * 40}ms both` : undefined,
      ...style
    }
  }, children);
}
if (typeof document !== 'undefined' && !document.getElementById('lf-kf')) {
  const s = document.createElement('style');
  s.id = 'lf-kf';
  s.textContent = '@keyframes lf-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes lf-dot{from{opacity:0;transform:scale(.4)}to{transform:none}}';
  document.head.appendChild(s);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/DailyReport.jsx
try { (() => {
// 8 PM close-out. Verdict, one number, up to three actions, optional warning.
function DailyReport({
  verdict,
  number,
  unit,
  numberLabel,
  actions = [],
  warning,
  index = 0
}) {
  const acts = actions.slice(0, 3);
  return React.createElement('div', {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      padding: 24,
      boxSizing: 'border-box',
      animation: `lf-in var(--dur-slow) var(--ease-out) ${index * 40}ms both`
    }
  }, React.createElement('div', {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      fontWeight: 500
    }
  }, 'Closing the day'), React.createElement('div', {
    dir: 'auto',
    style: {
      marginTop: 12,
      fontSize: 'var(--text-title)',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      color: 'var(--fg-1)',
      lineHeight: 1.25,
      textWrap: 'pretty'
    }
  }, verdict), number !== undefined && React.createElement('div', {
    style: {
      marginTop: 24,
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, React.createElement('span', {
    style: {
      fontSize: 'var(--text-hero)',
      fontWeight: 600,
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 1,
      color: 'var(--fg-1)'
    }
  }, number), React.createElement('span', {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-2)'
    }
  }, unit)), numberLabel && React.createElement('div', {
    style: {
      marginTop: 6,
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)'
    }
  }, numberLabel), acts.length > 0 && React.createElement('div', {
    style: {
      marginTop: 28,
      display: 'grid',
      gap: 10
    }
  }, React.createElement('div', {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      fontWeight: 500,
      marginBottom: 2
    }
  }, 'Tomorrow'), acts.map((a, i) => React.createElement('div', {
    key: i,
    dir: 'auto',
    style: {
      display: 'flex',
      gap: 12,
      fontSize: 'var(--text-body-size)',
      color: 'var(--fg-1)',
      lineHeight: 'var(--leading-body)'
    }
  }, React.createElement('span', {
    style: {
      color: 'var(--fg-3)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, i + 1), React.createElement('span', null, a)))), warning && React.createElement('div', {
    dir: 'auto',
    style: {
      marginTop: 24,
      padding: '12px 14px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--warn-dim)',
      color: 'var(--warn)',
      fontSize: 'var(--text-label)',
      lineHeight: 'var(--leading-body)'
    }
  }, warning));
}
Object.assign(__ds_scope, { DailyReport });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/DailyReport.jsx", error: String((e && e.message) || e) }); }

// components/core/DotGrid.jsx
try { (() => {
// Three months of days. lit/dim/dark. Past months faded, today ringed. Dots light in a wave on entry.
function DotGrid({
  months,
  today,
  dot = 7,
  gap = 7,
  cols = 7
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16
    }
  }, months.map((m, mi) => {
    const current = mi === months.length - 1;
    return React.createElement('div', {
      key: mi,
      style: {
        opacity: current ? 1 : 0.55,
        transition: 'opacity var(--dur-base)'
      }
    }, React.createElement('div', {
      style: {
        fontSize: 'var(--text-label)',
        color: current ? 'var(--fg-1)' : 'var(--fg-3)',
        marginBottom: 10,
        letterSpacing: '0.02em'
      }
    }, m.label), React.createElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols},${dot}px)`,
        gap
      }
    }, m.days.map((d, di) => {
      const isToday = current && today === di + 1;
      const bg = d === 2 ? 'var(--dot-lit)' : d === 1 ? 'var(--dot-dim)' : 'var(--dot-dark)';
      return React.createElement('span', {
        key: di,
        style: {
          width: dot,
          height: dot,
          borderRadius: '50%',
          background: bg,
          boxShadow: isToday ? '0 0 0 2px var(--surface-card),0 0 0 3px var(--fg-1)' : undefined,
          animation: `lf-dot var(--dur-slow) var(--ease-out) ${(mi * m.days.length + di) * 8}ms both`
        }
      });
    })));
  }));
}
Object.assign(__ds_scope, { DotGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/DotGrid.jsx", error: String((e && e.message) || e) }); }

// components/core/FloatingBar.jsx
try { (() => {
// Glass bar, lifted off the bottom. The only place blur is used.
function FloatingBar({
  items = ['GYM', 'BIZ', 'SOCIAL'],
  active,
  onChange,
  style
}) {
  return React.createElement('div', {
    style: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 20,
      height: 56,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--bar-glass)',
      backdropFilter: 'blur(var(--bar-blur))',
      WebkitBackdropFilter: 'blur(24px)',
      boxShadow: 'var(--shadow-bar)',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: 4,
      boxSizing: 'border-box',
      ...style
    }
  }, items.map(it => {
    const on = it === active;
    return React.createElement('button', {
      key: it,
      onClick: () => onChange && onChange(it),
      style: {
        flex: 1,
        height: '100%',
        border: 0,
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--surface-raised)' : 'transparent',
        color: on ? 'var(--fg-1)' : 'var(--fg-3)',
        fontSize: 'var(--text-label)',
        fontWeight: 600,
        letterSpacing: 'var(--tracking-label)',
        cursor: 'pointer',
        font: 'inherit',
        transition: 'background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)'
      }
    }, it);
  }));
}
Object.assign(__ds_scope, { FloatingBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/FloatingBar.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
// Thin-stroke Lucide glyph. Requires lucide UMD (https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js) on window.lucide.
function Icon({
  name,
  size = 18,
  stroke = 1.5,
  color = 'currentColor',
  style
}) {
  const def = typeof window !== 'undefined' && window.lucide && window.lucide.icons && window.lucide.icons[name];
  if (!def) return React.createElement('span', {
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      ...style
    }
  });
  const kids = Array.isArray(def[0]) ? def : def[2] || def;
  return React.createElement('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style
  }, kids.map(([tag, attrs], i) => React.createElement(tag, {
    key: i,
    ...attrs
  })));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/LineChart.jsx
try { (() => {
// Direction only. Smooth line, soft area fill, no axes.
function LineChart({
  data,
  width = 280,
  height = 64,
  color = 'var(--accent)',
  fill = true,
  strokeWidth = 1.5,
  style
}) {
  const min = Math.min(...data),
    max = Math.max(...data),
    rng = max - min || 1;
  const pts = data.map((v, i) => [i / (data.length - 1) * width, height - 4 - (v - min) / rng * (height - 8)]);
  let d = 'M' + pts[0].join(',');
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1],
      [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  const id = React.useId ? React.useId().replace(/:/g, '') : 'lfg';
  return React.createElement('svg', {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    style: {
      display: 'block',
      overflow: 'visible',
      ...style
    }
  }, fill && React.createElement('defs', null, React.createElement('linearGradient', {
    id,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1
  }, React.createElement('stop', {
    offset: 0,
    stopColor: color,
    stopOpacity: 0.22
  }), React.createElement('stop', {
    offset: 1,
    stopColor: color,
    stopOpacity: 0
  }))), fill && React.createElement('path', {
    d: d + ` L${width},${height} L0,${height} Z`,
    fill: `url(#${id})`
  }), React.createElement('path', {
    d,
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round'
  }));
}
Object.assign(__ds_scope, { LineChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/LineChart.jsx", error: String((e && e.message) || e) }); }

// components/core/PaceBar.jsx
try { (() => {
// Weekly pace per project. Quiet, comparable, stacked.
function PaceBar({
  label,
  value,
  max,
  unit,
  index = 0
}) {
  const [w, setW] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setW(Math.min(1, value / max) * 100), 60 + index * 60);
    return () => clearTimeout(t);
  }, [value, max, index]);
  const done = value >= max;
  return React.createElement('div', {
    style: {
      display: 'grid',
      gap: 8
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, React.createElement('span', {
    dir: 'auto',
    style: {
      fontSize: 'var(--text-body-size)',
      color: 'var(--fg-1)'
    }
  }, label), React.createElement('span', {
    style: {
      fontSize: 'var(--text-label)',
      color: done ? 'var(--accent)' : 'var(--fg-2)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, `${value} of ${max}${unit ? ' ' + unit : ''}`)), React.createElement('div', {
    style: {
      height: 3,
      borderRadius: 2,
      background: 'var(--surface-raised)',
      overflow: 'hidden'
    }
  }, React.createElement('div', {
    style: {
      height: '100%',
      width: w + '%',
      background: done ? 'var(--accent)' : 'var(--fg-2)',
      borderRadius: 2,
      transition: 'width 700ms var(--ease-out)'
    }
  })));
}
Object.assign(__ds_scope, { PaceBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/PaceBar.jsx", error: String((e && e.message) || e) }); }

// components/core/ProgressRing.jsx
try { (() => {
// Arc first, number second. Draws itself on mount.
function ProgressRing({
  value = 0,
  max = 1,
  size = 72,
  stroke = 4,
  children,
  label,
  delay = 0
}) {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setP(Math.min(1, value / max)), 40 + delay);
    return () => clearTimeout(t);
  }, [value, max, delay]);
  const r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  return React.createElement('div', {
    style: {
      position: 'relative',
      width: size,
      height: size
    }
  }, React.createElement('svg', {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, React.createElement('circle', {
    cx: size / 2,
    cy: size / 2,
    r,
    fill: 'none',
    stroke: 'var(--surface-raised)',
    strokeWidth: stroke
  }), React.createElement('circle', {
    cx: size / 2,
    cy: size / 2,
    r,
    fill: 'none',
    stroke: 'var(--accent)',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeDasharray: c,
    strokeDashoffset: c * (1 - p),
    style: {
      transition: 'stroke-dashoffset 900ms var(--ease-out)'
    }
  })), React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.26,
      fontWeight: 600,
      color: 'var(--fg-1)',
      letterSpacing: '-0.02em'
    }
  }, children !== undefined ? children : label));
}
Object.assign(__ds_scope, { ProgressRing });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ProgressRing.jsx", error: String((e && e.message) || e) }); }

// components/core/Stat.jsx
try { (() => {
// Hero number with quiet unit + label. Counts up on mount.
function Stat({
  value,
  unit,
  label,
  size = 'number',
  format,
  duration = 800,
  style
}) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    let raf, start;
    const from = 0,
      to = Number(value) || 0;
    const tick = t => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setN(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  const fmt = format || (v => Number.isInteger(Number(value)) ? Math.round(v).toLocaleString('de-DE') : v.toFixed(1));
  const fs = size === 'hero' ? 'var(--text-hero)' : size === 'title' ? 'var(--text-title)' : 'var(--text-number)';
  return React.createElement('div', {
    style
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, React.createElement('span', {
    style: {
      fontSize: fs,
      fontWeight: 600,
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 1,
      color: 'var(--fg-1)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, fmt(n)), unit && React.createElement('span', {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-2)'
    }
  }, unit)), label && React.createElement('div', {
    style: {
      marginTop: 6,
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)'
    }
  }, label));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Stat.jsx", error: String((e && e.message) || e) }); }

// components/core/TaskItem.jsx
try { (() => {
// Checkbox + task + project tag. Completing is the one satisfying moment.
function TaskItem({
  title,
  tag,
  done = false,
  onToggle,
  size = 'md'
}) {
  const big = size === 'lg';
  const d = big ? 32 : 22;
  return React.createElement('button', {
    onClick: onToggle,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: big ? 16 : 12,
      width: '100%',
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      textAlign: 'start',
      font: 'inherit',
      color: 'inherit'
    }
  }, React.createElement('span', {
    style: {
      width: d,
      height: d,
      borderRadius: '50%',
      flexShrink: 0,
      border: `1.5px solid ${done ? 'var(--accent)' : 'var(--fg-3)'}`,
      background: done ? 'var(--accent)' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-out)'
    }
  }, React.createElement('svg', {
    width: d * 0.5,
    height: d * 0.5,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'var(--accent-ink)',
    strokeWidth: 2.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: {
      opacity: done ? 1 : 0,
      transform: done ? 'scale(1)' : 'scale(.6)',
      transition: 'all var(--dur-base) var(--ease-out)'
    }
  }, React.createElement('path', {
    d: 'M5 12l5 5L20 7'
  }))), React.createElement('span', {
    dir: 'auto',
    style: {
      flex: 1,
      minWidth: 0,
      fontSize: big ? 'var(--text-title)' : 'var(--text-body-size)',
      fontWeight: big ? 600 : 400,
      letterSpacing: big ? '-0.02em' : 0,
      color: done ? 'var(--fg-3)' : 'var(--fg-1)',
      textDecoration: done ? 'line-through' : 'none',
      textDecorationColor: 'var(--fg-4)',
      transition: 'color var(--dur-slow) var(--ease-out)'
    }
  }, title), tag && React.createElement('span', {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      flexShrink: 0
    }
  }, tag));
}
Object.assign(__ds_scope, { TaskItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TaskItem.jsx", error: String((e && e.message) || e) }); }

// components/core/Anchor.jsx
try { (() => {
// The one non-negotiable task. First thing the eye lands on.
function Anchor({
  title,
  why,
  done = false,
  onToggle,
  index = 0
}) {
  return React.createElement('div', {
    style: {
      background: done ? 'var(--bg-1)' : 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 24px 24px',
      boxSizing: 'border-box',
      border: '1px solid var(--border-subtle)',
      animation: `lf-in var(--dur-slow) var(--ease-out) ${index * 40}ms both`,
      transition: 'background var(--dur-slow) var(--ease-out)'
    }
  }, React.createElement('div', {
    style: {
      fontSize: 'var(--text-label)',
      color: done ? 'var(--accent)' : 'var(--fg-3)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      marginBottom: 18,
      fontWeight: 500
    }
  }, done ? 'Anchor closed' : 'Today\'s anchor'), React.createElement(__ds_scope.TaskItem, {
    title,
    done,
    onToggle,
    size: 'lg'
  }), why && React.createElement('div', {
    dir: 'auto',
    style: {
      marginTop: 14,
      marginLeft: 48,
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)',
      lineHeight: 'var(--leading-body)'
    }
  }, why));
}
Object.assign(__ds_scope, { Anchor });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Anchor.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lockflow/BizScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Anchor,
  Stat,
  ProgressRing,
  LineChart,
  PaceBar,
  Card
} = window.LOCKFLOWDesignSystem_076a4d;
function BizScreen({
  d,
  done,
  setDone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Anchor, {
    title: d.anchor.title,
    why: d.anchor.why,
    done: done.anchor,
    onToggle: () => setDone(s => ({
      ...s,
      anchor: !s.anchor
    })),
    index: 0
  }), /*#__PURE__*/React.createElement(TaskList, {
    tasks: d.tasks,
    done: done.tasks,
    onToggle: i => setDone(s => {
      const t = [...s.tasks];
      t[i] = !t[i];
      return {
        ...s,
        tasks: t
      };
    }),
    index: 1
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(Card, {
    index: 2,
    padding: "20px 20px 18px"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, d.paces.map((p, i) => /*#__PURE__*/React.createElement(PaceBar, _extends({
    key: p.label
  }, p, {
    index: i
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.3fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    index: 3,
    padding: 20,
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 150
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: d.revenue,
    unit: "\u20AA",
    label: "Revenue \xB7 this month"
  }), /*#__PURE__*/React.createElement(LineChart, {
    data: d.revenueTrend,
    width: 140,
    height: 36
  })), /*#__PURE__*/React.createElement(Card, {
    index: 4,
    padding: 20,
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 150
    }
  }, /*#__PURE__*/React.createElement(ProgressRing, {
    value: d.users.value,
    max: d.users.max,
    size: 64,
    stroke: 3
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, Math.round(d.users.value / d.users.max * 100), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)'
    }
  }, d.users.value, " of ", d.users.max, /*#__PURE__*/React.createElement("br", null), "users"))), /*#__PURE__*/React.createElement(Card, {
    index: 5,
    padding: "18px 20px"
  }, /*#__PURE__*/React.createElement(Stat, {
    value: d.followers,
    label: "Followers \xB7 all channels"
  })));
}
window.BizScreen = BizScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lockflow/BizScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lockflow/GymScreen.jsx
try { (() => {
const {
  Anchor,
  TaskItem,
  Stat,
  ProgressRing,
  DotGrid,
  LineChart,
  Card
} = window.LOCKFLOWDesignSystem_076a4d;
function TaskList({
  tasks,
  done,
  onToggle,
  index
}) {
  return /*#__PURE__*/React.createElement(Card, {
    index: index,
    padding: "18px 20px"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 16
    }
  }, tasks.map((t, i) => /*#__PURE__*/React.createElement(TaskItem, {
    key: i,
    title: t.title,
    tag: t.tag,
    done: !!done[i],
    onToggle: () => onToggle(i)
  }))));
}
function GymScreen({
  d,
  done,
  setDone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Anchor, {
    title: d.anchor.title,
    why: d.anchor.why,
    done: done.anchor,
    onToggle: () => setDone(s => ({
      ...s,
      anchor: !s.anchor
    })),
    index: 0
  }), /*#__PURE__*/React.createElement(TaskList, {
    tasks: d.tasks,
    done: done.tasks,
    onToggle: i => setDone(s => {
      const t = [...s.tasks];
      t[i] = !t[i];
      return {
        ...s,
        tasks: t
      };
    }),
    index: 1
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.3fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    index: 2,
    padding: 20,
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 150
    }
  }, /*#__PURE__*/React.createElement(ProgressRing, {
    value: d.sessions.value,
    max: d.sessions.max,
    size: 64
  }, d.sessions.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)'
    }
  }, "of ", d.sessions.max, " sessions", /*#__PURE__*/React.createElement("br", null), "this week")), /*#__PURE__*/React.createElement(Card, {
    index: 3,
    padding: 20,
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 150
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-number)',
      fontWeight: 600,
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 1
    }
  }, d.pace), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-2)'
    }
  }, "/km")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)'
    }
  }, "Running pace"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--accent)',
      marginTop: 2
    }
  }, d.paceDelta)))), /*#__PURE__*/React.createElement(Card, {
    index: 4,
    padding: "20px 20px 18px"
  }, /*#__PURE__*/React.createElement(DotGrid, {
    months: d.months,
    today: d.today
  })), /*#__PURE__*/React.createElement(Card, {
    index: 5,
    padding: "18px 20px",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Stat, {
    value: d.volumeTotal,
    unit: "km",
    label: "Volume \xB7 last 7 days"
  })), /*#__PURE__*/React.createElement(LineChart, {
    data: d.volume,
    width: 130,
    height: 44
  })));
}
window.GymScreen = GymScreen;
window.TaskList = TaskList;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lockflow/GymScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lockflow/Shell.jsx
try { (() => {
const {
  FloatingBar
} = window.LOCKFLOWDesignSystem_076a4d;
function Shell({
  tab,
  onTab,
  children,
  session,
  onSession
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 390,
      height: 844,
      background: 'var(--bg-0)',
      borderRadius: 44,
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      color: 'var(--fg-1)',
      boxShadow: '0 0 0 1px var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 54,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: '0 28px 0',
      fontSize: 14,
      fontWeight: 600,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 60,
      height: 6,
      borderRadius: 3,
      background: 'var(--fg-1)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 54,
      bottom: 0,
      left: 0,
      right: 0,
      overflowY: 'auto',
      padding: '16px 20px 110px',
      boxSizing: 'border-box',
      scrollbarWidth: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      fontWeight: 500
    }
  }, tab), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-title)',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      marginTop: 4
    }
  }, session === 'am' ? 'Wednesday, 17 Sep' : 'Closing the day')), /*#__PURE__*/React.createElement("button", {
    onClick: () => onSession(session === 'am' ? 'pm' : 'am'),
    style: {
      background: 'var(--surface-card)',
      border: 0,
      color: 'var(--fg-2)',
      fontSize: 'var(--text-label)',
      fontWeight: 600,
      letterSpacing: 'var(--tracking-label)',
      padding: '8px 12px',
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      font: 'inherit'
    }
  }, session === 'am' ? '9:00 AM' : '8:00 PM')), children), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 140,
      background: 'linear-gradient(to top,var(--bg-0) 30%,transparent)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement(FloatingBar, {
    active: tab,
    onChange: onTab
  }));
}
window.Shell = Shell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lockflow/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lockflow/SocialScreen.jsx
try { (() => {
const {
  Anchor,
  ProgressRing,
  Card
} = window.LOCKFLOWDesignSystem_076a4d;
function SocialScreen({
  d,
  done,
  setDone
}) {
  const tint = 'var(--social-tint)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Anchor, {
    title: d.anchor.title,
    why: d.anchor.why,
    done: done.anchor,
    onToggle: () => setDone(s => ({
      ...s,
      anchor: !s.anchor
    })),
    index: 0
  }), /*#__PURE__*/React.createElement(TaskList, {
    tasks: d.tasks,
    done: done.tasks,
    onToggle: i => setDone(s => {
      const t = [...s.tasks];
      t[i] = !t[i];
      return {
        ...s,
        tasks: t
      };
    }),
    index: 1
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement(Card, {
    index: 2,
    tint: tint,
    padding: 20,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(ProgressRing, {
    value: d.spoke.value,
    max: d.spoke.max,
    size: 64
  }, d.spoke.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-body-size)',
      color: 'var(--fg-1)',
      lineHeight: 1.4,
      textWrap: 'pretty'
    }
  }, "You spoke to ", d.spoke.value, " people this week.", /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)',
      marginTop: 4
    }
  }, "You reached out first to ", d.reached, " of them."))), /*#__PURE__*/React.createElement(Card, {
    index: 3,
    tint: tint,
    padding: "18px 20px"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-label)',
      color: 'var(--fg-3)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      fontWeight: 500,
      marginBottom: 14
    }
  }, "People"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 14
    }
  }, d.people.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: p.state === 'warm' ? 'var(--fg-1)' : 'var(--dot-dark)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    dir: "auto",
    style: {
      flex: 1,
      fontSize: 'var(--text-body-size)',
      color: p.state === 'warm' ? 'var(--fg-1)' : 'var(--fg-2)'
    }
  }, p.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-label)',
      color: p.state === 'quiet' ? 'var(--warn)' : 'var(--fg-3)'
    }
  }, p.state === 'quiet' ? 'going quiet · ' + p.last : p.last))))));
}
window.SocialScreen = SocialScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lockflow/SocialScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lockflow/data.js
try { (() => {
const mk = (n, s) => Array.from({
  length: n
}, (_, i) => {
  const v = (i * 7 + s) % 9;
  return v < 2 ? 0 : v < 4 ? 1 : 2;
});
window.LF_DATA = {
  gym: {
    anchor: {
      title: 'Long run — 12 km, easy pace',
      why: 'The half is in five weeks. Distance is what is behind, not speed.'
    },
    tasks: [{
      title: 'Mobility, 15 min',
      tag: 'gym'
    }, {
      title: 'לרשום משקלים מאימון אתמול',
      tag: 'gym'
    }, {
      title: 'Book Thursday spin class',
      tag: 'gym'
    }],
    sessions: {
      value: 3,
      max: 4
    },
    pace: '5:12',
    paceDelta: '−0:08 vs last month',
    volume: [42, 44, 41, 47, 49, 55, 58],
    volumeTotal: 58,
    months: [{
      label: 'Jul',
      days: mk(31, 1)
    }, {
      label: 'Aug',
      days: mk(31, 4)
    }, {
      label: 'Sep',
      days: mk(17, 2)
    }],
    today: 17
  },
  biz: {
    anchor: {
      title: 'Ship the onboarding flow',
      why: 'Blocks the Friday launch. Everything else can wait.'
    },
    tasks: [{
      title: 'Reply to store supplier',
      tag: 'store'
    }, {
      title: 'לערוך את הסרטון של יום ראשון',
      tag: 'content'
    }, {
      title: 'Post brand thread',
      tag: 'brand'
    }],
    users: {
      value: 612,
      max: 1000
    },
    revenue: 4820,
    revenueTrend: [2.1, 2.4, 2.2, 3.0, 3.4, 3.9, 4.8],
    followers: 12400,
    paces: [{
      label: 'App',
      value: 3,
      max: 3,
      unit: 'tasks'
    }, {
      label: 'Content',
      value: 1,
      max: 4,
      unit: 'videos'
    }, {
      label: 'Store',
      value: 2,
      max: 5,
      unit: 'listings'
    }, {
      label: 'Brand',
      value: 0,
      max: 2,
      unit: 'posts'
    }]
  },
  social: {
    anchor: {
      title: 'להתקשר לאמא',
      why: 'Ten days since you last spoke. It does not need a reason.'
    },
    tasks: [{
      title: 'Reply to Dana about Saturday',
      tag: 'friends'
    }, {
      title: 'לקבוע עם יוני ריצה',
      tag: 'friends'
    }],
    spoke: {
      value: 4,
      max: 6
    },
    reached: 2,
    people: [{
      name: 'Dana',
      last: '2 days ago',
      state: 'warm'
    }, {
      name: 'יוני',
      last: '6 days ago',
      state: 'warm'
    }, {
      name: 'Omer',
      last: '3 weeks ago',
      state: 'quiet'
    }, {
      name: 'נועה',
      last: '5 weeks ago',
      state: 'quiet'
    }, {
      name: 'Tal',
      last: 'Yesterday',
      state: 'warm'
    }]
  },
  report: {
    verdict: 'Anchor closed. A quiet, solid day.',
    number: 3,
    unit: 'of 4',
    numberLabel: 'Workouts this week',
    actions: ['Mobility before the long run', 'Reply to Dana about Saturday', 'Ship onboarding — start with the empty state'],
    warning: 'You increased training volume too fast — hold steady this week.'
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lockflow/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Anchor = __ds_scope.Anchor;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DailyReport = __ds_scope.DailyReport;

__ds_ns.DotGrid = __ds_scope.DotGrid;

__ds_ns.FloatingBar = __ds_scope.FloatingBar;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.LineChart = __ds_scope.LineChart;

__ds_ns.PaceBar = __ds_scope.PaceBar;

__ds_ns.ProgressRing = __ds_scope.ProgressRing;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.TaskItem = __ds_scope.TaskItem;

})();

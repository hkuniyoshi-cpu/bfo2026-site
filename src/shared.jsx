// shared.jsx — 共有ロジック・SVG・データフック

const EVENT_DATE = new Date('2026-07-07T11:00:00+09:00');

function useCountdown(target = EVENT_DATE) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, diff };
}

// translations.jsx の I18N をベースに、スプレッドシート由来の content.text で上書き
// content が未取得 / text フィールドが空の場合はベースをそのまま返す
function useTranslation(lang, content) {
  const base = (window.I18N && window.I18N[lang]) || window.I18N.ja;
  if (!content || !content.text || Object.keys(content.text).length === 0) return base;
  const merged = deepMerge(base, content.text);
  // ── CTA の価格・ボタン文言は translations.jsx を「正」とする ──
  // 理由: スプレッドシートに旧構造の値（例 hero.ctaSub="事前申込無料・当日参加5,000円"）が
  //       残っていると、読み込み後に上書きされて (1) 一瞬古い表記がちらつく
  //       (2) 上部ヒーローと下部CTAの表記がずれる、という不具合になる。
  //       これらは固定マーケティング文言なのでスプレッドシート管理対象から外す。
  const PROTECTED = {
    hero: ['cta', 'ctaSub', 'ctaSubFree', 'ctaLimit'],
    cta:  ['btn', 'sub', 'subFree', 'limit'],
  };
  Object.keys(PROTECTED).forEach(section => {
    if (merged[section] && base[section]) {
      PROTECTED[section].forEach(k => {
        if (base[section][k] !== undefined) merged[section][k] = base[section][k];
      });
    }
  });
  return merged;
}

// 浅いコピーでベースを保持しつつ、text の値で上書き（空文字列は無視）
function deepMerge(base, override) {
  const result = Array.isArray(base) ? [...base] : { ...base };
  Object.keys(override || {}).forEach(key => {
    const o = override[key];
    if (o === undefined || o === null) return;
    if (typeof o === 'object' && !Array.isArray(o) && typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
      result[key] = deepMerge(base[key], o);
    } else if (typeof o === 'string') {
      // 空文字列はベース維持（スプレッドシートの誤入力で消えないように）
      if (o.trim() !== '') result[key] = o;
    } else {
      result[key] = o;
    }
  });
  return result;
}

// Apps Script Web App から動的コンテンツを取得
function useContent(lang) {
  const [data, setData] = React.useState({
    news: [], zoom: [], exhibitors: [],
    schedule: [], marquee: [], restaurants: [],
    venueZones: {}, text: {}, meta: {}, settings: {},
    _state: 'loading',
  });
  React.useEffect(() => {
    const url = window.CONFIG && window.CONFIG.WEB_APP_URL;
    if (!url || url === 'PASTE_HERE_AFTER_DEPLOY') {
      console.warn('⚠ useContent: WEB_APP_URL が未設定です');
      setData(d => ({ ...d, _state: 'unconfigured' }));
      return;
    }
    let cancelled = false;
    setData(d => ({ ...d, text: {}, meta: {}, _state: 'loading' }));
    // キャッシュバスター: 分単位の値を URL に付与
    // → 同じ分内の重複リクエストはブラウザ/CDN がキャッシュヒット
    // → 分が変わると新規 URL になり強制的に最新を取得
    const minuteBucket = Math.floor(Date.now() / 60000);
    const fetchUrl = `${url}?action=content&lang=${encodeURIComponent(lang)}&_=${minuteBucket}`;

    // タイムアウト付き fetch（GAS の cold start で稀に 30s 以上ハングする対策）
    const fetchWithTimeout = (u, ms = 15000) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      return fetch(u, { signal: ctrl.signal }).finally(() => clearTimeout(t));
    };

    // リトライ付き取得（指数バックオフ: 1s, 3s, 6s）
    const attemptFetch = async (attempt = 0) => {
      const maxAttempts = 3;
      try {
        console.log(`📡 useContent: 取得中 (attempt ${attempt + 1}/${maxAttempts})`, fetchUrl);
        const r = await fetchWithTimeout(fetchUrl);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (cancelled) return;
        console.log('✓ useContent: 取得成功');
        setData({ ...json, _state: 'ready' });
        // 日本語ロード完了後、他言語を裏でプリウォーム
        if (lang === 'ja') {
          ['en', 'zh', 'ko'].forEach(l => {
            fetchWithTimeout(`${url}?action=content&lang=${encodeURIComponent(l)}`, 15000).catch(() => {});
          });
        }
      } catch (err) {
        if (cancelled) return;
        console.warn(`✕ useContent: attempt ${attempt + 1} failed`, err);
        if (attempt + 1 < maxAttempts) {
          const wait = [1000, 3000, 6000][attempt] || 6000;
          setTimeout(() => { if (!cancelled) attemptFetch(attempt + 1); }, wait);
        } else {
          console.error('✕ useContent: 全試行失敗', err);
          setData(d => ({ ...d, _state: 'error', _error: String(err) }));
        }
      }
    };
    attemptFetch(0);
    return () => { cancelled = true; };
  }, [lang]);
  return data;
}

const pad = (n, len = 2) => String(n).padStart(len, '0');

const BINGATA = {
  shu: '#d63b2c', ki: '#f0b429', ai: '#1e5a82',
  midori: '#3a8a5e', momo: '#e88aa3', kuro: '#1a1612', shiroi: '#fbf6ec',
};

const OCEAN = {
  deep: '#062b3d', navy: '#0c4a6e', blue: '#1d7eb8',
  turquoise: '#3fb8c4', light: '#a8e0e6', sand: '#f5ead0', sun: '#f6c744',
};

const YT_ID = 'eSgsJMw9c6M';

function BingataWavePattern({ color = '#d63b2c', opacity = 0.08, id = 'bingata' }) {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <pattern id={id} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 0 40 Q 20 20, 40 40 T 80 40" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity} />
          <path d="M 0 60 Q 20 40, 40 60 T 80 60" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity} />
          <circle cx="20" cy="20" r="2" fill={color} opacity={opacity * 1.5} />
          <circle cx="60" cy="20" r="2" fill={color} opacity={opacity * 1.5} />
        </pattern>
      </defs>
    </svg>
  );
}

function SisaSilhouette({ color = '#d63b2c', size = 120, style }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={style}>
      <circle cx="50" cy="42" r="32" fill={color} opacity="0.9" />
      <circle cx="30" cy="35" r="10" fill="none" stroke="#fbf6ec" strokeWidth="2" opacity="0.7" />
      <circle cx="70" cy="35" r="10" fill="none" stroke="#fbf6ec" strokeWidth="2" opacity="0.7" />
      <circle cx="30" cy="55" r="8" fill="none" stroke="#fbf6ec" strokeWidth="2" opacity="0.7" />
      <circle cx="70" cy="55" r="8" fill="none" stroke="#fbf6ec" strokeWidth="2" opacity="0.7" />
      <ellipse cx="50" cy="55" rx="18" ry="20" fill={color} />
      <circle cx="42" cy="50" r="3" fill="#fbf6ec" />
      <circle cx="58" cy="50" r="3" fill="#fbf6ec" />
      <circle cx="42" cy="50" r="1.5" fill="#1a1612" />
      <circle cx="58" cy="50" r="1.5" fill="#1a1612" />
      <path d="M 38 65 Q 50 75, 62 65 L 60 70 Q 50 78, 40 70 Z" fill="#1a1612" />
      <rect x="44" y="66" width="2" height="4" fill="#fbf6ec" />
      <rect x="54" y="66" width="2" height="4" fill="#fbf6ec" />
    </svg>
  );
}

function Hibiscus({ color = '#d63b2c', size = 80, style }) {
  const deep = color;
  const light = color;
  const petalPath = "M 50 50 C 30 40, 18 18, 38 6 C 44 14, 50 6, 50 12 C 50 6, 56 14, 62 6 C 82 18, 70 40, 50 50 Z";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={style}>
      <defs>
        <radialGradient id={`hib-grad-${color.replace('#','')}`} cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#fff7d6" />
          <stop offset="35%" stopColor="#fce28a" />
          <stop offset="60%" stopColor={light} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map(angle => (
        <g key={angle} transform={`rotate(${angle} 50 50)`}>
          <path d={petalPath} fill={`url(#hib-grad-${color.replace('#','')})`} stroke={deep} strokeWidth="0.6" opacity="0.95" />
          <path d="M 50 50 Q 50 30, 50 14" stroke={deep} strokeWidth="0.8" fill="none" opacity="0.55" />
          <path d="M 50 50 C 44 44, 42 38, 46 32 C 50 36, 50 36, 54 32 C 58 38, 56 44, 50 50 Z" fill="#7a1a14" opacity="0.6" />
        </g>
      ))}
      <circle cx="50" cy="50" r="4.5" fill="#7a1a14" />
      <line x1="50" y1="50" x2="50" y2="84" stroke="#f6c744" strokeWidth="1.6" strokeLinecap="round" />
      <g fill="#f6c744">
        <circle cx="48" cy="68" r="1.2" /><circle cx="52" cy="66" r="1.2" />
        <circle cx="47" cy="72" r="1.2" /><circle cx="53" cy="74" r="1.2" />
        <circle cx="49" cy="78" r="1.2" /><circle cx="51" cy="80" r="1.2" />
      </g>
      <g fill="#d63b2c">
        <circle cx="50" cy="84" r="1.8" /><circle cx="47" cy="83" r="1.4" />
        <circle cx="53" cy="83" r="1.4" /><circle cx="48.5" cy="86" r="1.4" />
        <circle cx="51.5" cy="86" r="1.4" />
      </g>
    </svg>
  );
}

function PalmLeaf({ color = '#2a8a5f', size = 80, style }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={style}>
      <path d="M 50 92 Q 50 60, 55 30 Q 58 10, 50 4" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {[14, 26, 40, 56, 72].map((y, i) => (
        <path key={`l-${i}`} d={`M ${50 - i*0.3} ${y} Q ${30 - i*2} ${y - 2 - i*1.5}, ${10 + i*1.5} ${y - 8 - i*2}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      ))}
      {[18, 30, 44, 60, 76].map((y, i) => (
        <path key={`r-${i}`} d={`M ${50 + i*0.3} ${y} Q ${70 + i*2} ${y - 2 - i*1.5}, ${90 - i*1.5} ${y - 8 - i*2}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      ))}
      {[14, 26, 40, 56, 72].map((y, i) => (
        <path key={`lf-${i}`} d={`M ${50 - i*0.3} ${y} Q ${30 - i*2} ${y - 2 - i*1.5}, ${10 + i*1.5} ${y - 8 - i*2} L ${15 + i*1.5} ${y - 4 - i*2} Q ${32 - i*2} ${y + 1}, ${50 - i*0.3} ${y + 2} Z`} fill={color} opacity="0.6" />
      ))}
      {[18, 30, 44, 60, 76].map((y, i) => (
        <path key={`rf-${i}`} d={`M ${50 + i*0.3} ${y} Q ${70 + i*2} ${y - 2 - i*1.5}, ${90 - i*1.5} ${y - 8 - i*2} L ${85 - i*1.5} ${y - 4 - i*2} Q ${68 + i*2} ${y + 1}, ${50 + i*0.3} ${y + 2} Z`} fill={color} opacity="0.6" />
      ))}
    </svg>
  );
}

function Sun({ color = '#f6c744', size = 80, style }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={style}>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const x1 = 50 + Math.cos(angle) * 30;
        const y1 = 50 + Math.sin(angle) * 30;
        const x2 = 50 + Math.cos(angle) * 44;
        const y2 = 50 + Math.sin(angle) * 44;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3.5" strokeLinecap="round" />;
      })}
      <circle cx="50" cy="50" r="22" fill={color} />
      <circle cx="50" cy="50" r="22" fill="#fff" opacity="0.15" />
    </svg>
  );
}

function Bubble({ color = '#5db8e0', size = 30, style }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={style}>
      <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="1.8" />
      <circle cx="20" cy="20" r="16" fill={color} opacity="0.15" />
      <ellipse cx="14" cy="13" rx="4" ry="3" fill="#fff" opacity="0.8" />
    </svg>
  );
}

function StarSand({ color = '#f6c744', size = 24, style }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={style}>
      <path d="M 20 4 L 23 17 L 36 20 L 23 23 L 20 36 L 17 23 L 4 20 L 17 17 Z" fill={color} />
    </svg>
  );
}

Object.assign(window, {
  EVENT_DATE, useCountdown, useTranslation, useContent, pad, deepMerge,
  BINGATA, OCEAN, YT_ID,
  BingataWavePattern, SisaSilhouette, Hibiscus,
  PalmLeaf, Sun, Bubble, StarSand,
});

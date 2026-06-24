// VariantA2 — 案A白基調アニメーション強化版（本番用：動的コンテンツ対応）
// News / Zoom / Exhibitors / Restaurants設定 は Apps Script Web App から取得

const a2 = {
  bg: '#ffffff', bgSoft: '#fbf6ec', fg: '#1a1612', fgSoft: '#5a4a3a',
  shu: '#d63b2c', ki: '#f0b429', ai: '#1e5a82', midori: '#3a8a5e', momo: '#e88aa3',
  border: '#1a161222',
};

const A2_CSS = `
@keyframes a2-fade-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
@keyframes a2-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes a2-slide-r { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes a2-slide-l { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes a2-scale-in { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
@keyframes a2-rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes a2-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(2deg); } }
@keyframes a2-float-2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(-3deg); } }
@keyframes a2-pulse { 0%,100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.05); opacity: 1; } }
@keyframes a2-pulse-ring { 0% { transform: scale(.8); opacity: .8; } 100% { transform: scale(2); opacity: 0; } }
@keyframes a2-wave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
@keyframes a2-marquee { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }
@keyframes a2-blink { 0%, 60% { opacity: 1; } 65%, 100% { opacity: 0.3; } }
@keyframes a2-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes a2-tick { 0% { transform: scale(1); } 50% { transform: scale(1.18); } 100% { transform: scale(1); } }
@keyframes a2-stripe { from { background-position: 0 0; } to { background-position: 40px 0; } }
@keyframes a2-glow { 0%,100% { filter: drop-shadow(0 0 0px ${a2.shu}); } 50% { filter: drop-shadow(0 0 20px ${a2.shu}); } }
@keyframes a2-letter-rise { from { transform: translateY(110%); } to { transform: translateY(0); } }
@keyframes a2-confetti { 0% { transform: translateY(-20px) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(100vh) rotate(540deg); opacity: 0; } }
@keyframes a2-burst { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
@keyframes a2-jitter { 0%,100% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } }
@keyframes a2-skel { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

/* CTA 強調用 */
@keyframes a2-limit-pulse {
  0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(214,59,44,0.45); }
  50%     { transform: scale(1.06); box-shadow: 0 0 0 6px rgba(214,59,44,0); }
}
@keyframes a2-limit-flash {
  0%,90%,100% { background: #ffe44a; color: #1a1612; }
  45%         { background: #1a1612; color: #ffe44a; }
}
@keyframes a2-price-bob {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-3px); }
}
@keyframes a2-cta-glow {
  0%,100% { box-shadow: 6px 6px 0 #1a1612, 0 0 0 0 rgba(214,59,44,0); }
  50%     { box-shadow: 6px 6px 0 #1a1612, 0 0 0 14px rgba(214,59,44,0); }
}
@keyframes a2-cta-glow-2 {
  0%   { box-shadow: 6px 6px 0 #1a1612, 0 0 0 0 rgba(214,59,44,0.55); }
  60%  { box-shadow: 6px 6px 0 #1a1612, 0 0 0 18px rgba(214,59,44,0); }
  100% { box-shadow: 6px 6px 0 #1a1612, 0 0 0 0 rgba(214,59,44,0); }
}
.a2-cta-glow      { animation: a2-cta-glow-2 2.4s ease-out infinite; }
.a2-limit-badge   { animation: a2-limit-pulse 1.8s ease-in-out infinite; }
.a2-limit-flash   { animation: a2-limit-flash 3.2s ease-in-out infinite; }
.a2-price-bob     { animation: a2-price-bob 1.6s ease-in-out infinite; }

.a2-reveal { opacity: 0; }
.a2-reveal.a2-in { animation: a2-fade-up .9s cubic-bezier(.2,.7,.3,1) forwards; }
.a2-reveal-r { opacity: 0; }
.a2-reveal-r.a2-in { animation: a2-slide-r .9s cubic-bezier(.2,.7,.3,1) forwards; }
.a2-reveal-l { opacity: 0; }
.a2-reveal-l.a2-in { animation: a2-slide-l .9s cubic-bezier(.2,.7,.3,1) forwards; }
.a2-reveal-scale { opacity: 0; }
.a2-reveal-scale.a2-in { animation: a2-scale-in .8s cubic-bezier(.2,.7,.3,1) forwards; }
.a2-float { animation: a2-float 6s ease-in-out infinite; }
.a2-float-2 { animation: a2-float-2 7s ease-in-out infinite; }
.a2-rotate-slow { animation: a2-rotate-slow 30s linear infinite; }
.a2-blink { animation: a2-blink 1s steps(2) infinite; }
.a2-stripe-anim { animation: a2-stripe 1s linear infinite; }
.a2-link-underline { background-image: linear-gradient(${a2.shu}, ${a2.shu}); background-size: 0 2px; background-repeat: no-repeat; background-position: 0 100%; transition: background-size .35s cubic-bezier(.2,.7,.3,1); padding-bottom: 4px; }
.a2-link-underline:hover { background-size: 100% 2px; }
.a2-btn-shu { position: relative; overflow: hidden; transition: transform .25s, box-shadow .25s; }
.a2-btn-shu::before { content: ''; position: absolute; inset: 0; background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.4) 50%, transparent 70%); transform: translateX(-100%); transition: transform .6s; }
.a2-btn-shu:hover { transform: translate(-3px, -3px); box-shadow: 9px 9px 0 ${a2.fg} !important; }
.a2-btn-shu:hover::before { transform: translateX(100%); }
.a2-btn-shu:active { transform: translate(2px, 2px); box-shadow: 4px 4px 0 ${a2.fg} !important; }
.a2-card-hover { transition: transform .35s cubic-bezier(.2,.7,.3,1), box-shadow .35s; }
.a2-card-hover:hover { transform: translate(-4px, -4px); }
.a2-shimmer-text { background: linear-gradient(90deg, ${a2.fg} 0%, ${a2.fg} 40%, ${a2.shu} 50%, ${a2.fg} 60%, ${a2.fg} 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: a2-shimmer 4s linear infinite; }
.a2-pulse-dot { position: relative; }
.a2-pulse-dot::before { content: ''; position: absolute; inset: -4px; border-radius: 50%; background: currentColor; opacity: .4; animation: a2-pulse-ring 1.6s cubic-bezier(.215,.61,.355,1) infinite; }
.a2-tick { animation: a2-tick .35s ease-out; }
.a2-marquee-track { display: flex; gap: 60px; white-space: nowrap; animation: a2-marquee 30s linear infinite; }
.a2-marquee-track:hover { animation-play-state: paused; }
.a2-glow { animation: a2-glow 3s ease-in-out infinite; }
.a2-jitter { animation: a2-jitter 4s ease-in-out infinite; transform-origin: center; }
.a2-letter-mask { display: inline-block; overflow: hidden; vertical-align: bottom; }
.a2-letter-mask > span { display: inline-block; transform: translateY(110%); }
.a2-in .a2-letter-mask > span { animation: a2-letter-rise .9s cubic-bezier(.2,.8,.2,1) forwards; }
.a2-confetti-piece { position: absolute; top: -30px; width: 10px; height: 16px; animation: a2-confetti 7s linear infinite; pointer-events: none; }
.a2-radar-ring { position: absolute; border-radius: 50%; border: 2px solid ${a2.shu}; animation: a2-burst 2.4s ease-out infinite; }
.a2-skel { background: linear-gradient(90deg, #efe9dd 0%, #f7f1e3 50%, #efe9dd 100%); background-size: 200% 100%; animation: a2-skel 1.6s linear infinite; border-radius: 4px; }

/* タイムテーブル：狭い画面では時刻と内容を縦並び（改行回避） */
@media (max-width: 720px) {
  .a2-schedule-row { grid-template-columns: 1fr !important; gap: 10px !important; padding: 16px 0 !important; }
  .a2-schedule-row > div:first-child { text-align: left !important; font-size: 22px !important; }
  .a2-schedule-row > div:nth-child(2) { display: none !important; }
}

/* =============================================
   モバイル対応 (≤ 767px)
   ============================================= */
.a2-nav-links    { display: flex; }
.a2-nav-hamburger { display: none !important; }
.a2-mobile-menu  { display: none; }
.a2-mobile-menu.open { display: flex !important; }

@media (max-width: 767px) {
  /* ── ナビ ── */
  .a2-nav-links    { display: none !important; }
  .a2-nav-hamburger { display: flex !important; }
  .a2-nav-line-btn span { display: none; }   /* LINE テキスト非表示 */
  .a2-nav-lang-label   { display: none !important; } /* 言語名テキスト非表示・🌐+▼のみ表示 */
  .a2-nav-lang button  { padding: 0 12px !important; gap: 6px !important; } /* コンパクト化 */

  /* ── セクション共通パディング ── */
  section { padding-top: 64px !important; padding-bottom: 80px !important;
            padding-left: 20px !important; padding-right: 20px !important; }

  /* ── ヒーロー ── */
  .a2-hero-h1  { font-size: 44px !important; letter-spacing: -0.02em !important; }
  .a2-hero-sub { font-size: 15px !important; }
  .a2-hero-decos { display: none !important; }
  .a2-hero-cta { padding: 16px 24px !important; font-size: 14px !important; }

  /* ── カウントダウン ── */
  .a2-countdown     { padding: 14px 16px !important; box-shadow: 4px 4px 0 ${a2.shu} !important; }
  .a2-flip-item     { min-width: 52px !important; }
  .a2-flip-num      { font-size: 30px !important; }
  .a2-countdown-sep { font-size: 22px !important; margin: 0 6px !important; }

  /* ── セクションタイトル h2 ── */
  .a2-section-h2 { font-size: 36px !important; }

  /* ── 2カラム → 1カラム ── */
  .a2-event-grid    { grid-template-columns: 1fr !important; gap: 40px !important; }
  .a2-greeting-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
  .a2-access-grid   { grid-template-columns: 1fr !important; }

  /* ── Greeting 画像ボックスのオフセット装飾を抑制 ── */
  .a2-greeting-img-wrap { margin-bottom: 14px !important; }

  /* ── アクセス マップ高さ ── */
  .a2-access-map { aspect-ratio: 4/3 !important; }

  /* ── 出展企業 カウント数字 ── */
  .a2-exhibitors-count { font-size: 56px !important; }

  /* ── 出展企業セクションだけタイトル直下を詰める ── */
  #exhibitors { padding-top: 16px !important; padding-bottom: 60px !important; }
  #exhibitors .a2-exhibitors-grid { margin-top: 8px !important; }
  #exhibitors h2.a2-section-h2 { font-size: 32px !important; }
  /* モバイルでカテゴリボタンを横スクロール 1 行表示に */
  #exhibitors .a2-exhibitors-cats {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    margin-left: -20px;
    margin-right: -20px;
    padding-left: 20px;
    padding-right: 20px;
  }
  #exhibitors .a2-exhibitors-cats button { flex-shrink: 0; padding: 8px 14px !important; font-size: 12px !important; }
  #exhibitors .a2-exhibitors-cats::-webkit-scrollbar { display: none; }

  /* ── お知らせ 行レイアウトをモバイルで2行化（タイトル折り返し改善） ── */
  .a2-news-row {
    grid-template-columns: auto 1fr auto !important;
    grid-template-areas: "date tag arrow" "title title title" !important;
    gap: 8px 12px !important;
    row-gap: 10px !important;
    padding: 16px 4px !important;
  }
  .a2-news-row .a2-news-date  { grid-area: date; font-size: 12px !important; }
  .a2-news-row .a2-news-tag   { grid-area: tag; padding: 4px 12px !important; min-width: 0 !important; justify-self: start; }
  .a2-news-row .a2-news-arrow { grid-area: arrow; }
  .a2-news-row .a2-news-title {
    grid-area: title;
    font-size: 14.5px !important;
    line-height: 1.55 !important;
    word-break: auto-phrase;
    overflow-wrap: break-word;
  }

  /* ── ヴェニューレイアウト ブースインデックス ── */
  .a2-booth-index { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important; }

  /* ── Zoom・News カード ── */
  .a2-zoom-grid { grid-template-columns: 1fr !important; }

  /* ── Producer セクション ── */
  .a2-producer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
  .a2-producer-photo-wrap { max-width: 260px !important; margin: 0 auto !important; }
  .a2-producer-deco { font-size: 96px !important; top: 18px !important; right: -8px !important; }
  .a2-producer-section { padding: 64px 20px !important; }
  .a2-producer-name { font-size: 26px !important; }

  /* ── タイトル系 全体的に画面端の余白を確保 ── */
  .a2-cta-title { font-size: 28px !important; }
}

/* タブレット (768px～1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .a2-greeting-grid { grid-template-columns: 320px 1fr !important; gap: 40px !important; }
  .a2-event-grid    { gap: 40px !important; }
}
`;

function useA2Css() {
  React.useEffect(() => {
    if (document.getElementById('a2-css')) return;
    const s = document.createElement('style');
    s.id = 'a2-css'; s.textContent = A2_CSS;
    document.head.appendChild(s);
  }, []);
}

function useReveal(rootRef) {
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('.a2-reveal, .a2-reveal-r, .a2-reveal-l, .a2-reveal-scale');
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('a2-in');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('a2-in'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    els.forEach(el => { if (!el.classList.contains('a2-in')) io.observe(el); });
    return () => io.disconnect();
  }, []);
}

function VariantA2({ lang, onLangChange, fontFamily }) {
  useA2Css();
  const cd = useCountdown();
  const content = useContent(lang);
  const t = useTranslation(lang, content);
  const rootRef = React.useRef(null);
  useReveal(rootRef);

  // HTML title / description をスプレッドシートのメタ情報で動的に更新
  React.useEffect(() => {
    if (content && content.meta && content.meta.title) {
      document.title = content.meta.title;
    }
    if (content && content.meta && content.meta.description) {
      let m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', content.meta.description);
    }
    if (content && content.meta && content.meta.ogTitle) {
      let m = document.querySelector('meta[property="og:title"]');
      if (m) m.setAttribute('content', content.meta.ogTitle);
    }
    if (content && content.meta && content.meta.ogDesc) {
      let m = document.querySelector('meta[property="og:description"]');
      if (m) m.setAttribute('content', content.meta.ogDesc);
    }
  }, [content && content.meta && content.meta.title, content && content.meta && content.meta.description]);

  const clicksRef = React.useRef([]);
  const [pinPrompt, setPinPrompt] = React.useState(false);

  const onLogoClick = () => {
    const now = Date.now();
    clicksRef.current = [...clicksRef.current.filter(t => now - t < 3000), now];
    if (clicksRef.current.length >= 5) {
      clicksRef.current = [];
      setPinPrompt(true);
    }
  };

  React.useEffect(() => {
    if (!pinPrompt) return;
    if (!window.CONFIG || !window.CONFIG.CHECKIN_PIN) {
      console.warn('⚠ window.CONFIG.CHECKIN_PIN が読み込まれていません');
      alert('設定ファイル読込中です。少し待ってからもう一度お試しください。');
      setPinPrompt(false);
      return;
    }
    const expected = String(window.CONFIG.CHECKIN_PIN).trim();
    const remembered = localStorage.getItem('bfo2026_checkin_unlocked') === '1';
    if (remembered) {
      window.location.href = 'bfo77.html';
      return;
    }
    const input = window.prompt('管理者PINを入力してください（4桁）');
    if (input !== null && String(input).trim() === expected) {
      localStorage.setItem('bfo2026_checkin_unlocked', '1');
      window.location.href = 'bfo77.html';
    } else if (input !== null) {
      console.warn('PIN認証失敗。入力長:', String(input).length, ' 期待長:', expected.length);
      alert('PINが違います');
    }
    setPinPrompt(false);
  }, [pinPrompt]);

  const root = {
    width: '100%', minHeight: '100%',
    background: a2.bg, color: a2.fg,
    fontFamily: fontFamily || '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif',
    overflow: 'hidden', position: 'relative',
  };

  return (
    <div ref={rootRef} style={root} data-screen-label="A v2 · 白×アニメ">
      <A2Nav lang={lang} onLangChange={onLangChange} t={t} onLogoClick={onLogoClick} />
      <A2Hero t={t} cd={cd} />
      <A2Marquee content={content} />
      <A2News t={t} content={content} />
      <A2Event t={t} />
      <A2Greeting t={t} />
      <A2Video t={t} content={content} />
      <A2Schedule t={t} content={content} />
      <A2VenueLayout t={t} content={content} lang={lang} exhibitors={content.exhibitors || []} />
      <A2Exhibitors t={t} content={content} />
      <A2Zoom t={t} content={content} />
      <A2Restaurants t={t} content={content} />
      <A2Access t={t} />
      <A2Producer t={t} />
      <A2Contact t={t} />
      <A2Cta t={t} />
      <A2Sponsors t={t} />
      <A2Footer t={t} />
    </div>
  );
}

// セクションへのスムーズスクロール（カスタムスクロールコンテナ対応）
function scrollToSection(id) {
  return (e) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const root = document.querySelector('[data-screen-label="A v2 · 白×アニメ"]')?.parentElement;
    const container = root && root.scrollHeight > root.clientHeight ? root : window;
    if (container === window) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 80;
      container.scrollTo({ top, behavior: 'smooth' });
    }
  };
}

// ─── ナビ ───
function A2Nav({ lang, onLangChange, t, onLogoClick }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);

  // 言語ドロップダウン：外側クリックで閉じる
  React.useEffect(() => {
    if (!langOpen) return;
    const onDocClick = () => setLangOpen(false);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [langOpen]);

  React.useEffect(() => {
    const root = document.querySelector('[data-screen-label="A v2 · 白×アニメ"]')?.parentElement;
    const onScroll = () => setScrolled((root?.scrollTop ?? window.scrollY) > 40);
    const target = root || window;
    target.addEventListener('scroll', onScroll);
    return () => target.removeEventListener('scroll', onScroll);
  }, []);

  // メニューを閉じてスクロール
  const handleMobileNav = (id) => (e) => {
    setMobileOpen(false);
    scrollToSection(id)(e);
  };

  const langs = [
    { code: 'ja', label: '日本語' }, { code: 'en', label: 'English' },
    { code: 'zh', label: '繁體中文' }, { code: 'ko', label: '한국어' },
  ];
  const currentLang = langs.find(l => l.code === lang) || langs[0];

  const navStyle = {
    position: 'sticky', top: 0, zIndex: 50,
    background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(14px)',
    borderBottom: scrolled ? `1px solid ${a2.border}` : `1px solid transparent`,
    padding: '14px 36px',
    display: 'flex', alignItems: 'center', gap: 24,
    transition: 'all .3s',
  };

  return (
    <>
      <nav style={navStyle}>
        {/* ロゴ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="assets/bni-logo.png" style={{ height: 24, display: 'block', transition: 'transform .3s', cursor: 'pointer' }} alt="BNI"
               onClick={onLogoClick}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
          <div style={{ width: 1, height: 22, background: a2.fg, opacity: 0.15 }} />
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: a2.ai, lineHeight: 1.3, fontFamily: 'system-ui, sans-serif' }}>
            BUSINESS<br/>FUSION 沖縄
          </div>
        </div>
        <div style={{ flex: 1 }} />

        {/* デスクトップ ナビリンク */}
        <div className="a2-nav-links" style={{ display: 'flex', gap: 22, fontSize: 13, fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>
          <a href="#about"    onClick={scrollToSection('about')}    className="a2-link-underline" style={{ cursor: 'pointer', color: a2.fg, textDecoration: 'none' }}>{t.nav.about}</a>
          <a href="#greeting" onClick={scrollToSection('greeting')} className="a2-link-underline" style={{ cursor: 'pointer', color: a2.fg, textDecoration: 'none' }}>{t.nav.greeting}</a>
          <a href="#schedule" onClick={scrollToSection('schedule')} className="a2-link-underline" style={{ cursor: 'pointer', color: a2.fg, textDecoration: 'none' }}>{t.nav.schedule}</a>
          <a href="#venue"    onClick={scrollToSection('venue')}    className="a2-link-underline" style={{ cursor: 'pointer', color: a2.fg, textDecoration: 'none' }}>{t.nav.venue}</a>
          <a href="#access"   onClick={scrollToSection('access')}   className="a2-link-underline" style={{ cursor: 'pointer', color: a2.fg, textDecoration: 'none' }}>{t.nav.access}</a>
          <a href="#contact"  onClick={scrollToSection('contact')}  className="a2-link-underline" style={{ cursor: 'pointer', color: a2.fg, textDecoration: 'none' }}>{t.nav.contact || 'お問い合わせ'}</a>
          <a href="https://sites.google.com/view/faqbusinessfusionokinawa2026/bfoqa?authuser=0"
             target="_blank" rel="noopener noreferrer"
             className="a2-link-underline"
             style={{ cursor: 'pointer', color: a2.shu, textDecoration: 'none', fontWeight: 700 }}>
            {t.nav.exhibitorQa || '出展者向けQ&A'} ↗
          </a>
        </div>

        {/* 言語切替（グローブ型ドロップダウン・LINE/申込ボタンと高さ統一） */}
        <div className="a2-nav-lang" style={{ position: 'relative', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setLangOpen(o => !o)}
            aria-haspopup="listbox" aria-expanded={langOpen} aria-label="言語選択 / Language"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              height: 40, padding: '0 14px', boxSizing: 'border-box',
              background: a2.bg, color: a2.fg,
              border: `1.5px solid ${a2.fg}`, boxShadow: `4px 4px 0 ${a2.fg}`,
              cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em',
              fontFamily: 'system-ui, sans-serif', transition: 'transform .2s, box-shadow .2s',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = `6px 6px 0 ${a2.fg}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0 ${a2.fg}`; }}>
            <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>🌐</span>
            <span className="a2-nav-lang-label" style={{ whiteSpace: 'nowrap' }}>{currentLang.label}</span>
            <span aria-hidden="true" style={{
              fontSize: 9, lineHeight: 1, flexShrink: 0,
              transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s',
            }}>▼</span>
          </button>
          {langOpen && (
            <div role="listbox" style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 60,
              background: a2.bg, border: `1.5px solid ${a2.fg}`, boxShadow: `5px 5px 0 ${a2.fg}`,
              minWidth: 150, display: 'flex', flexDirection: 'column',
            }}>
              {langs.map(l => (
                <button key={l.code} role="option" aria-selected={lang === l.code}
                  onClick={() => { onLangChange(l.code); setLangOpen(false); }}
                  style={{
                    padding: '12px 16px', textAlign: 'left',
                    background: lang === l.code ? a2.fg : 'transparent',
                    color: lang === l.code ? a2.bg : a2.fg,
                    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.03em', fontFamily: 'system-ui, sans-serif',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={(e) => { if (lang !== l.code) e.currentTarget.style.background = a2.bgSoft; }}
                  onMouseLeave={(e) => { if (lang !== l.code) e.currentTarget.style.background = 'transparent'; }}>
                  {lang === l.code ? `✓ ${l.label}` : l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LINE ボタン（申込ボタンと高さ・装飾を統一） */}
        <a href="https://line.me/R/ti/p/@744geuzz" target="_blank" rel="noopener noreferrer"
           className="a2-nav-line-btn"
           title="BFO公式LINEで問い合わせ"
           style={{
             display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
             height: 40, padding: '0 16px', boxSizing: 'border-box',
             background: '#06C755', color: '#ffffff',
             textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
             border: `1.5px solid ${a2.fg}`, boxShadow: `4px 4px 0 ${a2.fg}`,
             transition: 'transform .2s, box-shadow .2s', fontFamily: 'system-ui, sans-serif',
           }}
           onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = `6px 6px 0 ${a2.fg}`; }}
           onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0 ${a2.fg}`; }}>
          <img src="assets/BFOOFLINE.png" alt="LINE" style={{ height: 18, display: 'block' }} />
          <span>LINE</span>
        </a>

        {/* 申込ボタン（LINE ボタンと高さ・装飾を統一） */}
        <a href="register.html" className="a2-btn-shu" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          height: 40, padding: '0 20px', boxSizing: 'border-box',
          background: a2.shu, color: a2.bg, border: `1.5px solid ${a2.fg}`,
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.04em', boxShadow: `4px 4px 0 ${a2.fg}`,
          fontFamily: 'system-ui, sans-serif', textDecoration: 'none',
        }}>{t.nav.tickets} →</a>

        {/* ハンバーガーボタン（モバイルのみ） */}
        <button className="a2-nav-hamburger" onClick={() => setMobileOpen(o => !o)}
          aria-label="メニュー" aria-expanded={mobileOpen}
          style={{
            flexDirection: 'column', justifyContent: 'center', gap: 5,
            width: 38, height: 38, background: 'transparent',
            border: `1.5px solid ${a2.fg}`, cursor: 'pointer', padding: '7px 8px',
          }}>
          <span style={{ display: 'block', width: '100%', height: 2, background: a2.fg, transition: 'all .25s', transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ display: 'block', width: '100%', height: 2, background: a2.fg, transition: 'all .25s', opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: '100%', height: 2, background: a2.fg, transition: 'all .25s', transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      </nav>

      {/* モバイルメニューパネル */}
      <div className={`a2-mobile-menu${mobileOpen ? ' open' : ''}`}
        style={{
          flexDirection: 'column', gap: 0,
          position: 'fixed', top: 57, left: 0, right: 0, zIndex: 49,
          background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(14px)',
          borderBottom: `2px solid ${a2.fg}`,
          padding: '8px 24px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,.14)',
          maxHeight: 'calc(100vh - 57px)', overflowY: 'auto',
        }}>
        {[
          { label: t.nav.about,                  id: 'about' },
          { label: t.nav.greeting,               id: 'greeting' },
          { label: t.nav.schedule,               id: 'schedule' },
          { label: t.nav.venue,                  id: 'venue' },
          { label: t.nav.access,                 id: 'access' },
          { label: t.nav.contact || 'お問い合わせ', id: 'contact' },
        ].map((item, i, arr) => (
          <a key={item.id} href={`#${item.id}`} onClick={handleMobileNav(item.id)}
            style={{
              display: 'block', padding: '15px 0',
              borderBottom: `1px solid ${a2.border}`,
              fontSize: 15, fontWeight: 600, color: a2.fg,
              textDecoration: 'none', fontFamily: 'system-ui, sans-serif',
            }}>
            {item.label}
          </a>
        ))}
        <a href="https://sites.google.com/view/faqbusinessfusionokinawa2026/bfoqa?authuser=0"
           target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}
           style={{
             display: 'block', padding: '15px 0', borderBottom: `1px solid ${a2.border}`,
             fontSize: 15, fontWeight: 700, color: a2.shu, textDecoration: 'none', fontFamily: 'system-ui, sans-serif',
           }}>{t.nav.exhibitorQa || '出展者向けQ&A'} ↗</a>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <a href="https://line.me/R/ti/p/@744geuzz" target="_blank" rel="noopener noreferrer"
             onClick={() => setMobileOpen(false)}
             style={{
               flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
               padding: '13px 12px', background: '#06C755', color: '#fff',
               textDecoration: 'none', fontWeight: 700, fontSize: 14,
               border: `1.5px solid ${a2.fg}`, fontFamily: 'system-ui, sans-serif',
             }}>
            <img src="assets/BFOOFLINE.png" alt="LINE" style={{ height: 20 }} />
            LINE
          </a>
          <a href="register.html" className="a2-btn-shu"
             style={{
               flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
               padding: '13px 12px', background: a2.shu, color: a2.bg,
               textDecoration: 'none', fontWeight: 700, fontSize: 14, border: 'none',
               boxShadow: `4px 4px 0 ${a2.fg}`, fontFamily: 'system-ui, sans-serif',
             }}>
            {t.nav.tickets} →
          </a>
        </div>
      </div>
    </>
  );
}

// ─── ヒーロー ───
function A2Hero({ t, cd }) {

  const confetti = React.useMemo(() => {
    const colors = [a2.shu, a2.ki, a2.ai, a2.midori, a2.momo];
    const types = ['hibiscus', 'palm', 'sun', 'bubble', 'star', 'hibiscus', 'hibiscus'];
    return Array.from({ length: 18 }).map((_, i) => ({
      left: `${(i * 5.7 + 3) % 96}%`,
      delay: `${(i * 0.55) % 8}s`,
      dur: `${6 + (i % 6)}s`,
      color: colors[i % colors.length],
      size: 18 + (i % 4) * 6,
      type: types[i % types.length],
    }));
  }, []);
  const renderConfetti = (c) => {
    if (c.type === 'palm') return <PalmLeaf color={a2.midori} size={c.size} />;
    if (c.type === 'sun') return <Sun color={a2.ki} size={c.size} />;
    if (c.type === 'bubble') return <Bubble color={a2.ai} size={c.size} />;
    if (c.type === 'star') return <StarSand color={a2.ki} size={c.size * 0.7} />;
    return <Hibiscus color={c.color} size={c.size} />;
  };
  return (
    <section style={{ position: 'relative', padding: '90px 36px 110px', background: a2.bg, overflow: 'hidden' }}>
      {confetti.map((c, i) => (
        <div key={i} className="a2-confetti-piece" style={{
          left: c.left, animationDelay: c.delay, animationDuration: c.dur,
          width: c.size, height: c.size, opacity: 0.6,
        }}>{renderConfetti(c)}</div>
      ))}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', opacity: 0.08, animation: 'a2-wave 30s linear infinite' }} preserveAspectRatio="none" viewBox="0 0 2400 800">
        <path d="M0 400 Q300 350 600 400 T1200 400 T1800 400 T2400 400" fill="none" stroke={a2.shu} strokeWidth="1.5" />
        <path d="M0 500 Q300 450 600 500 T1200 500 T1800 500 T2400 500" fill="none" stroke={a2.ai} strokeWidth="1.5" />
        <path d="M0 600 Q300 550 600 600 T1200 600 T1800 600 T2400 600" fill="none" stroke={a2.midori} strokeWidth="1.5" />
      </svg>
      {/* モバイルでは非表示にする右側の装飾群 */}
      <div className="a2-hero-decos" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 200, right: 200, width: 60, height: 60 }}>
          <div className="a2-radar-ring" style={{ inset: 0 }} />
          <div className="a2-radar-ring" style={{ inset: 0, animationDelay: '.8s' }} />
          <div className="a2-radar-ring" style={{ inset: 0, animationDelay: '1.6s' }} />
        </div>
        <div className="a2-float a2-glow" style={{ position: 'absolute', top: 70, right: 80 }}>
          <Hibiscus color={a2.shu} size={130} />
        </div>
        <div className="a2-float-2" style={{ position: 'absolute', top: 240, right: 240 }}>
          <Hibiscus color={a2.ki} size={70} />
        </div>
        <div className="a2-float" style={{ position: 'absolute', bottom: 80, right: 380, animationDelay: '-2s' }}>
          <Hibiscus color={a2.momo} size={50} />
        </div>
        <div className="a2-float-2 a2-jitter" style={{ position: 'absolute', bottom: 60, left: 60 }}>
          <SisaSilhouette color={a2.ai} size={120} />
        </div>
      </div>
      <svg className="a2-rotate-slow a2-hero-decos" style={{ position: 'absolute', top: 50, right: 30, width: 320, height: 320, opacity: 0.4 }} viewBox="0 0 320 320">
        <circle cx="160" cy="160" r="155" fill="none" stroke={a2.fg} strokeWidth="0.5" strokeDasharray="2 6" />
        <text fontSize="11" fill={a2.fg} fontFamily="monospace" letterSpacing="3" opacity="0.7">
          <textPath href="#a2-ring-path" startOffset="0">
            BUSINESS · FUSION · OKINAWA · 2026 · BUSINESS · FUSION · OKINAWA · 2026 ·
          </textPath>
        </text>
        <defs>
          <path id="a2-ring-path" d="M 160 160 m -140 0 a 140 140 0 1 1 280 0 a 140 140 0 1 1 -280 0" />
        </defs>
      </svg>
      <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', zIndex: 2 }}>
        <div className="a2-reveal" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: a2.fg, color: a2.bg,
          padding: '7px 16px', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.2em', marginBottom: 36,
          fontFamily: 'system-ui, sans-serif',
        }}>
          <span className="a2-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: a2.shu, color: a2.shu, display: 'inline-block' }} />
          {t.hero.tag} · 7.7 TUE
        </div>
        <h1 className="a2-reveal a2-hero-h1" style={{
          fontSize: 96, lineHeight: 1.0, margin: '0 0 32px',
          fontWeight: 900, color: a2.fg,
          whiteSpace: 'pre-line', letterSpacing: '-0.025em',
          animationDelay: '.1s',
        }}>
          {t.hero.title.split('\n').map((line, i) => (
            <div key={i} style={{ overflow: 'hidden', paddingBottom: 4 }}>
              <span className="a2-letter-mask" style={{ display: 'inline-block' }}>
                <span style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                  {i === 1 ? <span className="a2-shimmer-text">{line}</span> : line}
                </span>
              </span>
            </div>
          ))}
        </h1>
        <p className="a2-reveal a2-hero-sub" style={{
          fontSize: 19, lineHeight: 1.8, color: a2.fgSoft,
          margin: '0 0 48px', whiteSpace: 'pre-line', maxWidth: 540,
          animationDelay: '.2s',
        }}>{t.hero.subtitle}</p>
        <div className="a2-reveal" style={{ marginBottom: 36, animationDelay: '.3s' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', marginBottom: 16, color: a2.shu, fontFamily: 'system-ui, sans-serif' }}>
            ◆ {t.hero.countdownLabel}
          </div>
          <CountdownA2 cd={cd} t={t} />
        </div>
        {/* CTA：ボタン（主役）＋ 価格はその下のクリーンな補足テキスト（競合させない） */}
        <div className="a2-reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, animationDelay: '.4s' }}>
          {/* CTA ボタン本体（パルスグロー付） */}
          <a href="register.html" className="a2-btn-shu a2-cta-glow" style={{
            background: a2.shu, color: a2.bg, border: 'none',
            padding: '16px 36px', cursor: 'pointer',
            boxShadow: `6px 6px 0 ${a2.fg}`,
            fontFamily: 'system-ui, sans-serif', textDecoration: 'none',
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            position: 'relative', zIndex: 1,
          }}>
            <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: '0.05em' }}>{t.hero.cta} →</span>
            {t.hero.ctaLimit && (
              <span style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
                padding: '2px 10px', background: a2.ki, color: a2.fg,
                border: `1px solid ${a2.fg}`,
              }}>※ {t.hero.ctaLimit}</span>
            )}
          </a>

          {/* 価格情報：枠なしのクリーンな1行（ボタンと張り合わない補足表記） */}
          <PriceLineA2 sub={t.hero.ctaSub} subFree={t.hero.ctaSubFree} />
        </div>
      </div>
    </section>
  );
}

// 価格表記の共通コンポーネント（ヒーロー・下部CTAで同一表示）
// 枠・影なしのクリーンな1行。通常価格に取消線、無料を赤で強調。
function PriceLineA2({ sub, subFree, center }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 9, flexWrap: 'wrap',
      justifyContent: center ? 'center' : 'flex-start',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: a2.shu, flexShrink: 0,
        animation: 'a2-blink 1s steps(2) infinite',
      }} />
      <span style={{
        fontSize: 13, color: a2.fgSoft, fontWeight: 600,
        textDecoration: 'line-through', textDecorationThickness: '1.5px', opacity: 0.7,
      }}>{sub}</span>
      {subFree && (
        <span style={{
          fontSize: 16, color: a2.shu, fontWeight: 900, letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}>→ {subFree}</span>
      )}
    </div>
  );
}

function CountdownA2({ cd, t }) {
  const items = [
    { v: cd.days, l: t.hero.days }, { v: cd.hours, l: t.hero.hours },
    { v: cd.minutes, l: t.hero.minutes }, { v: cd.seconds, l: t.hero.seconds },
  ];
  return (
    <div className="a2-countdown" style={{ display: 'inline-flex', gap: 0, background: a2.fg, color: a2.bg, padding: '22px 26px', boxShadow: `8px 8px 0 ${a2.shu}` }}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <FlipDigit value={it.v} digits={i === 0 ? 3 : 2} label={it.l} highlight={i === 0} />
          {i < 3 && <div className="a2-countdown-sep" style={{ fontSize: 36, fontWeight: 200, color: a2.shu, alignSelf: 'flex-start', margin: '0 14px', animation: 'a2-blink 1s steps(2) infinite' }}>:</div>}
        </React.Fragment>
      ))}
    </div>
  );
}

function FlipDigit({ value, digits, label, highlight }) {
  const [tick, setTick] = React.useState(false);
  const prev = React.useRef(value);
  React.useEffect(() => {
    if (prev.current !== value) {
      setTick(true);
      const id = setTimeout(() => setTick(false), 300);
      prev.current = value;
      return () => clearTimeout(id);
    }
  }, [value]);
  return (
    <div className="a2-flip-item" style={{ textAlign: 'center', minWidth: 76, fontFamily: '"JetBrains Mono", monospace' }}>
      <div className={`a2-flip-num${tick ? ' a2-tick' : ''}`} style={{
        fontSize: 48, fontWeight: 800, lineHeight: 1,
        color: highlight ? a2.ki : a2.bg,
        transformOrigin: 'center bottom',
      }}>{pad(value, digits)}</div>
      <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.18em', marginTop: 7, textTransform: 'uppercase', fontFamily: 'system-ui, sans-serif' }}>
        {label}
      </div>
    </div>
  );
}

function A2Marquee({ content }) {
  const fallback = ['JULY 7 2026', 'OKINAWA × ASIA', 'BNI', '70 EXHIBITORS', 'BUSINESS FUSION', 'LAGUNA GARDEN'];
  const items = (content && content.marquee && content.marquee.length > 0) ? content.marquee : fallback;
  return (
    <div style={{
      background: a2.fg, color: a2.bg, padding: '16px 0', overflow: 'hidden',
      borderTop: `1px solid ${a2.fg}`, borderBottom: `1px solid ${a2.fg}`,
    }}>
      <div className="a2-marquee-track">
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.2em', fontFamily: 'system-ui, sans-serif' }}>
            {it} <span style={{ color: a2.shu, marginLeft: 50 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── イベント概要 ───
function A2Event({ t }) {
  return (
    <section id="about" style={{ padding: '120px 36px', background: a2.bg, scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionTitleA2 en="ABOUT" ja={t.event.title} accent={a2.shu} />
        <div className="a2-event-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60, marginTop: 60 }}>
          <div className="a2-reveal-r">
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', color: a2.shu, marginBottom: 14, fontFamily: 'system-ui, sans-serif' }}>
              ◆ {t.event.conceptLabel}
            </div>
            <p style={{ fontSize: 24, lineHeight: 1.85, fontWeight: 600, color: a2.fg, margin: 0 }}>{t.event.concept}</p>
          </div>
          <div className="a2-reveal-l" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <InfoRowA2 label="DATE" value={t.event.date} accent={a2.shu} />
            <InfoRowA2 label="TIME" value={t.event.time} accent={a2.ai} />
            <InfoRowA2 label="VENUE" value={t.event.venue} accent={a2.midori} />
            <InfoRowA2 label="ADDRESS" value={t.event.address} accent={a2.ki} small />
            {t.event.organizers && (
              <InfoRowA2 label={t.event.organizersLabel || 'CO-HOST'} value={t.event.organizers} accent={a2.momo} small />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRowA2({ label, value, accent, small }) {
  return (
    <div style={{
      display: 'flex', borderBottom: `1px dashed ${a2.border}`, padding: '20px 0',
      transition: 'transform .25s, padding-left .25s', cursor: 'default',
    }}
    onMouseEnter={(e) => e.currentTarget.style.paddingLeft = '8px'}
    onMouseLeave={(e) => e.currentTarget.style.paddingLeft = '0'}>
      <div style={{ width: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: accent, paddingTop: 5, fontFamily: 'system-ui, sans-serif' }}>
        ◆ {label}
      </div>
      <div style={{ flex: 1, fontSize: small ? 14 : 18, fontWeight: 600, color: a2.fg }}>{value}</div>
    </div>
  );
}

function SectionTitleA2({ en, ja, accent, dark }) {
  return (
    <div className="a2-reveal">
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.35em', color: accent, fontFamily: 'system-ui, sans-serif', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 32, height: 1, background: accent }} />
        {en}
        <span style={{ width: 32, height: 1, background: accent }} />
      </div>
      <h2 className="a2-section-h2" style={{ fontSize: 60, margin: 0, fontWeight: 900, color: dark ? a2.bg : a2.fg, letterSpacing: '-0.015em' }}>
        {ja}
      </h2>
    </div>
  );
}

// 時刻文字列を HH:MM に正規化
// Apps Script 側で Date を返してしまった場合の保険
function normalizeTime(s) {
  if (!s) return '';
  const m = String(s).match(/(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
  return String(s);
}

// ─── タイムテーブル ───
function A2Schedule({ t, content }) {
  // スプレッドシートに公開行があればそれを使う、なければ translations.jsx のフォールバック
  const rawItems = (content && content.schedule && content.schedule.length > 0)
    ? content.schedule
    : (t.schedule.items || []);
  const items = rawItems.map(it => ({ ...it, time: normalizeTime(it.time) }));

  // コンテンツがスプレッドシートから動的に追加されるため、
  // グローバルの useReveal では新規アイテムが IO に登録されない。
  // items.length が変わるたびにローカル IO を再作成してアニメーションを確実に発火させる。
  const sectionRef = React.useRef(null);
  React.useEffect(() => {
    if (!sectionRef.current || !items.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('a2-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    const els = sectionRef.current.querySelectorAll('.a2-reveal');
    els.forEach(el => {
      if (el.classList.contains('a2-in')) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add('a2-in');
      } else {
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, [items.length]);

  return (
    <section ref={sectionRef} id="schedule" style={{ padding: '120px 36px', background: a2.bgSoft, position: 'relative', overflow: 'clip', scrollMarginTop: 80 }}>
      <div className="a2-rotate-slow" style={{ position: 'absolute', top: -100, right: -100, opacity: 0.5 }}>
        <Hibiscus color={a2.shu} size={300} />
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <SectionTitleA2 en="SCHEDULE" ja={t.schedule.title} accent={a2.ai} />
        <div className="a2-reveal" style={{
          marginTop: 18, display: 'inline-block',
          fontSize: 15, fontWeight: 800, letterSpacing: '0.18em',
          color: a2.bg, background: a2.shu,
          padding: '6px 18px',
          fontFamily: '"JetBrains Mono", monospace',
          boxShadow: `3px 3px 0 ${a2.fg}`,
        }}>
          ◆ {t.schedule.dateLabel}
        </div>
        <div style={{ marginTop: 48, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 134, top: 30, bottom: 30, width: 2, background: `linear-gradient(180deg, transparent 0%, ${a2.shu} 10%, ${a2.shu} 90%, transparent 100%)` }} />
          {items.map((item, i) => (
            <div key={i} className="a2-reveal a2-schedule-row" style={{
              display: 'grid', gridTemplateColumns: 'minmax(110px, 130px) 30px 1fr',
              alignItems: 'center', gap: 20, padding: '22px 0',
              animationDelay: `${i * 0.08}s`,
            }}>
              <div style={{
                fontSize: 30, fontWeight: 800, color: a2.fg,
                fontFamily: '"JetBrains Mono", monospace',
                textAlign: 'right',
                whiteSpace: 'nowrap',          // 改行禁止
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                fontVariantNumeric: 'tabular-nums',  // 数字幅を統一
              }}>
                {item.time}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: i % 3 === 0 ? a2.shu : i % 3 === 1 ? a2.ki : a2.midori,
                  boxShadow: `0 0 0 4px ${a2.bgSoft}, 0 0 0 5px ${a2.fg}`,
                  zIndex: 2,
                }} />
              </div>
              <div className="a2-card-hover" style={{
                background: a2.bg, padding: '18px 22px',
                border: `1px solid ${a2.border}`, boxShadow: `4px 4px 0 ${a2.fg}`,
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: a2.fg }}>{item.title}</div>
                <div style={{ fontSize: 13, color: a2.fgSoft, fontFamily: 'system-ui, sans-serif' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 動画 ───
function A2Video({ t, content }) {
  // デフォルトは元の埋込みURL（si パラメータ付き）。
  // SiteSettings の video_url で上書き可能。
  const DEFAULT_VIDEO_URL = `https://www.youtube.com/embed/${YT_ID}?si=u1nLjObF5zNNfsIU`;
  const videoUrl = (content && content.settings && content.settings.video_url)
    ? content.settings.video_url
    : DEFAULT_VIDEO_URL;
  return (
    <section style={{ padding: '120px 36px', background: a2.bgSoft, position: 'relative', overflow: 'hidden' }}>
      <div className="a2-float" style={{ position: 'absolute', top: 60, left: 60, opacity: 0.6 }}>
        <Hibiscus color={a2.ki} size={80} />
      </div>
      <div className="a2-float-2" style={{ position: 'absolute', bottom: 80, right: 80, opacity: 0.6 }}>
        <Hibiscus color={a2.shu} size={100} />
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <SectionTitleA2 en="MOVIE" ja={t.video.title} accent={a2.shu} />
        <p className="a2-reveal" style={{ fontSize: 16, color: a2.fgSoft, marginTop: 16, marginBottom: 40, fontFamily: 'system-ui, sans-serif' }}>{t.video.subtitle}</p>
        <div className="a2-reveal-scale" style={{
          aspectRatio: '16/9', background: a2.fg,
          boxShadow: `12px 12px 0 ${a2.shu}`,
          position: 'relative', overflow: 'hidden',
          border: `1px solid ${a2.fg}`,
        }}>
          <iframe src={videoUrl} title="YouTube video player"
            style={{ width: '100%', height: '100%', border: 0 }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen />
        </div>
      </div>
    </section>
  );
}

// ─── 出展企業（動的） ───
function A2Exhibitors({ t, content }) {
  const items = content.exhibitors || [];
  const hasError = content._state === 'error';
  const isLoading = content._state === 'loading' || content._state === 'unconfigured';

  // 総ブース数 = 出展行数（1行=1ブース枠）
  const count = items.length;

  const [activeCategory, setActiveCategory] = React.useState('ALL');
  const [openIdx, setOpenIdx] = React.useState(null);

  const categories = React.useMemo(() => {
    const set = new Set();
    items.forEach(e => { if (e.category) set.add(e.category); });
    return ['ALL', ...Array.from(set)];
  }, [items]);

  const filtered = React.useMemo(() => {
    if (activeCategory === 'ALL') return items;
    return items.filter(e => e.category === activeCategory);
  }, [items, activeCategory]);

  const categoryColors = [a2.shu, a2.ai, a2.midori, a2.ki, a2.momo];
  const colorOf = (cat) => {
    if (!cat) return a2.fgSoft;
    const idx = categories.indexOf(cat);
    return categoryColors[(idx - 1 + categoryColors.length) % categoryColors.length];
  };

  // 企業数 = 主企業 + 共同出展企業
  // 共同企業カウントから除外するもの:
  //   ・空白 / プレースホルダ（無、なし、未定 等）
  //   ・1セルに複数社名が連結されたエントリ（/ と 、両方含む場合）
  const PLACEHOLDER_RE = /^(無|なし|無し|未定|未確認|-|—|N\/A|NA|TBD)$/i;
  const companyCount = React.useMemo(() => {
    let total = items.length;
    items.forEach(e => {
      if (!Array.isArray(e.co_exhibitors)) return;
      e.co_exhibitors.forEach(c => {
        const n = (c && c.name || '').trim();
        if (!n) return;
        if (PLACEHOLDER_RE.test(n)) return;
        // 複数社連結セルは除外（編集側で分割が必要）
        const hasSlash = /[\/／]/.test(n);
        const hasComma = /[、,]/.test(n);
        if (hasSlash && hasComma) return;
        total += 1;
      });
    });
    return total;
  }, [items]);

  return (
    <section id="exhibitors" style={{ padding: '24px 36px 100px', background: a2.bg, scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="a2-reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 8 }}>
          <SectionTitleA2 en="EXHIBITORS" ja={t.exhibitors.title} accent={a2.midori} />
          <div style={{ textAlign: 'right', lineHeight: 1, minHeight: 110 }}>
            {/* メイン: 企業数（強調表示） */}
            <div className="a2-shimmer-text a2-exhibitors-count" style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, fontFamily: '"JetBrains Mono", monospace' }}>
              {isLoading ? <span style={{ opacity: 0.25, letterSpacing: '0.05em' }}>—</span> : (companyCount > 0 ? companyCount : '—')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', color: a2.midori, fontFamily: 'system-ui, sans-serif', marginTop: 4 }}>
              企業出展
            </div>
            {/* サブ: ブース数（ロード中は非表示） */}
            {!isLoading && count > 0 && (
              <div style={{
                marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                color: a2.fgSoft, fontFamily: 'system-ui, sans-serif',
              }}>
                <span style={{ color: a2.fg, fontWeight: 800 }}>{count}</span> {t.exhibitors.countLabel}
              </div>
            )}
          </div>
        </div>
        {hasError ? (
          <div style={{
            marginTop: 16, padding: '20px 24px',
            background: '#fef2f2', border: `1.5px solid ${a2.shu}`,
            color: a2.shu, fontWeight: 700, fontSize: 13,
            textAlign: 'center', fontFamily: 'system-ui, sans-serif',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <div>⚠ 出展企業情報を取得できませんでした</div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 20px', fontSize: 12, fontWeight: 800,
                background: a2.shu, color: '#fff', border: 'none',
                cursor: 'pointer', letterSpacing: '0.08em',
                fontFamily: 'system-ui, sans-serif',
              }}
            >再読み込み</button>
          </div>
        ) : (
          <>
            {categories.length > 1 && (
              <div
                className="a2-reveal a2-exhibitors-cats"
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  paddingBottom: 4,
                }}
              >
                {categories.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setOpenIdx(null); }}
                      style={{
                        padding: '10px 18px',
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        background: isActive ? a2.fg : a2.bg,
                        color: isActive ? a2.bg : a2.fg,
                        border: `1.5px solid ${a2.fg}`,
                        cursor: 'pointer',
                        transition: 'all .2s',
                        fontFamily: 'system-ui, sans-serif',
                      }}
                      onMouseEnter={(ev) => { if (!isActive) { ev.currentTarget.style.background = a2.bgSoft; } }}
                      onMouseLeave={(ev) => { if (!isActive) { ev.currentTarget.style.background = a2.bg; } }}
                    >
                      {cat === 'ALL' ? `すべて (${items.length})` : `${cat} (${items.filter(e => e.category === cat).length})`}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="a2-reveal a2-exhibitors-grid" style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {isLoading ? (
                // ロード中: スケルトン6枚
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="a2-skel" style={{
                    height: 92, opacity: 0.35,
                    borderLeft: `4px solid ${a2.fgSoft}`, border: `1px solid ${a2.border}`,
                  }} />
                ))
              ) : filtered.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: a2.fgSoft, fontFamily: 'system-ui, sans-serif' }}>
                  該当する企業はありません
                </div>
              ) : filtered.map((e, i) => {
                const accent = colorOf(e.category);
                const coEx = Array.isArray(e.co_exhibitors) ? e.co_exhibitors : [];
                // 屋号が入力されていれば新デザイン（展開型）、なければ従来表示（リンク型）
                const hasBoothName = !!(e.booth_name && e.booth_name.trim());
                const isOpen = openIdx === i;
                if (hasBoothName) {
                  return (
                    <ExhibitorExpandable
                      key={i} e={e} coEx={coEx} accent={accent}
                      isOpen={isOpen}
                      onToggle={() => setOpenIdx(isOpen ? null : i)}
                    />
                  );
                }
                return <ExhibitorLegacy key={i} e={e} accent={accent} />;
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// 屋号メイン表示・クリックで企業情報展開（共同出展対応）
function ExhibitorExpandable({ e, coEx, accent, isOpen, onToggle }) {
  const totalCompanies = 1 + coEx.length;
  const isMulti = totalCompanies >= 2;
  return (
    <div
      style={{
        background: a2.bg,
        borderLeft: `4px solid ${accent}`,
        border: `1px solid ${a2.border}`,
        borderLeftWidth: 4,
        padding: '16px 20px',
        color: a2.fg,
        cursor: 'pointer',
        transition: 'transform .25s, box-shadow .25s, border-left-width .25s',
        fontFamily: 'system-ui, sans-serif',
      }}
      onClick={onToggle}
      role="button"
      aria-expanded={isOpen}
      tabIndex={0}
      onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onToggle(); } }}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.transform = 'translate(-3px, -3px)';
        ev.currentTarget.style.boxShadow = `5px 5px 0 ${a2.fg}`;
        ev.currentTarget.style.borderLeftWidth = '8px';
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.transform = 'translate(0, 0)';
        ev.currentTarget.style.boxShadow = 'none';
        ev.currentTarget.style.borderLeftWidth = '4px';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {e.booth_no && <BoothBadge boothNo={e.booth_no} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 17, fontWeight: 800, color: a2.fg, lineHeight: 1.25,
              fontFamily: '"Noto Serif JP", serif', letterSpacing: '-0.01em',
            }}>{e.booth_name}</span>
            {isMulti && (
              <span style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                padding: '2px 8px', background: a2.midori, color: '#fff',
                fontFamily: 'system-ui, sans-serif',
              }}>{totalCompanies}社共同</span>
            )}
          </div>
          {e.catch_copy && (
            <div style={{
              fontSize: 11, color: a2.fgSoft, marginTop: 4, fontStyle: 'italic',
              lineHeight: 1.45, overflow: 'hidden',
            }}>{e.catch_copy}</div>
          )}
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            color: a2.fgSoft, marginTop: 8,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 11 }}>{isOpen ? '▲' : '▼'}</span>
            {isOpen ? '閉じる' : (isMulti ? `クリックで出店企業${totalCompanies}社を表示` : 'クリックで運営企業を表示')}
          </div>
        </div>
      </div>
      {isOpen && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: `1px dashed ${a2.border}`,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
            color: a2.fgSoft, marginBottom: 8,
          }}>{isMulti ? `出店企業（${totalCompanies}社）` : '出店企業'}</div>
          <ExhibitorCompanyRow e={{ name: e.name, category: e.category, url: e.url }} accent={accent} primary />
          {coEx.map((c, j) => (
            <ExhibitorCompanyRow key={j} e={c} accent={accent} />
          ))}
        </div>
      )}
    </div>
  );
}

// 展開時に表示する企業の1行
function ExhibitorCompanyRow({ e, accent, primary }) {
  const hasUrl = !!(e.url && e.url.trim());
  const Tag = hasUrl ? 'a' : 'div';
  const tagProps = hasUrl ? { href: e.url, target: '_blank', rel: 'noopener noreferrer', onClick: (ev) => ev.stopPropagation() } : {};
  return (
    <Tag
      {...tagProps}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', textDecoration: 'none', color: a2.fg,
        borderBottom: `0.5px solid ${a2.border}`,
        cursor: hasUrl ? 'pointer' : 'default',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: a2.fg, lineHeight: 1.3 }}>
          {e.name}
        </div>
        {e.category && (
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: accent, marginTop: 2 }}>
            ◆ {e.category}
          </div>
        )}
      </div>
      {hasUrl ? (
        <span style={{ fontSize: 14, color: accent, fontWeight: 800, flexShrink: 0, marginLeft: 8 }}>↗</span>
      ) : (
        <span style={{ fontSize: 10, color: a2.fgSoft, letterSpacing: '0.1em', flexShrink: 0, marginLeft: 8 }}>URL 未公開</span>
      )}
    </Tag>
  );
}

// 屋号が未入力時の従来表示（現状互換）
function ExhibitorLegacy({ e, accent }) {
  const Tag = e.url ? 'a' : 'div';
  const tagProps = e.url ? { href: e.url, target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <Tag
      {...tagProps}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: a2.bg,
        borderLeft: `4px solid ${accent}`,
        border: `1px solid ${a2.border}`,
        borderLeftWidth: 4,
        padding: '16px 20px',
        textDecoration: 'none',
        color: a2.fg,
        cursor: e.url ? 'pointer' : 'default',
        transition: 'transform .25s, box-shadow .25s, border-left-width .25s',
        fontFamily: 'system-ui, sans-serif',
        minHeight: 64,
      }}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.transform = 'translate(-3px, -3px)';
        ev.currentTarget.style.boxShadow = `5px 5px 0 ${a2.fg}`;
        ev.currentTarget.style.borderLeftWidth = '8px';
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.transform = 'translate(0, 0)';
        ev.currentTarget.style.boxShadow = 'none';
        ev.currentTarget.style.borderLeftWidth = '4px';
      }}
    >
      {e.booth_no && <BoothBadge boothNo={e.booth_no} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: a2.fg, lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {e.name}
        </div>
        {e.category && (
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: accent, textTransform: 'uppercase' }}>
            ◆ {e.category}
          </div>
        )}
      </div>
      {e.url && (
        <div style={{ fontSize: 16, color: accent, fontWeight: 800, flexShrink: 0 }}>↗</div>
      )}
    </Tag>
  );
}

// BOOTH 番号バッジ（既存ロジックを共通化）
function BoothBadge({ boothNo }) {
  if (!boothNo) return null;
  const isMulti = boothNo.includes('・');
  return (
    <div style={{
      flexShrink: 0, minWidth: 50, minHeight: 56,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: a2.fg, color: a2.bg,
      fontFamily: '"JetBrains Mono", monospace',
      padding: '5px 8px 6px',
      whiteSpace: 'nowrap',
      textAlign: 'center',
      gap: 1,
    }}>
      <span style={{
        fontSize: 7, fontWeight: 700, letterSpacing: '0.18em',
        color: a2.ki, lineHeight: 1, opacity: 0.85,
        fontFamily: 'system-ui, sans-serif',
      }}>BOOTH</span>
      {isMulti ? boothNo.split('・').map((n, idx) => (
        <span key={idx} style={{
          display: 'block',
          fontSize: idx === 0 ? 14 : 11,
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '0.02em',
          opacity: idx === 0 ? 1 : 0.78,
        }}>
          {idx === 0 ? n : `・${n}`}
        </span>
      )) : (
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.04em', lineHeight: 1.1 }}>
          {boothNo}
        </span>
      )}
    </div>
  );
}
function truncate(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }

// ─── サイト制作会社紹介 ───
function A2Producer({ t }) {
  // 翻訳が読み込まれるまでのフォールバック（producer キーが存在しない言語に備える）
  const p = (t && t.producer) || {
    enLabel: 'PRODUCED BY', repLabel: 'REPRESENTATIVE',
    repNameMain: '国吉 弘孝', repNameSub: 'くによし ひろたか',
    producerLabel: 'WEBSITE PRODUCER',
    companyMain: 'SearchMania Inc.', companySub: '株式会社SearchMania',
    bniLabel: 'BNI', bniValue: '沖縄リージョン TOPチャプター・DNAチーム',
    boothLabel: 'BOOTH', boothValue: 'ブース〇〇番に出展予定',
    webLabel: 'WEB', webUrl: 'https://search-mania.net/',
    howLabel: '事業内容と本サイトについて',
    howBody: 'SearchMania（株式会社SearchMania）は沖縄を拠点に企業のWebマーケティング・SEO・サイト制作と運用支援を行っています。本サイトの企画・デザイン・実装を担当しました。',
  };
  const webUrl = p.webUrl || 'https://search-mania.net/';
  const infoRows = [
    { label: p.bniLabel, value: p.bniValue },
    { label: p.boothLabel, value: p.boothValue, note: true },
    { label: p.webLabel, value: webUrl, href: webUrl },
  ];
  return (
    <section id="producer" className="a2-producer-section" style={{
      padding: '100px 36px',
      background: a2.bg,
      position: 'relative', overflow: 'hidden',
      scrollMarginTop: 80,
      borderTop: `1px solid ${a2.border}`,
    }}>
      {/* 背景の装飾文字 */}
      <div aria-hidden="true" className="a2-producer-deco" style={{
        position: 'absolute', top: 30, right: -10,
        fontSize: 200, fontWeight: 900, color: a2.ai, opacity: 0.04,
        lineHeight: 0.9, letterSpacing: '-0.04em',
        fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic',
        pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>Producer.</div>

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        {/* セクションラベル */}
        <div className="a2-reveal" style={{
          display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 52,
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ width: 36, height: 1, background: a2.ai }} />
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.38em', color: a2.ai }}>
            {p.enLabel}
          </div>
          <div style={{ width: 36, height: 1, background: a2.ai }} />
        </div>

        <div className="a2-producer-grid" style={{
          display: 'grid', gridTemplateColumns: '280px 1fr', gap: 60, alignItems: 'flex-start',
        }}>
          {/* ── 写真 カラム ── */}
          <div className="a2-reveal-r a2-producer-photo-wrap">
            <div style={{ position: 'relative' }}>
              {/* 影装飾 */}
              <div style={{
                position: 'absolute', top: 12, left: 12, right: -12, bottom: -12,
                background: a2.ai, zIndex: 0,
              }} />
              <div style={{ position: 'relative', zIndex: 2, border: `2px solid ${a2.fg}`, background: a2.bg, overflow: 'hidden' }}>
                <img
                  src="assets/kuniyoshi.png"
                  alt={`${p.repNameMain} — ${p.companyMain}`}
                  loading="lazy"
                  style={{ width: '100%', display: 'block', filter: 'contrast(1.04)' }}
                />
                {/* カラーバー overlay */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 44,
                  background: `linear-gradient(90deg, ${a2.shu} 0 33%, ${a2.ki} 33% 66%, ${a2.ai} 66% 100%)`,
                  mixBlendMode: 'multiply', opacity: 0.22,
                }} />
              </div>
              {/* 名前プレート */}
              <div className="a2-reveal" style={{
                marginTop: 14, padding: '13px 17px',
                background: a2.ai, color: a2.bg,
                boxShadow: `4px 4px 0 ${a2.fg}`,
                fontFamily: 'system-ui, sans-serif',
                animationDelay: '.15s', position: 'relative', zIndex: 2,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: a2.ki, marginBottom: 5 }}>
                  ◆ {p.repLabel}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.15 }}>{p.repNameMain}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 3 }}>{p.repNameSub}</div>
              </div>
            </div>
          </div>

          {/* ── 情報 カラム ── */}
          <div className="a2-reveal-l">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', color: a2.ai, marginBottom: 8, fontFamily: 'system-ui, sans-serif' }}>
              ◆ {p.producerLabel}
            </div>
            <div className="a2-producer-name" style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 5 }}>
              {p.companyMain}
            </div>
            <div style={{ fontSize: 13, color: a2.fgSoft, marginBottom: 34, fontFamily: 'system-ui, sans-serif' }}>
              {p.companySub}
            </div>

            {/* 情報行 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontFamily: 'system-ui, sans-serif', marginBottom: 36 }}>
              {infoRows.map(({ label, value, href, note }) => (
                <div key={label} style={{
                  display: 'flex', gap: 18, alignItems: 'baseline',
                  borderBottom: `1px solid ${a2.border}`, paddingBottom: 12, paddingTop: 12,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: a2.fgSoft, minWidth: 46, flexShrink: 0, fontFamily: 'system-ui, sans-serif' }}>
                    {label}
                  </div>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: a2.ai, fontWeight: 700, textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                      {value} ↗
                    </a>
                  ) : (
                    <div style={{ fontSize: 13, color: note ? a2.fgSoft : a2.fg, fontWeight: note ? 400 : 600, fontFamily: 'system-ui, sans-serif', fontStyle: note ? 'italic' : 'normal' }}>
                      {value}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── 事業内容＋サイトの仕組み ── */}
            <div style={{
              background: a2.fg, color: a2.bg, padding: '22px 24px',
              boxShadow: `5px 5px 0 ${a2.ai}`,
              fontFamily: 'system-ui, sans-serif',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.32em', color: a2.ki, marginBottom: 13 }}>
                ◆ {p.howLabel}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.95, opacity: 0.92, whiteSpace: 'pre-wrap' }}>
                {p.howBody}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── アクセス ───
function A2Access({ t }) {
  return (
    <section id="access" style={{ padding: '120px 36px', background: a2.bgSoft, scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionTitleA2 en="ACCESS" ja={t.access.title} accent={a2.shu} />
        <div className="a2-access-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 56 }}>
          <div className="a2-reveal-r">
            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, color: a2.fg, letterSpacing: '-0.01em' }}>
              {t.access.venueName}
            </div>
            <div style={{ fontSize: 14, color: a2.fgSoft, marginBottom: 32, fontFamily: 'system-ui, sans-serif' }}>
              {t.event.address}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AccessRowA2 icon="✈" label={t.access.airport} accent={a2.shu} />
              <AccessRowA2 icon="🅿" label={t.access.parking} accent={a2.midori} />
              <a href="https://maps.app.goo.gl/ahSoSDBrFjEVcsH78" target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
                <AccessRowA2 icon="📍" label={t.access.mapLabel + ' ↗'} accent={a2.ai} />
              </a>
            </div>
          </div>
          <div className="a2-reveal-l" style={{
            aspectRatio: '4/3', border: `2px solid ${a2.fg}`, position: 'relative',
            boxShadow: `8px 8px 0 ${a2.fg}`, overflow: 'hidden',
          }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3577.417723589276!2d127.7382757!3d26.280555000000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x34e56cb09b9351a9%3A0x628e2861759a9649!2z44Op44Kw44OK44Ks44O844OH44Oz44Ob44OG44Or!5e0!3m2!1sja!2sjp!4v1777111159097!5m2!1sja!2sjp"
              style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Laguna Garden Hotel" />
            <div style={{ position: 'absolute', top: 12, left: 12, background: a2.fg, color: a2.bg, padding: '6px 12px', fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', boxShadow: `4px 4px 0 ${a2.shu}`, fontFamily: 'system-ui, sans-serif', pointerEvents: 'none' }}>
              ◆ LAGUNA GARDEN HOTEL
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AccessRowA2({ icon, label, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      background: a2.bg, padding: '14px 20px',
      borderLeft: `4px solid ${accent}`,
      transition: 'transform .25s, border-left-width .25s', cursor: 'default',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.borderLeftWidth = '8px'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderLeftWidth = '4px'; }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: a2.fg, fontFamily: 'system-ui, sans-serif' }}>{label}</div>
    </div>
  );
}

// ─── CTA ───
function A2Cta({ t }) {
  return (
    <section style={{ padding: '140px 36px', background: a2.bg, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${a2.shu}33 30%, ${a2.shu}33 70%, transparent)` }} />
      <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${a2.ai}33 30%, ${a2.ai}33 70%, transparent)` }} />
      <svg style={{ position: 'absolute', top: 40, left: 40, opacity: 0.18, pointerEvents: 'none' }} width="120" height="120" viewBox="0 0 120 120">
        <line x1="0" y1="0" x2="60" y2="0" stroke={a2.shu} strokeWidth="2" />
        <line x1="0" y1="0" x2="0" y2="60" stroke={a2.shu} strokeWidth="2" />
        <circle cx="0" cy="0" r="6" fill={a2.shu} />
      </svg>
      <svg style={{ position: 'absolute', bottom: 40, right: 40, opacity: 0.18, pointerEvents: 'none' }} width="120" height="120" viewBox="0 0 120 120">
        <line x1="120" y1="120" x2="60" y2="120" stroke={a2.ai} strokeWidth="2" />
        <line x1="120" y1="120" x2="120" y2="60" stroke={a2.ai} strokeWidth="2" />
        <circle cx="120" cy="120" r="6" fill={a2.ai} />
      </svg>
      <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
        <h2 className="a2-reveal a2-cta-title" style={{ fontSize: 64, fontWeight: 900, margin: '0 0 24px', lineHeight: 1.2, color: a2.fg }}>
          {t.cta.title}
        </h2>
        {/* 価格表記：ヒーローと同一の PriceLineA2 を使用。block ラッパーでボタンを確実に次行へ */}
        <div className="a2-reveal" style={{ marginBottom: 40, animationDelay: '.1s', textAlign: 'center' }}>
          <PriceLineA2 sub={t.cta.sub} subFree={t.cta.subFree} center />
        </div>
        <a href="register.html" className="a2-reveal-scale a2-btn-shu a2-cta-glow" style={{
          background: a2.shu, color: a2.bg, border: 'none',
          padding: '20px 52px', cursor: 'pointer',
          boxShadow: `8px 8px 0 ${a2.fg}`,
          fontFamily: 'system-ui, sans-serif', textDecoration: 'none',
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          animationDelay: '.2s',
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.05em' }}>{t.cta.btn} →</span>
          {t.cta.limit && (
            <span style={{
              fontSize: 12, fontWeight: 800, letterSpacing: '0.1em',
              padding: '3px 12px', background: a2.ki, color: a2.fg,
              border: `1px solid ${a2.fg}`,
            }}>※ {t.cta.limit}</span>
          )}
        </a>
      </div>
    </section>
  );
}

// ─── 後援企業セクション ─────────────────────────────────────
// 50音順（読みの最初の音で並び・濁音は同行の清音の直後）:
//   え → お(きなわけん) → お(きなわてれび) → か(ぶ…お/ら/り) → ぎ → り
const SPONSORS = [
  { name: 'エフエム沖縄株式会社',                 url: 'https://www.fmokinawa.co.jp/',     media: 'RADIO',   mediaJa: 'ラジオ' },
  { name: '沖縄県観光コンベンションビューロー',     url: 'https://www.ocvb.or.jp/',          media: 'TOURISM', mediaJa: '観光' },
  { name: '沖縄テレビ放送株式会社',               url: 'https://www.otv.co.jp/',           media: 'TV',      mediaJa: 'テレビ' },
  { name: '株式会社沖縄タイムス社',               url: 'https://www.okinawatimes.co.jp/',  media: 'PRESS',   mediaJa: '新聞' },
  { name: '株式会社ラジオ沖縄',                   url: 'https://www.rokinawa.co.jp/',      media: 'RADIO',   mediaJa: 'ラジオ' },
  { name: '株式会社琉球新報社',                   url: 'https://ryukyushimpo.jp/',         media: 'PRESS',   mediaJa: '新聞' },
  { name: '宜野湾市',                             url: 'https://www.city.ginowan.lg.jp/',  media: 'CITY',    mediaJa: '自治体' },
  { name: '琉球朝日放送株式会社',                 url: 'https://www.qab.co.jp/',           media: 'TV',      mediaJa: 'テレビ' },
  { name: '琉球放送株式会社',                     url: 'https://www.rbc.co.jp/',           media: 'TV',      mediaJa: 'テレビ' },
];

const MEDIA_COLOR = {
  TV:      '#1e5a82', // 藍 — テレビ
  RADIO:   '#c89615', // 黄 — ラジオ
  PRESS:   '#d63b2c', // 朱 — 新聞
  TOURISM: '#2f7a5a', // 緑 — 観光団体
  CITY:    '#5a4a8a', // 紫 — 自治体
};
const MEDIA_ICON = {
  TV:      (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M8 21h8M12 17v4"/></svg>),
  RADIO:   (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="14" r="3"/><path d="M4 20V8l16-4v16"/><circle cx="15.5" cy="14" r="1.2" fill="currentColor"/></svg>),
  PRESS:   (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="14" height="16" rx="1.5"/><path d="M6 8h8M6 12h8M6 16h5M17 9h3v9.5a1.5 1.5 0 0 1-3 0V9z"/></svg>),
  TOURISM: (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="17" cy="6" r="2"/><path d="M3 20l5-7 4 5 3-4 6 6H3z"/></svg>),
  CITY:    (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21V9l9-5 9 5v12"/><rect x="10" y="14" width="4" height="7"/><path d="M7 11h1.5M15.5 11h1.5M7 15h1.5M15.5 15h1.5"/></svg>),
};

function A2Sponsors({ t }) {
  const title = (t.sponsors && t.sponsors.title) || '後援';
  return (
    <section style={{
      padding: '70px 36px 90px',
      background: a2.bg,
      borderTop: `1px solid ${a2.fg}10`,
    }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 14, marginBottom: 36,
        }}>
          <span style={{ width: 32, height: 1, background: a2.fg, opacity: 0.35 }} />
          <h3 style={{
            margin: 0, fontSize: 14, fontWeight: 800, letterSpacing: '0.25em',
            color: a2.fg, opacity: 0.78,
          }}>{title}</h3>
          <span style={{ width: 32, height: 1, background: a2.fg, opacity: 0.35 }} />
        </div>
        <ul className="a2-sponsors-grid" style={{
          listStyle: 'none', margin: 0, padding: 0,
          display: 'grid', gap: 14,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          maxWidth: 920, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {SPONSORS.map(s => {
            const color = MEDIA_COLOR[s.media];
            const icon = MEDIA_ICON[s.media];
            return (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="a2-sponsor-card"
                  style={{
                    display: 'flex', flexDirection: 'column',
                    padding: '16px 18px',
                    background: '#fff',
                    border: `1px solid ${a2.fg}14`,
                    borderTop: `3px solid ${color}`,
                    textDecoration: 'none', color: 'inherit',
                    transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                    minHeight: 92,
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: color, marginBottom: 10,
                  }}>
                    {icon}
                    <span style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.22em',
                      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                    }}>{s.media}</span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, color: a2.fg, opacity: 0.5,
                      marginLeft: 2,
                    }}>／ {s.mediaJa}</span>
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: a2.fg, lineHeight: 1.4,
                    fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
                  }}>{s.name}</div>
                </a>
              </li>
            );
          })}
        </ul>
        <p style={{
          marginTop: 28, marginBottom: 0, textAlign: 'center',
          fontSize: 10.5, letterSpacing: '0.18em',
          color: a2.fg, opacity: 0.42,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        }}>(50音順)</p>
      </div>
    </section>
  );
}

// ─── ポリシーモーダル ───────────────────────────────────────
const LINE_URL = 'https://line.me/R/ti/p/@744geuzz';
const LINE_CONTACT = (
  <p>お問い合わせは <a href={LINE_URL} target="_blank" rel="noopener noreferrer"
    style={{ color: '#1e5a82', fontWeight: 700 }}>BFO公式LINE</a> へお気軽にどうぞ。
  </p>
);

const LEGAL_CONTENT = {
  privacy: {
    tag: 'PRIVACY POLICY', tagColor: '#d63b2c',
    title: 'プライバシーポリシー',
    body: (
      <div>
        <p style={{ color: '#5a4a3a', fontSize: 13, marginBottom: 24 }}>
          Business Fusion Okinawa 2026（以下「本イベント」）における個人情報の取り扱いについて定めます。
        </p>
        <h3>1. 個人情報の利用目的</h3>
        <ul>
          <li>参加申込みの受付および当日の受付処理</li>
          <li>参加者ID（QRコード）の発行および本人確認</li>
          <li>イベント開催に関する重要なご連絡（変更・中止等）</li>
          <li>懇親会の参加管理および会費決済</li>
          <li>統計的なデータの集計・分析（個人を特定しない形式）</li>
        </ul>
        <h3>2. 取得する情報</h3>
        <ul>
          <li>氏名・メールアドレス</li>
          <li>所属（BNIチャプター・紹介者等）</li>
          <li>懇親会参加有無および決済情報</li>
          <li>当日の受付・チェックイン履歴</li>
        </ul>
        <h3>3. 第三者への提供</h3>
        <p>取得した個人情報は、ご本人の同意がある場合・法令に基づく場合・運営委託先への必要最小限の提供を除き、第三者に提供しません。</p>
        <h3>4. 安全管理措置</h3>
        <p>Google Workspace（Google スプレッドシート / Apps Script）の安全な環境下で管理し、不正アクセス・漏えい等の防止に努めます。</p>
        <h3>5. 開示・訂正・削除のご請求</h3>
        <p>ご自身の個人情報について開示・訂正・削除をご希望の場合は、お問い合わせ窓口までご連絡ください。</p>
        <h3>6. Cookie について</h3>
        <p>本サイトでは Google Fonts 等の外部リソースを利用しています。個人を特定する情報は収集しません。</p>
        <h3>7. お問い合わせ</h3>
        {LINE_CONTACT}
        <h3>8. 改定について</h3>
        <p>本ポリシーは必要に応じて改定する場合があります。改定後は本ページ掲載時点で効力を生じます。</p>
        <p style={{ fontSize: 11, color: '#5a4a3a', borderTop: '1px solid #e0e0e0', paddingTop: 16, marginTop: 24 }}>
          制定日：2026年4月1日　／　Business Fusion Okinawa 2026 運営事務局
        </p>
      </div>
    ),
  },
  terms: {
    tag: 'TERMS OF SERVICE', tagColor: '#1e5a82',
    title: '利用規約',
    body: (
      <div>
        <p style={{ color: '#5a4a3a', fontSize: 13, marginBottom: 24 }}>
          本イベントへの参加申込みおよびご来場にあたり、以下の規約に同意いただいたものとみなします。
        </p>
        <h3>1. 適用範囲</h3>
        <p>本規約は本イベントへの参加申込み・参加・関連サービスの利用に適用されます。</p>
        <h3>2. 参加資格</h3>
        <ul>
          <li>事前申込み完了者または当日受付完了者</li>
          <li>反社会的勢力に該当しない方</li>
          <li>イベントの趣旨に賛同いただける方</li>
        </ul>
        <h3>3. 参加費・料金</h3>
        <ul>
          <li>事前申込み：無料</li>
          <li>当日参加：5,000円（税込）</li>
          <li>懇親会：別途 15,000円（税込・事前決済）</li>
        </ul>
        <h3>4. キャンセルおよび変更</h3>
        <p>事前申込み後のキャンセルは開催日3日前までにお問い合わせください。懇親会の決済済み参加費は開催3日前以降のキャンセルについては返金いたしかねます。</p>
        <h3>5. 禁止事項</h3>
        <ul>
          <li>他の参加者・出展者・運営スタッフへの迷惑行為</li>
          <li>許可なき録音・録画・撮影</li>
          <li>イベント内での無断勧誘・営業活動（出展企業ブースを除く）</li>
          <li>会場設備の破損・汚損</li>
          <li>法令または公序良俗に反する行為</li>
        </ul>
        <h3>6. 写真・映像の利用</h3>
        <p>運営側で撮影した記録写真・映像は、広報・公式SNS・次年度告知資料等に使用される場合があります。映り込みを希望されない場合は当日スタッフへお申し出ください。</p>
        <h3>7. 中止・延期について</h3>
        <p>天候不良・天災・感染症等やむを得ない事情により中止・延期する場合があります。登録メールアドレスへご案内いたします。</p>
        <h3>8. 免責事項</h3>
        <ul>
          <li>会場内での事故・盗難・紛失について運営事務局は責任を負いかねます</li>
          <li>出展企業との取引・契約は参加者と出展企業間で完結するものとします</li>
        </ul>
        <h3>9. お問い合わせ</h3>
        {LINE_CONTACT}
        <p style={{ fontSize: 11, color: '#5a4a3a', borderTop: '1px solid #e0e0e0', paddingTop: 16, marginTop: 24 }}>
          制定日：2026年4月1日　／　Business Fusion Okinawa 2026 運営事務局
        </p>
      </div>
    ),
  },
  guidelines: {
    tag: 'EVENT GUIDELINES', tagColor: '#3a8a5e',
    title: '参加ガイドライン',
    body: (
      <div>
        <p style={{ color: '#5a4a3a', fontSize: 13, marginBottom: 24 }}>
          Business Fusion Okinawa 2026 をより有意義な時間としていただくため、以下をご一読ください。
        </p>
        <h3>当日の流れ</h3>
        <ol>
          <li><strong>受付</strong>：QRコード（または参加者ID）を当日スタッフにご提示ください</li>
          <li><strong>名札の受取</strong>：受付完了後、お名前入りの名札をお渡しします</li>
          <li><strong>展示会場へ</strong>：70社の出展ブースを自由にご覧いただけます</li>
          <li><strong>基調講演・セミナー</strong>：タイムテーブルに沿ってご参加ください</li>
          <li><strong>懇親会</strong>：事前申込み済みの方のみ（19:00〜）</li>
        </ol>
        <h3>持ち物</h3>
        <ul>
          <li>参加者ID・QRコード（申込み完了メールに記載）</li>
          <li>名刺（出展企業との交流用に十分な枚数を推奨）</li>
        </ul>
        <h3>服装について</h3>
        <p>ビジネスカジュアル〜スマートカジュアルを推奨。沖縄らしい「かりゆしウェア」も歓迎です。会場は冷房が効いていますので上着があると安心です。</p>
        <h3>会場でのマナー</h3>
        <ul>
          <li>大声での通話・私語はお控えください</li>
          <li>許可のない撮影・録音はご遠慮ください</li>
          <li>会場内は禁煙です。指定の喫煙所をご利用ください</li>
          <li>他の来場者・出展者への配慮をお願いします</li>
        </ul>
        <h3>懇親会について</h3>
        <ul>
          <li>時間：19:00 〜 21:00 / 場所：同会場（ラグナガーデンホテル）</li>
          <li>会費：15,000円（事前決済済み） / 立食形式・名札着用必須</li>
          <li>飲酒運転は法律で禁じられています。お車の方は飲酒をお控えください</li>
        </ul>
        <h3>緊急時の対応</h3>
        <p>気分が悪くなった・けがをされた場合は、お近くの運営スタッフ（赤いストラップ着用）へお声がけください。AEDは会場入口に設置されています。</p>
        <h3>お問い合わせ</h3>
        {LINE_CONTACT}
        <p style={{ fontSize: 11, color: '#5a4a3a', borderTop: '1px solid #e0e0e0', paddingTop: 16, marginTop: 24 }}>
          制定日：2026年4月1日　／　Business Fusion Okinawa 2026 運営事務局
        </p>
      </div>
    ),
  },
};

function LegalModal({ type, onClose }) {
  const content = LEGAL_CONTENT[type];
  if (!content) return null;

  // ESC キーで閉じる / ボディスクロールロック
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(26,22,18,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* モーダル本体 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          border: `2px solid #1a1612`,
          boxShadow: '8px 8px 0 #1a1612',
          width: '100%', maxWidth: 680,
          maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", system-ui, sans-serif',
        }}
      >
        {/* ヘッダー */}
        <div style={{
          background: '#1a1612', color: '#ffffff',
          padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: content.tagColor, marginBottom: 4 }}>
              ◆ {content.tag}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.01em', fontFamily: '"Noto Serif JP", serif' }}>
              {content.title}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            style={{
              background: 'transparent', border: '1.5px solid #ffffff55',
              color: '#ffffff', cursor: 'pointer',
              width: 36, height: 36, fontSize: 18, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, lineHeight: 1,
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff22'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >✕</button>
        </div>
        {/* コンテンツ（スクロール可能） */}
        <div style={{
          overflowY: 'auto', padding: '28px 28px 32px',
          fontSize: 14, lineHeight: 1.85, color: '#1a1612',
        }}>
          <style>{`
            .bfo-modal-body h3 {
              font-size: 15px; font-weight: 800; margin: 24px 0 10px;
              padding-left: 12px; border-left: 3px solid ${content.tagColor};
              font-family: "Noto Serif JP", serif; color: #1a1612;
            }
            .bfo-modal-body h3:first-child { margin-top: 0; }
            .bfo-modal-body p { margin: 0 0 12px; }
            .bfo-modal-body ul, .bfo-modal-body ol { padding-left: 20px; margin: 0 0 14px; }
            .bfo-modal-body li { margin-bottom: 5px; }
          `}</style>
          <div className="bfo-modal-body">{content.body}</div>
        </div>
        {/* フッター */}
        <div style={{
          padding: '14px 28px', borderTop: '1px solid #e8e0d4',
          textAlign: 'center', flexShrink: 0,
          fontSize: 11, color: '#5a4a3a', fontFamily: 'monospace', letterSpacing: '0.1em',
        }}>
          ESC キーまたは外側クリックで閉じます
        </div>
      </div>
    </div>
  );
}

// ─── フッター（隠しチェックイン導線つき） ───
function A2Footer({ t }) {
  const clicksRef = React.useRef([]);
  const [pinPrompt, setPinPrompt] = React.useState(false);
  const [legalModal, setLegalModal] = React.useState(null); // 'privacy' | 'terms' | 'guidelines'

  const onCopyrightClick = () => {
    const now = Date.now();
    clicksRef.current = [...clicksRef.current.filter(t => now - t < 3000), now];
    if (clicksRef.current.length >= 5) {
      clicksRef.current = [];
      setPinPrompt(true);
    }
  };

  React.useEffect(() => {
    if (!pinPrompt) return;
    if (!window.CONFIG || !window.CONFIG.CHECKIN_PIN) {
      console.warn('⚠ window.CONFIG.CHECKIN_PIN が読み込まれていません');
      alert('設定ファイル読込中です。少し待ってからもう一度お試しください。');
      setPinPrompt(false);
      return;
    }
    const expected = String(window.CONFIG.CHECKIN_PIN).trim();
    const remembered = localStorage.getItem('bfo2026_checkin_unlocked') === '1';
    if (remembered) {
      window.location.href = 'bfo77.html';
      return;
    }
    const input = window.prompt('管理者PINを入力してください（4桁）');
    if (input !== null && String(input).trim() === expected) {
      localStorage.setItem('bfo2026_checkin_unlocked', '1');
      window.location.href = 'bfo77.html';
    } else if (input !== null) {
      console.warn('PIN認証失敗。入力長:', String(input).length, ' 期待長:', expected.length);
      alert('PINが違います');
    }
    setPinPrompt(false);
  }, [pinPrompt]);

  const closeModal = React.useCallback(() => setLegalModal(null), []);

  return (
    <>
      {/* ポリシーモーダル（フッターの外・画面全体に表示） */}
      {legalModal && <LegalModal type={legalModal} onClose={closeModal} />}

      <footer style={{ background: a2.fg, color: a2.bg, padding: '60px 36px 30px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ background: a2.bg, padding: '6px 8px' }}>
                  <img src="assets/bni-logo.png" style={{ height: 18, display: 'block' }} alt="BNI" />
                </div>
              </div>
              <div style={{ fontSize: 12, opacity: 0.6, fontFamily: 'system-ui, sans-serif', lineHeight: 1.7 }}>
                {t.footer.produced}<br/>
                <a href="https://search-mania.net/" target="_blank" rel="noopener" style={{ color: a2.bg, textDecoration: 'none', borderBottom: `1px dashed ${a2.bg}55`, paddingBottom: 1 }}>
                  {t.footer.developed} ↗
                </a>
              </div>
            </div>
            {/* LEGAL — モーダルで開く */}
            <div style={{ fontFamily: 'system-ui, sans-serif' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: a2.ki, marginBottom: 14 }}>LEGAL</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  { key: 'privacy',    label: t.footer.privacy },
                  { key: 'terms',      label: t.footer.terms },
                  { key: 'guidelines', label: t.footer.guidelines },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setLegalModal(key)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, color: a2.bg, opacity: 0.7,
                      display: 'inline-block', width: 'fit-content',
                      textAlign: 'left', padding: 0,
                      fontFamily: 'system-ui, sans-serif',
                      textDecoration: 'underline', textUnderlineOffset: 3,
                      textDecorationColor: `${a2.bg}44`,
                      transition: 'opacity .15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <FooterColA2 title="EVENT" items={[
              { label: t.nav.about,    scrollTo: 'about' },
              { label: t.nav.schedule, scrollTo: 'schedule' },
              { label: t.nav.greeting, scrollTo: 'greeting' },
            ]} />
            <FooterColA2 title="CONTACT" items={[
              { label: 'BFO公式LINE',  href: 'https://line.me/R/ti/p/@744geuzz', external: true },
              { label: 'BNI沖縄 公式',  href: 'https://bniokinawa.com/',          external: true },
              { label: 'YouTube',     href: 'https://www.youtube.com/@BNIOkinawa', external: true },
            ]} />
          </div>
          <div style={{ borderTop: `1px solid ${a2.bg}22`, paddingTop: 24, fontSize: 10, opacity: 0.5, fontFamily: 'monospace', letterSpacing: '0.15em', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span onClick={onCopyrightClick} style={{ cursor: 'default', userSelect: 'none' }} title="">{t.footer.copyright}</span>
            <span>2026.07.07 — LAGUNA GARDEN, OKINAWA</span>
          </div>
        </div>
      </footer>
    </>
  );
}
function FooterColA2({ title, items }) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: a2.ki, marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map((it, i) => {
          // 文字列だけの場合（後方互換）はそのまま表示
          if (typeof it === 'string') {
            return (
              <a key={i} className="a2-link-underline" style={{ fontSize: 12, color: a2.bg, opacity: 0.7, cursor: 'pointer', display: 'inline-block', width: 'fit-content' }}>{it}</a>
            );
          }
          // オブジェクトの場合は href / scrollTo / external で出し分け
          const linkStyle = { fontSize: 12, color: a2.bg, opacity: 0.7, cursor: 'pointer', display: 'inline-block', width: 'fit-content', textDecoration: 'none' };
          const onMouseEnter = (e) => { e.currentTarget.style.opacity = '1'; };
          const onMouseLeave = (e) => { e.currentTarget.style.opacity = '0.7'; };
          if (it.scrollTo) {
            return (
              <a key={i} href={`#${it.scrollTo}`} onClick={scrollToSection(it.scrollTo)} className="a2-link-underline" style={linkStyle} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                {it.label}
              </a>
            );
          }
          if (it.href) {
            const externalProps = it.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <a key={i} href={it.href} {...externalProps} className="a2-link-underline" style={linkStyle} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                {it.label}{it.external ? ' ↗' : ''}
              </a>
            );
          }
          return (
            <span key={i} style={{ ...linkStyle, cursor: 'default' }}>{it.label}</span>
          );
        })}
      </div>
    </div>
  );
}

// ─── 主催者挨拶（座間味ED） ───
function A2Greeting({ t }) {
  return (
    <section id="greeting" style={{
      padding: '140px 36px',
      background: `linear-gradient(180deg, ${a2.bg} 0%, ${a2.bgSoft} 100%)`,
      position: 'relative', overflow: 'hidden', scrollMarginTop: 80,
    }}>
      <div className="a2-reveal" aria-hidden="true" style={{
        position: 'absolute', top: 40, right: -20,
        fontSize: 280, fontWeight: 900, color: a2.shu, opacity: 0.06,
        lineHeight: 0.9, letterSpacing: '-0.04em',
        fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic',
        pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>Greeting.</div>
      <div className="a2-rotate-slow" style={{ position: 'absolute', top: -60, left: -60, opacity: 0.25 }}>
        <Hibiscus color={a2.ki} size={260} />
      </div>
      <div className="a2-float" style={{ position: 'absolute', bottom: 80, right: 60 }}>
        <Hibiscus color={a2.shu} size={70} />
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <SectionTitleA2 en={t.greeting.enLabel} ja={t.greeting.title} accent={a2.shu} />
        <div className="a2-greeting-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 64, marginTop: 64, alignItems: 'flex-start' }}>
          <div className="a2-reveal-r" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 14, left: 14, right: -14, bottom: -14, background: a2.shu, zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 24, left: 24, right: -4, bottom: -4, border: `2px solid ${a2.fg}`, zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 2, border: `2px solid ${a2.fg}`, background: a2.bg, overflow: 'hidden' }}>
              <img src="assets/zamami-ed.png" alt={t.greeting.name} style={{ width: '100%', display: 'block', filter: 'contrast(1.05)' }} />
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 50,
                background: `linear-gradient(90deg, ${a2.shu} 0 33%, ${a2.ki} 33% 66%, ${a2.ai} 66% 100%)`,
                mixBlendMode: 'multiply', opacity: 0.25,
              }} />
            </div>
            <div className="a2-reveal" style={{
              marginTop: 20, padding: '14px 18px',
              background: a2.fg, color: a2.bg,
              boxShadow: `4px 4px 0 ${a2.shu}`,
              fontFamily: 'system-ui, sans-serif',
              animationDelay: '.2s', position: 'relative', zIndex: 2,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: a2.ki, marginBottom: 6 }}>
                ◆ EXECUTIVE DIRECTOR
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{t.greeting.name}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{t.greeting.role}</div>
            </div>
          </div>
          <div className="a2-reveal-l">
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.25em', color: a2.shu, marginBottom: 22, fontFamily: 'system-ui, sans-serif' }}>
              ◆ {t.greeting.role}
            </div>
            <div style={{ fontSize: 17, lineHeight: 2.0, color: a2.fg, whiteSpace: 'pre-line', fontWeight: 500 }}>
              {t.greeting.body}
            </div>
            <div style={{
              marginTop: 36, paddingTop: 24,
              borderTop: `1px solid ${a2.border}`,
              display: 'flex', alignItems: 'baseline', gap: 18,
              fontFamily: 'system-ui, sans-serif',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: a2.fgSoft }}>
                ◆ {t.greeting.sign}
              </div>
              <div style={{ flex: 1, height: 1, background: a2.border }} />
              <div style={{
                fontSize: 28, fontWeight: 900, color: a2.shu,
                fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic',
                letterSpacing: '-0.01em',
              }}>Zamami</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 会場レイアウト ───
function A2VenueLayout({ t, content, lang, exhibitors }) {
  const v = t.venueMap;
  // 言語別レイアウト画像（assets/ に配置）
  // ja: 日本語 / en: 英語 / zh: 繁中 / ko: 韓国語
  const imgMap = {
    ja: 'assets/venue-layout-ja.png',
    en: 'assets/venue-layout-en.png',
    zh: 'assets/venue-layout-zh.png',
    ko: 'assets/venue-layout-ko.png',
  };
  const imgSrc = imgMap[lang] || imgMap.ja;

  // 画像読込み失敗時のフォールバック制御
  const [imgError, setImgError] = React.useState(false);
  React.useEffect(() => { setImgError(false); }, [imgSrc]);

  // ブース番号インデックス：出展企業のブース番号を展開してソート
  const boothIndex = React.useMemo(() => {
    const map = {};
    (exhibitors || []).forEach(ex => {
      if (!ex.booth_no) return;
      // "01 / 02" や "01,02" など複数ブースも対応
      const nos = ex.booth_no.toString().split(/[\/,、・\s]+/).map(s => s.trim()).filter(Boolean);
      nos.forEach(no => {
        const key = no.replace(/^0+/, '').padStart(2, '0'); // 正規化
        map[key] = ex.name || '—';
      });
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
  }, [exhibitors]);

  return (
    <section id="venue" style={{ padding: '120px 36px 60px', background: a2.bg, position: 'relative', overflow: 'hidden', scrollMarginTop: 80 }}>
      <div className="a2-rotate-slow" style={{ position: 'absolute', top: -120, right: -120, opacity: 0.15 }}>
        <Hibiscus color={a2.ai} size={360} />
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <SectionTitleA2 en={v.enLabel} ja={v.title} accent={a2.ai} />
        <p className="a2-reveal" style={{ fontSize: 16, color: a2.fgSoft, marginTop: 16, fontFamily: 'system-ui, sans-serif' }}>
          ◆ {v.subtitle}
        </p>
        <div className="a2-reveal-scale" style={{
          marginTop: 56, background: a2.bgSoft,
          border: `2px solid ${a2.fg}`, boxShadow: `12px 12px 0 ${a2.fg}`,
          padding: 14, position: 'relative',
        }}>
          {imgError ? (
            // 画像読込失敗時はSVG版にフォールバック
            <VenueLayoutSVG v={v} />
          ) : (
            <img
              src={imgSrc}
              alt={`${v.title} (${lang})`}
              onError={() => setImgError(true)}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                margin: '0 auto',
              }}
            />
          )}
        </div>

        {/* ブース番号インデックス */}
        {boothIndex.length > 0 && (
          <div className="a2-reveal" style={{ marginTop: 32 }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.28em',
              color: a2.ai, fontFamily: 'system-ui, sans-serif',
              marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ flex: '0 0 28px', height: 1, background: a2.ai, display: 'inline-block' }} />
              BOOTH INDEX
              <span style={{ flex: '0 0 28px', height: 1, background: a2.ai, display: 'inline-block' }} />
            </div>
            <div className="a2-booth-index" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 6,
            }}>
              {boothIndex.map(([no, name]) => (
                <div key={no} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px',
                  background: a2.bgSoft,
                  border: `1px solid ${a2.border}`,
                  fontFamily: 'system-ui, sans-serif',
                }}>
                  <span style={{
                    flexShrink: 0, minWidth: 32, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: a2.fg, color: a2.bg,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}>{no}</span>
                  <span style={{
                    fontSize: 12, color: a2.fg, fontWeight: 600,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{name}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <a
                href="#exhibitors"
                onClick={(e) => { e.preventDefault(); scrollToSection('exhibitors'); }}
                style={{
                  fontSize: 12, fontWeight: 700, color: a2.ai,
                  textDecoration: 'none', letterSpacing: '0.08em',
                  fontFamily: 'system-ui, sans-serif',
                  borderBottom: `1px solid ${a2.ai}`,
                  paddingBottom: 2,
                }}
              >
                出展企業の詳細を見る →
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function LegendItem({ swatch, label, desc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', background: a2.bg,
      border: `1px solid ${a2.border}`,
      transition: 'transform .25s, box-shadow .25s',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-3px,-3px)'; e.currentTarget.style.boxShadow = `4px 4px 0 ${swatch}`; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ width: 14, height: 14, background: swatch, flexShrink: 0 }} />
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: a2.fg }}>{label}</div>
        <div style={{ fontSize: 10, color: a2.fgSoft, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

function VenueLayoutSVG({ v }) {
  return (
    <svg viewBox="0 0 1200 720" style={{ width: '100%', display: 'block' }}>
      <defs>
        <pattern id="a2-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={a2.border} strokeWidth="0.5" />
        </pattern>
        <pattern id="a2-stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={a2.shu} strokeWidth="2" opacity="0.25" />
        </pattern>
        <pattern id="a2-stripe-blue" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={a2.ai} strokeWidth="2" opacity="0.22" />
        </pattern>
        <pattern id="a2-stripe-yellow" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={a2.ki} strokeWidth="3" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="1200" height="720" fill="url(#a2-grid)" />
      <g>
        <rect x="540" y="40" width="490" height="430" fill={a2.bg} stroke={a2.fg} strokeWidth="2" />
        <rect x="540" y="40" width="490" height="430" fill="url(#a2-stripe-blue)" />
        <text x="785" y="68" fontSize="16" fontWeight="800" fill={a2.ai} textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="2">{v.hall2}</text>
        <text x="785" y="84" fontSize="9" fill={a2.fgSoft} textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="1.5">7 COLS × 8 ROWS · DESK + CHAIR</text>
        {Array.from({ length: 8 }).map((_, r) => (
          Array.from({ length: 7 }).map((_, c) => {
            const x = 562 + c * 65 + (c >= 4 ? 12 : 0);
            const y = 100 + r * 42;
            return (
              <g key={`d-${r}-${c}`}>
                <rect x={x} y={y} width="44" height="14" fill={a2.bg} stroke={a2.fg} strokeWidth="1" />
                <rect x={x + 8} y={y + 18} width="28" height="8" fill={a2.fg} opacity="0.85" />
                <text x={x + 22} y={y + 10} fontSize="6" fill={a2.fgSoft} textAnchor="middle" fontFamily="monospace">{r * 7 + c + 1}</text>
              </g>
            );
          })
        ))}
        <line x1="831" y1="98" x2="831" y2="438" stroke={a2.fg} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
        <rect x="600" y="442" width="370" height="20" fill={a2.fg} />
        <text x="785" y="456" fontSize="10" fontWeight="700" fill={a2.bg} textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="2">◆ SCREEN</text>
      </g>
      <g>
        <rect x="180" y="40" width="340" height="430" fill={a2.bg} stroke={a2.fg} strokeWidth="2" />
        <rect x="180" y="40" width="340" height="430" fill="url(#a2-stripe)" />
        <text x="350" y="68" fontSize="16" fontWeight="800" fill={a2.shu} textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="2">{v.hall1}</text>
        <text x="350" y="84" fontSize="9" fill={a2.fgSoft} textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="1.5">ROUND TABLES + CENTER BOOTH STRIPS</text>
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={`cb-${i}`}>
            <rect x="334" y={108 + i * 64} width="32" height="50" fill={a2.shu} opacity="0.78" stroke={a2.fg} strokeWidth="1" />
            <text x="350" y={138 + i * 64} fontSize="8" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="monospace">B{i + 1}</text>
          </g>
        ))}
        {Array.from({ length: 4 }).map((_, r) => (
          [0, 1].map(c => {
            const cx = 220 + c * 50; const cy = 125 + r * 78;
            return (
              <g key={`tl-${r}-${c}`}>
                <circle cx={cx} cy={cy} r="18" fill={a2.bg} stroke={a2.fg} strokeWidth="1.4" />
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const a = (i / 6) * Math.PI * 2;
                  return <circle key={i} cx={cx + Math.cos(a) * 26} cy={cy + Math.sin(a) * 26} r="3.2" fill={a2.fg} />;
                })}
              </g>
            );
          })
        ))}
        {Array.from({ length: 4 }).map((_, r) => (
          [0, 1].map(c => {
            const cx = 432 + c * 50; const cy = 125 + r * 78;
            return (
              <g key={`tr-${r}-${c}`}>
                <circle cx={cx} cy={cy} r="18" fill={a2.bg} stroke={a2.fg} strokeWidth="1.4" />
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const a = (i / 6) * Math.PI * 2;
                  return <circle key={i} cx={cx + Math.cos(a) * 26} cy={cy + Math.sin(a) * 26} r="3.2" fill={a2.fg} />;
                })}
              </g>
            );
          })
        ))}
      </g>
      <g>
        <rect x="180" y="490" width="850" height="80" fill={a2.bg} stroke={a2.fg} strokeWidth="1.5" />
        <text x="220" y="520" fontSize="13" fontWeight="700" fill={a2.fg} fontFamily="system-ui, sans-serif">◆ {v.drink}</text>
        {[0, 1, 2, 3, 4].map(i => (
          <rect key={i} x={420 + i * 70} y="525" width="46" height="22" fill={a2.midori} stroke={a2.fg} strokeWidth="1" />
        ))}
        <rect x="780" y="525" width="80" height="22" fill={a2.ki} stroke={a2.fg} strokeWidth="1.5" />
        <text x="820" y="540" fontSize="11" fontWeight="800" fill={a2.fg} textAnchor="middle" fontFamily="system-ui, sans-serif">◆ {v.reception}</text>
      </g>
      <g>
        <rect x="970" y="490" width="60" height="80" fill={a2.bg} stroke={a2.fg} strokeWidth="2" />
        <path d="M 970 530 L 1030 530" stroke={a2.shu} strokeWidth="3" strokeDasharray="6 4" />
        <text x="1000" y="555" fontSize="9" fontWeight="700" fill={a2.fg} textAnchor="middle" fontFamily="system-ui, sans-serif">ENTRANCE</text>
      </g>
      <g>
        <rect x="60" y="500" width="500" height="200" fill={a2.bg} stroke={a2.fg} strokeWidth="2" />
        <rect x="60" y="500" width="500" height="200" fill="url(#a2-stripe-yellow)" />
        <text x="310" y="528" fontSize="15" fontWeight="800" fill={a2.ki} textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="2">◆ {v.party}　19:00 – 21:00</text>
        {Array.from({ length: 2 }).map((_, r) => (
          Array.from({ length: 5 }).map((_, c) => {
            const cx = 110 + c * 95; const cy = 580 + r * 70;
            return (
              <g key={`pt-${r}-${c}`}>
                <circle cx={cx} cy={cy} r="18" fill={a2.bg} stroke={a2.fg} strokeWidth="1.4" />
                <circle cx={cx} cy={cy} r="14" fill="none" stroke={a2.ki} strokeWidth="0.8" opacity="0.7" />
                <rect x={cx - 9} y={cy - 30} width="7" height="6" fill={a2.fg} />
                <rect x={cx + 2} y={cy - 30} width="7" height="6" fill={a2.fg} />
                <rect x={cx - 9} y={cy + 24} width="7" height="6" fill={a2.fg} />
                <rect x={cx + 2} y={cy + 24} width="7" height="6" fill={a2.fg} />
                <rect x={cx - 30} y={cy - 9} width="6" height="7" fill={a2.fg} />
                <rect x={cx - 30} y={cy + 2} width="6" height="7" fill={a2.fg} />
                <rect x={cx + 24} y={cy - 9} width="6" height="7" fill={a2.fg} />
                <rect x={cx + 24} y={cy + 2} width="6" height="7" fill={a2.fg} />
              </g>
            );
          })
        ))}
      </g>
      <g>
        <rect x="60" y="40" width="100" height="100" fill={a2.bg} stroke={a2.fg} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="110" y="78" fontSize="10" fontWeight="700" fill={a2.fg} textAnchor="middle" fontFamily="system-ui, sans-serif">{(v.green1 || '').split('（')[0]}</text>
        <text x="110" y="92" fontSize="9" fill={a2.fgSoft} textAnchor="middle" fontFamily="system-ui, sans-serif">GREEN</text>
        <text x="110" y="104" fontSize="9" fill={a2.fgSoft} textAnchor="middle" fontFamily="system-ui, sans-serif">ROOM ①</text>
      </g>
      <g>
        <rect x="60" y="160" width="100" height="160" fill={a2.bg} stroke={a2.fg} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="110" y="220" fontSize="10" fontWeight="700" fill={a2.fg} textAnchor="middle" fontFamily="system-ui, sans-serif">GREEN</text>
        <text x="110" y="234" fontSize="10" fontWeight="700" fill={a2.fg} textAnchor="middle" fontFamily="system-ui, sans-serif">ROOM ②/③</text>
      </g>
      <g>
        <rect x="540" y="80" width="490" height="22" fill={a2.fg} />
        <text x="785" y="96" fontSize="11" fontWeight="800" fill={a2.bg} textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="3">◆ {v.stage} ◆</text>
      </g>
      <g>
        <rect x="1050" y="500" width="100" height="60" fill={a2.bg} stroke={a2.fg} strokeWidth="1" strokeDasharray="3 3" />
        <text x="1100" y="528" fontSize="10" fontWeight="700" fill={a2.fgSoft} textAnchor="middle" fontFamily="system-ui, sans-serif">{v.smoking}</text>
        <circle cx="1100" cy="544" r="5" fill="none" stroke={a2.fgSoft} strokeWidth="1" />
        <line x1="1095" y1="544" x2="1108" y2="544" stroke={a2.fgSoft} strokeWidth="1" />
      </g>
      <text x="60" y="710" fontSize="11" fontWeight="700" fill={a2.fgSoft} fontFamily="monospace" letterSpacing="2">
        LAGUNA GARDEN HOTEL · GRAND HALL · SCALE 1:300 (REFERENCE ONLY)
      </text>
    </svg>
  );
}

// ─── お知らせ（動的） ───
function A2News({ t, content }) {
  const items = content.news || [];
  const loading = content._state === 'loading';
  const error = content._state === 'error';
  const unconfigured = content._state === 'unconfigured';
  const empty = content._state === 'ready' && items.length === 0;
  const [selected, setSelected] = React.useState(null);

  React.useEffect(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [selected]);

  const tagStyle = (tag) => {
    const map = {
      'イベント': { bg: a2.shu, fg: a2.bg, border: a2.shu },
      '重要':     { bg: a2.ki,  fg: a2.fg, border: a2.ki },
      '締切':     { bg: a2.momo, fg: a2.bg, border: a2.momo },
      '更新情報': { bg: 'transparent', fg: a2.ai, border: a2.ai },
      'お知らせ': { bg: 'transparent', fg: a2.fg, border: a2.fg },
      'EVENT':     { bg: a2.shu, fg: a2.bg, border: a2.shu },
      'IMPORTANT': { bg: a2.ki,  fg: a2.fg, border: a2.ki },
    };
    return map[tag] || { bg: 'transparent', fg: a2.fg, border: a2.fg };
  };

  return (
    <section style={{ padding: '90px 36px 60px', background: a2.bg }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span className="a2-shimmer-text" style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.32em', color: a2.shu, fontFamily: 'system-ui, sans-serif' }}>
              {t.news.enLabel}
            </span>
            <span style={{ width: 32, height: 1, background: a2.shu }} />
            <h2 style={{ fontSize: 32, margin: 0, fontWeight: 900, color: a2.fg, letterSpacing: '-0.01em' }}>
              {t.news.title}
            </h2>
          </div>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: `1px solid ${a2.border}` }}>
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <li key={i} style={{ display: 'grid', gridTemplateColumns: '120px 90px 1fr auto', gap: 20, padding: '18px 6px', borderBottom: `1px solid ${a2.border}`, alignItems: 'center' }}>
              <span className="a2-skel" style={{ height: 14 }} />
              <span className="a2-skel" style={{ height: 22 }} />
              <span className="a2-skel" style={{ height: 16 }} />
              <span style={{ width: 16 }} />
            </li>
          ))}
          {(error || unconfigured) && (
            <li style={{ padding: '20px 6px', color: a2.shu, fontSize: 12, fontFamily: 'system-ui, sans-serif', fontWeight: 700 }}>
              ⚠ {unconfigured ? 'Web App URL が未設定です' : 'コンテンツ取得に失敗しました。ブラウザコンソールを確認してください。'}
            </li>
          )}
          {empty && (
            <li style={{ padding: '40px 6px', textAlign: 'center', color: a2.fgSoft, fontSize: 14, fontFamily: 'system-ui, sans-serif' }}>
              {t.news.empty}
            </li>
          )}
          {items.map((n, i) => {
            const ts = tagStyle(n.tag);
            return (
              <li key={i}
                  className="a2-news-row"
                  onClick={() => setSelected(n)}
                  style={{
                    display: 'grid', gridTemplateColumns: '120px 90px 1fr auto', gap: 20,
                    padding: '18px 6px', borderBottom: `1px solid ${a2.border}`,
                    alignItems: 'center', transition: 'background .25s, transform .25s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${a2.shu}08`; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <span className="a2-news-date" style={{ fontFamily: 'monospace', fontSize: 13, color: a2.fgSoft, letterSpacing: '0.05em', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{n.date}</span>
                <span className="a2-news-tag" style={{
                  display: 'inline-block', textAlign: 'center',
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', padding: '5px 0',
                  color: ts.fg, background: ts.bg,
                  border: `1.5px solid ${ts.border}`,
                  fontFamily: 'system-ui, sans-serif',
                }}>{n.tag}</span>
                <span className="a2-news-title" style={{ fontSize: 15, fontWeight: 600, color: a2.fg, fontFamily: 'system-ui, sans-serif', lineHeight: 1.45 }}>{n.title}</span>
                <span className="a2-news-arrow" style={{ color: a2.shu, fontSize: 18, fontWeight: 700 }}>→</span>
              </li>
            );
          })}
        </ul>
      </div>
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(26, 22, 18, 0.65)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, animation: 'a2-fade-in .2s ease-out',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: a2.bg, maxWidth: 680, width: '100%', maxHeight: '85vh',
            overflow: 'auto', position: 'relative',
            boxShadow: `12px 12px 0 ${a2.fg}`, border: `2px solid ${a2.fg}`,
            animation: 'a2-scale-in .25s cubic-bezier(.2,.7,.3,1)',
          }}>
            <button onClick={() => setSelected(null)} aria-label="閉じる" style={{
              position: 'absolute', top: 14, right: 14,
              width: 36, height: 36, border: `1.5px solid ${a2.fg}`,
              background: a2.bg, color: a2.fg, fontSize: 18, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'system-ui, sans-serif', transition: 'all .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = a2.fg; e.currentTarget.style.color = a2.bg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = a2.bg; e.currentTarget.style.color = a2.fg; }}>×</button>
            <div style={{ padding: '40px 44px 44px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: a2.fgSoft, letterSpacing: '0.05em' }}>{selected.date}</span>
                {(() => { const ts = tagStyle(selected.tag); return (
                  <span style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', padding: '5px 12px',
                    color: ts.fg, background: ts.bg, border: `1.5px solid ${ts.border}`,
                    fontFamily: 'system-ui, sans-serif',
                  }}>{selected.tag}</span>
                ); })()}
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 900, color: a2.fg, margin: '0 0 20px', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                {selected.title}
              </h3>
              <div style={{
                fontSize: 15, lineHeight: 1.9, color: a2.fg,
                fontFamily: 'system-ui, sans-serif', whiteSpace: 'pre-wrap',
                paddingTop: 20, borderTop: `1px solid ${a2.border}`,
              }}>
                {selected.body || '（本文はありません）'}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Zoom 事前説明会（動的） ───
// 時刻範囲の区切り文字を「〜」に統一する
// 元データ: "12:00-13:00" "12:00∼13:00" "12:00~13:00" "12:00～13:00" などを
// すべて "12:00〜13:00" に正規化
function normalizeTimeRange(s) {
  if (!s) return '';
  return String(s)
    .replace(/[~∼〜～–—‐-―−]/g, '〜')
    .replace(/\s*-\s*/g, '〜')
    .replace(/〜+/g, '〜');
}

function A2Zoom({ t, content }) {
  const itemsRaw = content.zoom || [];
  // 時刻表記を統一
  const items = itemsRaw.map(it => ({ ...it, time: normalizeTimeRange(it.time) }));
  const loading = content._state === 'loading';
  const error = content._state === 'error';
  const empty = content._state === 'ready' && items.length === 0;
  return (
    <section style={{
      padding: '120px 36px',
      background: `linear-gradient(135deg, ${a2.ai} 0%, ${a2.ai}ee 60%, ${a2.fg} 100%)`,
      color: a2.bg, position: 'relative', overflow: 'hidden',
    }}>
      <div className="a2-rotate-slow" style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, border: `1px dashed ${a2.bg}55`, borderRadius: '50%' }} />
      <div className="a2-float" style={{ position: 'absolute', bottom: 60, left: 60, opacity: 0.15 }}>
        <Bubble color={a2.bg} size={60} />
      </div>
      <div className="a2-float-2" style={{ position: 'absolute', top: 120, right: 200, opacity: 0.12 }}>
        <Bubble color={a2.bg} size={40} />
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.3em', color: a2.ki, fontFamily: 'system-ui, sans-serif' }}>
            ◆ {t.zoom.enLabel}
          </span>
        </div>
        <h2 style={{ fontSize: 56, margin: '0 0 18px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {t.zoom.title}
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.85, maxWidth: 640, marginBottom: 48, fontFamily: 'system-ui, sans-serif' }}>
          {t.zoom.lead}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48 }}>
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="a2-skel" style={{ height: 160, opacity: 0.3 }} />
          ))}
          {error && (
            <div style={{ gridColumn: '1 / -1', padding: '20px', background: `${a2.ki}15`, border: `1.5px solid ${a2.ki}`, color: a2.fg, fontSize: 13, fontWeight: 700, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
              ⚠ Zoom 説明会情報が取得できません
            </div>
          )}
          {empty && !error && (
            <div style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center', opacity: 0.7, fontSize: 14, fontFamily: 'system-ui, sans-serif' }}>
              {t.zoom.empty}
            </div>
          )}
          {items.map((it, i) => {
            const card = (
              <div style={{
                background: `${a2.bg}08`, border: `1px solid ${a2.bg}33`, backdropFilter: 'blur(8px)',
                padding: '24px 22px', transition: 'transform .3s, background .3s, box-shadow .3s', cursor: it.url ? 'pointer' : 'default', height: '100%',
              }}
              onMouseEnter={(e) => { if (it.url) { e.currentTarget.style.transform = 'translate(-4px,-4px)'; e.currentTarget.style.background = a2.bg; e.currentTarget.style.color = a2.fg; e.currentTarget.style.boxShadow = `6px 6px 0 ${a2.ki}`; } }}
              onMouseLeave={(e) => { if (it.url) { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.background = `${a2.bg}08`; e.currentTarget.style.color = 'inherit'; e.currentTarget.style.boxShadow = 'none'; } }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', fontFamily: 'system-ui, sans-serif' }}>
                  <span style={{ width: 8, height: 8, background: a2.ki, borderRadius: '50%' }} />
                  SESSION {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.01em' }}>{it.date}</div>
                <div style={{ fontSize: 15, fontWeight: 700, opacity: 0.9, marginBottom: 14, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{it.time}</div>
                <div style={{ fontSize: 13, opacity: 0.7, fontFamily: 'system-ui, sans-serif' }}>{it.host}</div>
              </div>
            );
            return it.url
              ? <a key={i} href={it.url} target="_blank" rel="noopener" style={{ textDecoration: 'none', color: 'inherit' }}>{card}</a>
              : <div key={i}>{card}</div>;
          })}
        </div>
        {items.length > 0 && items[0].url && (
          <a href={items[0].url} target="_blank" rel="noopener" style={{
            display: 'inline-flex', alignItems: 'center', gap: 14,
            background: a2.ki, color: a2.fg,
            padding: '20px 40px', fontSize: 16, fontWeight: 900,
            letterSpacing: '0.05em', textDecoration: 'none',
            boxShadow: `6px 6px 0 ${a2.bg}`,
            fontFamily: 'system-ui, sans-serif',
            transition: 'transform .25s, box-shadow .25s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-3px,-3px)'; e.currentTarget.style.boxShadow = `9px 9px 0 ${a2.bg}`; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `6px 6px 0 ${a2.bg}`; }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="13" height="12" rx="2" fill={a2.fg} />
              <path d="M15 10 L22 6 V18 L15 14 Z" fill={a2.fg} />
            </svg>
            {t.zoom.cta} →
          </a>
        )}
      </div>
    </section>
  );
}

// ─── 飲食店（軽量：説明＋導線） ───
function A2Restaurants({ t, content }) {
  // BNI沖縄公式サイトへの遷移用CTAのみ（カードリスト表示は廃止）
  const ctaUrl = (content && content.settings && content.settings.restaurants_url)
    || (window.CONFIG && window.CONFIG.RESTAURANTS_FALLBACK_URL)
    || 'https://bniokinawa.com/';
  const blurb = (content && content.settings && content.settings.restaurants_blurb) || t.restaurants.lead;
  return (
    <section style={{ padding: '100px 36px', background: a2.bg, position: 'relative', overflow: 'hidden' }}>
      <div className="a2-float" style={{ position: 'absolute', top: 50, right: 80, opacity: 0.4 }}>
        <PalmLeaf color={a2.midori} size={100} />
      </div>
      <div className="a2-float-2" style={{ position: 'absolute', bottom: 50, left: 60, opacity: 0.35 }}>
        <PalmLeaf color={a2.midori} size={70} />
      </div>
      <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        <div className="a2-reveal" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.32em', color: a2.midori, fontFamily: 'system-ui, sans-serif', marginBottom: 14 }}>
          ◆ {t.restaurants.enLabel} ◆
        </div>
        <h2 className="a2-reveal" style={{ fontSize: 40, fontWeight: 900, margin: '0 0 22px', color: a2.fg, letterSpacing: '-0.015em', animationDelay: '.05s' }}>
          {t.restaurants.title}
        </h2>
        <p className="a2-reveal" style={{ fontSize: 16, color: a2.fgSoft, lineHeight: 1.9, margin: '0 auto 36px', maxWidth: 640, fontFamily: 'system-ui, sans-serif', animationDelay: '.1s' }}>
          {blurb}
        </p>
        <a className="a2-reveal-scale a2-btn-shu" href={ctaUrl} target="_blank" rel="noopener" style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          background: a2.midori, color: a2.bg,
          padding: '18px 40px', fontSize: 15, fontWeight: 800,
          letterSpacing: '0.08em', textDecoration: 'none',
          boxShadow: `6px 6px 0 ${a2.fg}`,
          fontFamily: 'system-ui, sans-serif',
        }}>{t.restaurants.cta} ↗</a>
      </div>
    </section>
  );
}

// ─── お問い合わせ ───
function A2Contact({ t }) {
  const LINE_URL = 'https://line.me/R/ti/p/@744geuzz';
  const labels = {
    en: { enLabel: 'CONTACT', title: 'Contact Us', lead: 'Feel free to reach out via BFO Official LINE for any questions about the event.', btn: 'Contact via LINE ↗' },
    ja: { enLabel: 'CONTACT', title: 'お問い合わせ', lead: 'イベントに関するご不明点・ご相談は、BFO公式LINEよりお気軽にご連絡ください。', btn: 'LINE で問い合わせる ↗' },
    zh: { enLabel: 'CONTACT', title: '聯絡我們', lead: '如有任何關於活動的疑問，請透過 BFO 官方 LINE 聯絡我們。', btn: '透過 LINE 聯絡 ↗' },
    ko: { enLabel: 'CONTACT', title: '문의하기', lead: '이벤트에 관한 문의는 BFO 공식 LINE 으로 편하게 연락해 주세요。', btn: 'LINE 으로 문의하기 ↗' },
  };
  // t からどの言語か推定できないため t.nav.about で判定（ fallback: ja）
  const lang = t && t.nav && t.nav.about === 'About the Event' ? 'en'
    : t && t.nav && t.nav.about === '이벤트 소개' ? 'ko'
    : t && t.nav && t.nav.about === '活動介紹' ? 'zh'
    : 'ja';
  const L = labels[lang] || labels.ja;

  return (
    <section id="contact" style={{ padding: '100px 36px', background: a2.bgSoft, position: 'relative', overflow: 'hidden', scrollMarginTop: 80 }}>
      <div className="a2-float" style={{ position: 'absolute', top: 40, left: -40, opacity: 0.3 }}>
        <Hibiscus color={a2.ai} size={180} />
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        <div className="a2-reveal" style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.32em', color: a2.ai, fontFamily: 'system-ui, sans-serif', marginBottom: 14 }}>
          ◆ {L.enLabel} ◆
        </div>
        <h2 className="a2-reveal" style={{ fontSize: 40, fontWeight: 900, margin: '0 0 22px', color: a2.fg, letterSpacing: '-0.015em', animationDelay: '.05s' }}>
          {L.title}
        </h2>
        <p className="a2-reveal" style={{ fontSize: 16, color: a2.fgSoft, lineHeight: 1.9, margin: '0 auto 36px', maxWidth: 560, fontFamily: 'system-ui, sans-serif', animationDelay: '.1s' }}>
          {L.lead}
        </p>
        {/* LINE CTA */}
        <a className="a2-reveal-scale" href={LINE_URL} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 14,
            background: '#06C755', color: '#ffffff',
            padding: '18px 44px', fontSize: 15, fontWeight: 800,
            letterSpacing: '0.06em', textDecoration: 'none',
            boxShadow: `6px 6px 0 ${a2.fg}`,
            fontFamily: 'system-ui, sans-serif',
            transition: 'transform .2s, box-shadow .2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-3px,-3px)'; e.currentTarget.style.boxShadow = `9px 9px 0 ${a2.fg}`; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `6px 6px 0 ${a2.fg}`; }}>
          <img src="assets/BFOOFLINE.png" alt="LINE" style={{ height: 22, display: 'block' }} />
          {L.btn}
        </a>
        <div className="a2-reveal" style={{ marginTop: 20, fontSize: 12, color: a2.fgSoft, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.05em', animationDelay: '.2s' }}>
          @744geuzz
        </div>
      </div>
    </section>
  );
}

window.VariantA2 = VariantA2;

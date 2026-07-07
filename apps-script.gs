/**
 * BFO2026 — Sheets Web App
 * ─────────────────────────────────────────────────────────────
 * 1つのエンドポイントで以下を担う：
 *   GET  ?action=content&lang=ja|en|zh|ko   → サイト表示用コンテンツ
 *   POST {action:"register", ...}           → 申込み登録
 *   POST {action:"checkin", participant_id} → 受付チェックイン
 *   POST {action:"party_checkin", ...}      → 懇親会チェックイン
 *   POST {action:"lookup", participant_id}  → 参加者情報照会
 *
 * 多言語対応：日本語列を LanguageApp.translate() で en/zh/ko に自動翻訳。
 * 翻訳結果は CacheService に6時間キャッシュ（API rate limit 対策）。
 *
 * セットアップ：
 *   1. このスクリプトをスプレッドシートに紐付け（拡張機能 → Apps Script）
 *   2. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *   3. 実行ユーザー：自分 / アクセス：全員
 *   4. 発行された URL を site/src/config.jsx の WEB_APP_URL に貼る
 * ─────────────────────────────────────────────────────────────
 */

// シート（タブ）名は日本語で統一。setup-spreadsheet.gs と必ず合わせること。
const TAB_PARTICIPANTS = '参加者';
const TAB_NEWS         = 'お知らせ';
const TAB_ZOOM         = '事前Zoom';
const TAB_EXHIBITORS   = '出展企業';
const TAB_SETTINGS     = 'サイト設定';
const TAB_SETTINGS_ALT = '設定';   // ユーザーが追加した別タブ（決済URL等）
const TAB_CHAPTERS     = 'チャプター';
const TAB_SITE_CONTENT = 'サイトコンテンツ';
const TAB_SCHEDULE     = 'タイムテーブル';
const TAB_MARQUEE      = 'マーキー';
// ※ 飲食店・会場ゾーン タブは廃止（公開ページでは CTA ボタンのみ表示）

// 参加者シートの列マッピング（内部キー ↔ 日本語ヘッダー）
// register.html はフォーム送信で英語キー（first_name 等）を使うため、
// このマップを介して日本語ヘッダーと相互変換する。
const PARTICIPANT_COLS = {
  participant_id:        '参加者ID',
  registered_at:         '登録日時',
  last_name:             '姓',
  first_name:            '名',
  display_name:          '表示名',
  company_name:          '会社名',
  business_type:         '業種',
  email:                 'メール',
  ticket_type:           'チケット種別',
  bni_region:            'リージョン',
  bni_chapter:           'チャプター',
  invited_by:            '紹介者',
  party_registered:      '懇親会参加',
  party_payment_status:  '懇親会決済状態',
  notes:                 '備考',
  checked_in:            'チェックイン',
  checked_in_at:         'チェックイン日時',
  party_checked_in:      '懇親会チェックイン',
  party_checked_in_at:   '懇親会チェックイン日時',
  eve_party_registered:      '前夜祭参加',
  eve_party_payment_status:  '前夜祭決済状態',
  eve_party_checked_in:      '前夜祭チェックイン',
  eve_party_checked_in_at:   '前夜祭チェックイン日時',
};

// 列ヘッダーの別名（旧表記・表記ゆれ）→ 内部キー の対応。
// 既存スプレッドシートのヘッダーが PARTICIPANT_COLS と異なる場合の救済。
// 例: シートが「懇親会申込」、コードは「懇親会参加」を期待 → 別名でマッチさせる。
const PARTICIPANT_COL_ALIASES = {
  '懇親会申込':   'party_registered',
  '懇親会参加':   'party_registered',
  '前夜祭申込':   'eve_party_registered',
};

// 日本語ヘッダーまたは英語ヘッダーで列インデックスを取得（後方互換）
function findCol_(headers, internalKey) {
  const ja = PARTICIPANT_COLS[internalKey];
  if (ja) {
    const idx = headers.indexOf(ja);
    if (idx >= 0) return idx;
  }
  // 別名ヘッダーでも探す
  for (const alias in PARTICIPANT_COL_ALIASES) {
    if (PARTICIPANT_COL_ALIASES[alias] === internalKey) {
      const idx = headers.indexOf(alias);
      if (idx >= 0) return idx;
    }
  }
  return headers.indexOf(internalKey);
}

// 任意のヘッダー文字列を内部キー（英語）に正規化
function headerToInternal_(header) {
  for (const internal in PARTICIPANT_COLS) {
    if (header === PARTICIPANT_COLS[internal] || header === internal) return internal;
  }
  // 別名ヘッダー対応
  if (PARTICIPANT_COL_ALIASES[header]) return PARTICIPANT_COL_ALIASES[header];
  return header;
}

// 行オブジェクトから複数の候補キーで値を取得（日本語/英語フォールバック）
function pick_(row, ...keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '' && row[k] !== null) return row[k];
  }
  return '';
}

// 公開列の判定（"公開" / TRUE / "TRUE" を公開とみなす）
function isPublished(v) {
  if (v === true) return true;
  const s = String(v).trim().toLowerCase();
  return s === '公開' || s === 'true' || s === '1' || s === 'yes';
}

// ─── 自動キャッシュクリア（編集時即時反映）────────────────────
// スプレッドシートのセルを編集した瞬間にコンテンツキャッシュを削除。
// これにより、シートの変更が次のページロード時に即時反映される。
// ※ Apps Script の "シンプルトリガー" として自動実行（インストール不要）
function onEdit(e) {
  try {
    CacheService.getScriptCache().removeAll([
      'content:ja', 'content:en', 'content:zh', 'content:ko',
      'chapters',
    ]);
  } catch (_) {
    // キャッシュクリア失敗時は無視（次の 5 分後に自然消滅）
  }
}

// ─── エントリポイント ────────────────────────────────────────

function doGet(e) {
  const action = (e.parameter.action || 'content').toLowerCase();
  const lang = (e.parameter.lang || 'ja').toLowerCase();
  try {
    if (action === 'content')  return jsonOut(getContent(lang));
    if (action === 'chapters') return jsonOut(getChapters());
    if (action === 'lookup')   return jsonOut(lookup(e.parameter.participant_id));
    if (action === 'stats')    return jsonOut(getStats());
    return jsonOut({ ok: false, error: 'unknown action' });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err && err.message || err) });
  }
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (_) {}
  const action = String(body.action || '').toLowerCase();
  try {
    if (action === 'register')          return jsonOut(register(body));
    if (action === 'checkin')           return jsonOut(checkin(body.participant_id));
    if (action === 'party_checkin')     return jsonOut(partyCheckin(body.participant_id));
    if (action === 'eve_party_checkin') return jsonOut(evePartyCheckin(body.participant_id));
    if (action === 'lookup')            return jsonOut(lookup(body.participant_id));
    if (action === 'mark_party_intent') return jsonOut(markPartyIntent(body));
    return jsonOut({ ok: false, error: 'unknown action' });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err && err.message || err) });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── コンテンツ取得 (GET ?action=content) ─────────────────────

function getContent(lang) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `content:${lang}`;
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const news       = readTabAsObjects(ss, TAB_NEWS);
  const zoom       = readTabAsObjects(ss, TAB_ZOOM);
  const exhibitors = readTabAsObjects(ss, TAB_EXHIBITORS);
  const settings   = readSettings(ss);

  // 全セクション動的化のための新規コンテンツ
  const text     = readSiteContent_(ss, lang);
  const schedule = readSchedule_(ss, lang);
  const marquee  = readMarquee_(ss);

  const result = {
    ok: true,
    lang: lang,
    generatedAt: new Date().toISOString(),
    // ─ 全セクションの文言（key-value）─
    text: text,
    // ─ メタ情報（HTMLタイトル等）─
    meta: text.meta || {},
    // ─ リスト形式 ─
    news: news
      .filter(r => isPublished(r['公開']))
      .map(r => ({
        date:  formatDate(r['日付']),
        tag:   String(r['タグ'] || 'お知らせ').trim(),
        title: tr(r['タイトル'], lang),
        body:  tr(r['本文'], lang),
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1)), // 新しい順
    zoom: zoom
      .filter(r => isPublished(r['公開']))
      .map(r => ({
        date: tr(formatZoomDate(r['日付']), lang),
        time: String(r['時間'] || ''),
        host: tr(r['ホスト'], lang),
        url:  String(r['URL'] || ''),
      })),
    exhibitors: exhibitors
      .filter(r => isPublished(r['公開']))
      .map(r => {
        const boothRaw = String(r['ブースNo'] || r['ブースナンバー'] || r['ブース番号'] || '');
        // ブースNoの先頭にある数値を取得（"14・15" → 14, "01" → 1）
        const boothNum = parseInt(boothRaw.replace(/[^\d].*$/, ''), 10) || 9999;
        const orderRaw = Number(r['並び順']);
        // ブース数（スプレッドシートの自動式の結果を優先。空ならブースNoから推定）
        const boothCountRaw = Number(r['ブース数']);
        const boothCount = (!isNaN(boothCountRaw) && boothCountRaw > 0) ? boothCountRaw
          : (boothRaw ? boothRaw.split(/[・,\/、\s]+/).filter(s => s.trim()).length || 1 : 1);
        // 共同出展（同じ屋号の場合 React 側でグループ化に使う）
        const coExhibitors = [];
        const co1Name = String(r['共同1_社名'] || '').trim();
        if (co1Name) {
          coExhibitors.push({
            name:     co1Name,
            category: String(r['共同1_カテゴリ'] || '').trim(),
            url:      String(r['共同1_URL'] || '').trim(),
          });
        }
        const co2Name = String(r['共同2_社名'] || '').trim();
        if (co2Name) {
          coExhibitors.push({
            name:     co2Name,
            category: String(r['共同2_カテゴリ'] || '').trim(),
            url:      String(r['共同2_URL'] || '').trim(),
          });
        }
        return {
          name:        String(r['社名'] || ''),
          category:    String(r['カテゴリ'] || ''),
          url:         String(r['URL'] || r['ウェブサイト'] || r['HP'] || ''),
          booth_no:    boothRaw,
          booth_num:   boothNum,           // ソート用数値
          booth_count: boothCount,         // 1ブースか複数か（合計算出用）
          // ── 拡張フィールド（空欄なら従来表示にフォールバック） ──
          // 列名は「ブース名」または「屋号」のどちらでも可（後方互換）
          booth_name:   String(r['ブース名'] || r['屋号'] || '').trim(),
          catch_copy:   String(r['キャッチコピー'] || '').trim(),
          co_exhibitors: coExhibitors,
          order:        isNaN(orderRaw) ? boothNum : orderRaw,
        };
      })
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.booth_num - b.booth_num;
      }),
    schedule: schedule,
    marquee:  marquee,
    settings: {
      restaurants_url:     String(settings['restaurants_url'] || settings['飲食店リンク先URL'] || ''),
      restaurants_blurb:   tr(settings['restaurants_blurb'] || settings['飲食店説明文'] || '', lang),
      video_url:           String(settings['video_url'] || ''),
      // 懇親会決済 URL（EventPay 等の外部決済サービス）— 申込み完了画面で利用
      party_payment_url:   String(settings['party_payment_url'] || settings['懇親会決済URL'] || ''),
      // 決済ボタン上に表示する名称（例：「BFO2026 懇親会 事前決済」）
      party_payment_label: tr(settings['party_payment_label'] || settings['懇親会決済名'] || '', lang),
      // 前夜祭の決済情報（EventPay）
      eve_party_payment_url:   String(settings['eve_party_payment_url']   || settings['前夜祭決済URL']  || ''),
      eve_party_payment_label: tr(settings['eve_party_payment_label'] || settings['前夜祭決済名'] || '', lang),
    },
  };

  cache.put(cacheKey, JSON.stringify(result), 60); // 60秒（onEdit が失敗しても最大1分で自動更新）
  return result;
}

// ─── サイトコンテンツ（全セクションの key-value）読み込み ───
// 戻り値: { hero: { tag, title, ... }, event: { ... }, ... }
// 列名は日本語（セクション/キー/日本語の値）と英語（section/key/value_ja）の両方に対応
function readSiteContent_(ss, lang) {
  const rows = readTabAsObjects(ss, TAB_SITE_CONTENT);
  const out = {};
  rows.forEach(r => {
    const section = String(pick_(r, 'セクション', 'section')).trim();
    const key     = String(pick_(r, 'キー', 'key')).trim();
    const value   = pick_(r, '日本語の値', 'value_ja');
    if (!section || !key) return;
    if (!out[section]) out[section] = {};
    out[section][key] = tr(value, lang);
  });
  return out;
}

// ─── Schedule（タイムテーブル）読み込み ──────────────────────
function readSchedule_(ss, lang) {
  const rows = readTabAsObjects(ss, TAB_SCHEDULE);
  return rows
    .filter(r => isPublished(r['公開']))
    .map(r => ({
      time:      formatTimeCell_(r['時間']),
      title:     tr(r['タイトル'], lang),
      desc:      tr(r['説明'], lang),
      highlight: !!r['強調'],
      order:     Number(r['並び順'] || 999),
    }))
    .sort((a, b) => a.order - b.order);
}

// 時刻セルをフォーマット
// "07:00" 文字列 → そのまま / Date オブジェクト → "HH:MM" / 数値（Sheets内部時刻）→ "HH:MM"
function formatTimeCell_(v) {
  if (v === null || v === undefined || v === '') return '';
  if (v instanceof Date) {
    const hh = String(v.getHours()).padStart(2, '0');
    const mm = String(v.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return String(v);
}

// ─── Marquee（流れるテキスト）読み込み ───────────────────────
function readMarquee_(ss) {
  const rows = readTabAsObjects(ss, TAB_MARQUEE);
  return rows
    .filter(r => isPublished(r['公開']))
    .sort((a, b) => Number(a['並び順'] || 999) - Number(b['並び順'] || 999))
    .map(r => String(r['テキスト'] || ''));
}

// ─── 飲食店・会場ゾーン は廃止（2025-05 以降 CTA ボタンのみ表示）─
// readRestaurants_ / readVenueZones_ は削除済み

// 任意のテキストを目的の言語に翻訳（日本語入力前提）
function tr(text, lang) {
  if (!text) return '';
  const s = String(text);
  if (lang === 'ja') return s;
  const cache = CacheService.getScriptCache();
  const key = `tr:${lang}:${md5(s)}`;
  const cached = cache.get(key);
  if (cached !== null) return cached;
  try {
    const out = LanguageApp.translate(s, 'ja', lang === 'zh' ? 'zh-TW' : lang);
    cache.put(key, out, 21600); // 6時間
    return out;
  } catch (_) {
    return s; // 失敗時は原文
  }
}

function md5(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, s)
    .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
    .join('');
}

// ─── リージョン/チャプター一覧 (action=chapters) ──────────────

function getChapters() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('chapters');
  if (cached) return JSON.parse(cached);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TAB_CHAPTERS);
  if (!sh) return { ok: false, error: 'Chapters タブが見つかりません', regions: [] };

  const last = sh.getLastRow();
  if (last < 2) return { ok: true, regions: [] };
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const regionCol = Math.max(0, headers.indexOf('リージョン'));
  const chapterCol = Math.max(1, headers.indexOf('チャプター名'));
  const data = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();

  const map = new Map();
  data.forEach(row => {
    const region = String(row[regionCol] || '').trim();
    const chapter = String(row[chapterCol] || '').trim();
    if (!region || !chapter) return;
    if (!map.has(region)) map.set(region, []);
    map.get(region).push(chapter);
  });
  const regions = Array.from(map.entries()).map(([name, chapters]) => ({ name, chapters }));

  const result = { ok: true, regions };
  cache.put('chapters', JSON.stringify(result), 3600); // 1時間
  return result;
}

// ─── 申込み (POST action=register) ────────────────────────────

function register(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TAB_PARTICIPANTS);
  if (!sh) throw new Error('参加者 タブが見つかりません');

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const idCol = findCol_(headers, 'participant_id');
  if (idCol < 0) throw new Error('参加者ID 列が見つかりません');

  // 次の participant_id を採番（最大番号+1）
  const ids = sh.getRange(2, idCol + 1, Math.max(1, sh.getLastRow() - 1), 1).getValues().flat();
  let maxN = 0;
  ids.forEach(id => {
    const m = String(id || '').match(/^BFO2026-(\d+)$/);
    if (m) maxN = Math.max(maxN, Number(m[1]));
  });
  const newId = `BFO2026-${String(maxN + 1).padStart(3, '0')}`;

  // ヘッダーを内部キーに正規化してから値をマップ（日本語/英語両対応）
  const row = headers.map(h => {
    const key = headerToInternal_(h);
    switch (key) {
      case 'participant_id':       return newId;
      case 'first_name':           return body.first_name || '';
      case 'last_name':            return body.last_name || '';
      case 'display_name':         return body.display_name || `${body.last_name || ''}${body.first_name || ''}`;
      case 'company_name':         return body.company_name || '';
      case 'business_type':        return body.business_type || '';
      case 'email':                return body.email || '';
      case 'ticket_type':          return body.ticket_type || '';
      case 'bni_region':           return body.bni_region || '';
      case 'bni_chapter':          return body.bni_chapter || '';
      case 'invited_by':           return body.invited_by || '';
      case 'registered_at':        return new Date();
      case 'checked_in':           return '未';
      case 'notes':                return body.notes || '';
      case 'party_registered':     return body.party_registered ? '済' : '未';
      // 決済状態：申込み済 →「未確認」（EventPayでの決済可否は別途確認が必要なため）
      //           申込みなし →「申込なし」
      case 'party_payment_status': return body.party_registered ? '未確認' : '申込なし';
      case 'eve_party_registered':     return body.eve_party_registered ? '済' : '未';
      case 'eve_party_payment_status': return body.eve_party_registered ? '未確認' : '申込なし';
      case 'eve_party_checked_in':     return '未';
      default:                     return '';
    }
  });
  sh.appendRow(row);

  // メール送信
  const email = body.email || '';
  const displayNameIdx = findCol_(headers, 'display_name');
  const displayName = displayNameIdx >= 0 ? row[displayNameIdx] : '';
  if (email) {
    try {
      sendQREmail(email, newId, displayName);
    } catch (err) {
      Logger.log('メール送信エラー: ' + err);
    }
  }

  return { ok: true, participant_id: newId, display_name: displayName };
}

// QRコード付きメール送信（HTML + 添付画像）
// MailApp で送信 / replyTo は info@search-mania.net
function sendQREmail(recipientEmail, participantId, displayName) {
  const subject = `【BFO2026】事前申込み完了 - ${participantId}`;

  // QRコード画像を外部APIから取得して添付
  let qrBlob = null;
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(participantId)}`;
    const response = UrlFetchApp.fetch(qrUrl, { muteHttpExceptions: true });
    if (response.getResponseCode() === 200) {
      qrBlob = response.getBlob().setName(`${participantId}.png`);
    }
  } catch (err) {
    Logger.log('QR画像取得エラー: ' + err);
  }

  // プレーンテキスト本文（メーラー非対応時のフォールバック）
  const plainBody = `
${displayName}さん

Business Fusion Okinawa 2026 への事前申込みが完了いたしました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
参加者ID： ${participantId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

当日受付では、以下のいずれかの方法でチェックインしてください：
1. 添付QRコード画像を受付スタッフに提示
2. 上記の参加者IDをご提示

【イベント開催情報】
開催日時： 2026年7月7日（火）10:00開場
開催場所： ラグナガーデンホテル
住　所： 〒901-2227 沖縄県宜野湾市大山7-17-1

────────────────────────
※ このメールは送信専用です。
ご返信いただいてもお応えできません。
お問い合わせは BFO公式LINE（@744geuzz）へお気軽にご連絡ください。
LINE: https://line.me/R/ti/p/@744geuzz
────────────────────────

Business Fusion Okinawa 2026 運営事務局
`.trim();

  // HTML本文（QR画像をインライン表示）
  const htmlBody = `
<!doctype html>
<html lang="ja">
<body style="margin:0;padding:0;background:#fbf6ec;font-family:'Hiragino Sans','Yu Gothic',sans-serif;color:#1a1612;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:40px 32px;border-top:6px solid #d63b2c;">
    <div style="font-size:11px;font-weight:bold;letter-spacing:0.2em;color:#d63b2c;margin-bottom:8px;">
      ◆ BUSINESS FUSION OKINAWA 2026
    </div>
    <h1 style="font-size:22px;margin:0 0 24px;color:#1a1612;letter-spacing:-0.01em;">
      事前申込み完了のお知らせ
    </h1>
    <p style="font-size:15px;line-height:1.8;margin:0 0 24px;">
      ${escapeHtmlAS_(displayName)} さん<br/><br/>
      この度は <strong>Business Fusion Okinawa 2026</strong> への<br/>
      事前申込みをいただき、誠にありがとうございます。
    </p>
    <div style="background:#fbf6ec;border:2px solid #1a1612;padding:24px;text-align:center;margin:0 0 24px;">
      <div style="font-size:11px;font-weight:bold;letter-spacing:0.18em;color:#5a4a3a;margin-bottom:8px;">
        ◆ 参加者ID
      </div>
      <div style="font-size:28px;font-weight:900;letter-spacing:0.05em;color:#1a1612;font-family:'JetBrains Mono',Consolas,monospace;">
        ${escapeHtmlAS_(participantId)}
      </div>
    </div>
    ${qrBlob ? `
    <div style="text-align:center;padding:16px;background:#fbf6ec;border:1px solid #d0d0d0;margin:0 0 24px;">
      <div style="font-size:11px;font-weight:bold;letter-spacing:0.18em;color:#5a4a3a;margin-bottom:12px;">
        ◆ 当日受付用 QRコード
      </div>
      <img src="cid:qrcode" alt="QR" width="240" height="240" style="display:block;margin:0 auto;border:1px solid #ddd;background:#fff;" />
      <div style="font-size:11px;color:#5a4a3a;margin-top:10px;line-height:1.6;">
        当日受付でこのQRコードをスタッフにご提示ください。<br/>
        添付ファイルとしても保存できます。
      </div>
    </div>
    ` : ''}
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e0e0e0;color:#5a4a3a;width:90px;font-size:11px;font-weight:bold;letter-spacing:0.1em;">DATE</td>
        <td style="padding:10px 0;border-bottom:1px solid #e0e0e0;">2026年7月7日（火） 10:00開場</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e0e0e0;color:#5a4a3a;font-size:11px;font-weight:bold;letter-spacing:0.1em;">VENUE</td>
        <td style="padding:10px 0;border-bottom:1px solid #e0e0e0;">ラグナガーデンホテル</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#5a4a3a;font-size:11px;font-weight:bold;letter-spacing:0.1em;">ADDRESS</td>
        <td style="padding:10px 0;">〒901-2227 沖縄県宜野湾市大山7-17-1</td>
      </tr>
    </table>
    <div style="background:#fff8e6;border-left:4px solid #f0b429;padding:14px 18px;font-size:12px;line-height:1.7;color:#5a4a3a;margin:0 0 24px;">
      <strong style="color:#1a1612;">※ このメールは送信専用です。</strong><br/>
      ご返信いただいてもお応えできません。<br/>
      お問い合わせは <a href="https://line.me/R/ti/p/@744geuzz" style="color:#1e5a82;font-weight:bold;">BFO公式LINE</a> へお気軽にご連絡ください。
    </div>
    <div style="border-top:1px solid #e0e0e0;padding-top:16px;font-size:11px;color:#5a4a3a;text-align:center;">
      Business Fusion Okinawa 2026 運営事務局<br/>
      Produced by BNI沖縄リージョン
    </div>
  </div>
</body>
</html>
`.trim();

  // MailApp を使用（GmailApp + from エイリアスは未登録だと無音エラーになるため）
  // 送信元: スクリプトオーナーのアカウント / 表示名: Business Fusion Okinawa 2026
  const options = {
    name: 'Business Fusion Okinawa 2026',
    replyTo: 'info@search-mania.net',
    htmlBody: htmlBody,
  };

  // QR画像が取得できた場合は添付＋インラインCID参照
  if (qrBlob) {
    options.attachments = [qrBlob];
    options.inlineImages = { qrcode: qrBlob };
  }

  MailApp.sendEmail(recipientEmail, subject, plainBody, options);
}

// HTMLエスケープ（apps-script内部用）
function escapeHtmlAS_(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── チェックイン (POST action=checkin) ───────────────────────

function checkin(participantId) {
  return markCheckin(participantId, 'checked_in', 'checked_in_at');
}

function partyCheckin(participantId) {
  return markCheckin(participantId, 'party_checked_in', 'party_checked_in_at');
}

function evePartyCheckin(participantId) {
  return markCheckin(participantId, 'eve_party_checked_in', 'eve_party_checked_in_at');
}

// 参加者IDを正規化（サーバー側で防御的にクリーンアップ）
// クライアント側が古い/壊れたデータを送ってきても救う
function normalizeParticipantId_(raw) {
  if (raw == null) return '';
  var s = String(raw);
  // ゼロ幅文字/BOM を除去
  s = s.replace(/[​-‍﻿]/g, '');
  // 前後の空白・改行・タブを除去
  s = s.trim();
  // 全角ハイフン系（－ ‐ ‑ ‒ – — ―）を半角 - に統一
  s = s.replace(/[‐-―－]/g, '-');
  // 内部の空白を除去（ID内に空白は入らない前提）
  s = s.replace(/\s+/g, '');
  // 大文字化（BFO2026 プレフィックスを正規化）
  s = s.toUpperCase();
  return s;
}

function markCheckin(participantId, statusCol, atCol) {
  if (!participantId) throw new Error('participant_id が必要です');
  var pid = normalizeParticipantId_(participantId);
  if (!pid) throw new Error('participant_id が必要です');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TAB_PARTICIPANTS);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  // 内部キー（英語）から日本語/英語ヘッダーを検索
  const idCol = findCol_(headers, 'participant_id');
  const stCol = findCol_(headers, statusCol);
  const tsCol = findCol_(headers, atCol);
  const nameCol = findCol_(headers, 'display_name');
  if (idCol < 0 || stCol < 0 || tsCol < 0) throw new Error('必要な列が不足しています');

  const last = sh.getLastRow();
  const ids = sh.getRange(2, idCol + 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    // シート側の値も同じ正規化を通す（表記ゆれ吸収）
    if (normalizeParticipantId_(ids[i][0]) === pid) {
      const rowNum = i + 2;
      const cur = sh.getRange(rowNum, stCol + 1).getValue();
      const already = String(cur).trim() === '済';
      sh.getRange(rowNum, stCol + 1).setValue('済');
      sh.getRange(rowNum, tsCol + 1).setValue(new Date());
      const name = nameCol >= 0 ? sh.getRange(rowNum, nameCol + 1).getValue() : '';
      return { ok: true, participant_id: pid, name: String(name), already: already };
    }
  }
  return { ok: false, error: 'participant_id が見つかりません', participant_id: pid };
}

// ─── 懇親会／前夜祭の参加意思フラグ (POST action=mark_party_intent) ───
// body: { participant_id, which }  which = 'party'（既定）| 'eve_party'
// 申込時に未チェックで、後から参加する人が完了画面のボタンを押したときに呼ばれる。
// 対象イベントの「参加」列を '済' に、「決済状態」が空なら '未払（後追い）' に更新する。
function markPartyIntent(body) {
  const participantId = body && body.participant_id;
  const which = (body && body.which) === 'eve_party' ? 'eve_party' : 'party';
  if (!participantId) throw new Error('participant_id が必要です');

  const regKey    = which === 'eve_party' ? 'eve_party_registered'     : 'party_registered';
  const statusKey = which === 'eve_party' ? 'eve_party_payment_status' : 'party_payment_status';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TAB_PARTICIPANTS);
  if (!sh) throw new Error('参加者 タブが見つかりません');

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const idCol     = findCol_(headers, 'participant_id');
  const regCol    = findCol_(headers, regKey);
  const statusCol = findCol_(headers, statusKey);
  const nameCol   = findCol_(headers, 'display_name');
  if (idCol < 0)  throw new Error('participant_id 列が見つかりません');
  if (regCol < 0) throw new Error(regKey + ' に対応する列が見つかりません');

  const last = sh.getLastRow();
  if (last < 2) throw new Error('参加者データがありません');
  const ids = sh.getRange(2, idCol + 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === String(participantId).trim()) {
      const rowNum = i + 2;
      const prev = String(sh.getRange(rowNum, regCol + 1).getValue() || '').trim();
      const already = (prev === '済' || prev === 'TRUE' || prev === 'true');
      sh.getRange(rowNum, regCol + 1).setValue('済');
      if (statusCol >= 0) {
        const curStatus = String(sh.getRange(rowNum, statusCol + 1).getValue() || '').trim();
        // 既に「決済確認済み」のものは下げない。それ以外は「未確認（後追い）」に。
        if (curStatus !== '決済確認済み') {
          sh.getRange(rowNum, statusCol + 1).setValue('未確認（後追い）');
        }
      }
      const name = nameCol >= 0 ? String(sh.getRange(rowNum, nameCol + 1).getValue() || '') : '';
      return { ok: true, participant_id: participantId, which: which, name: name, already: already };
    }
  }
  throw new Error('participant_id が見つかりません: ' + participantId);
}

// ─── 集計 (action=stats) ──────────────────────────────────────

function getStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TAB_PARTICIPANTS);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const idCol        = findCol_(headers, 'participant_id');
  const ckCol        = findCol_(headers, 'checked_in');
  const partyRegCol  = findCol_(headers, 'party_registered');
  const partyCkCol   = findCol_(headers, 'party_checked_in');
  const eveRegCol    = findCol_(headers, 'eve_party_registered');
  const eveCkCol     = findCol_(headers, 'eve_party_checked_in');
  const last = sh.getLastRow();
  if (last < 2) return {
    ok: true, total: 0, checked_in: 0,
    party_total: 0, party_checked_in: 0,
    eve_party_total: 0, eve_party_checked_in: 0
  };
  const data = sh.getRange(2, 1, last - 1, headers.length).getValues();
  let total = 0, checked = 0, partyTotal = 0, partyChecked = 0, eveTotal = 0, eveChecked = 0;
  data.forEach(row => {
    const id = String(row[idCol] || '').trim();
    if (!id) return;
    total++;
    if (ckCol >= 0 && String(row[ckCol] || '').trim() === '済') checked++;
    if (partyRegCol >= 0 && String(row[partyRegCol] || '').trim() === '済') {
      partyTotal++;
      if (partyCkCol >= 0 && String(row[partyCkCol] || '').trim() === '済') partyChecked++;
    }
    if (eveRegCol >= 0 && String(row[eveRegCol] || '').trim() === '済') {
      eveTotal++;
      if (eveCkCol >= 0 && String(row[eveCkCol] || '').trim() === '済') eveChecked++;
    }
  });
  return {
    ok: true, total: total, checked_in: checked,
    party_total: partyTotal, party_checked_in: partyChecked,
    eve_party_total: eveTotal, eve_party_checked_in: eveChecked
  };
}

// ─── 参加者照会 (action=lookup) ───────────────────────────────

function lookup(participantId) {
  if (!participantId) return { ok: false, error: 'participant_id が必要です' };
  var pid = normalizeParticipantId_(participantId);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TAB_PARTICIPANTS);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const idCol = findCol_(headers, 'participant_id');
  const last = sh.getLastRow();
  if (last < 2) return { ok: false, error: 'データなし' };
  const rows = sh.getRange(2, 1, last - 1, headers.length).getValues();
  for (const row of rows) {
    if (normalizeParticipantId_(row[idCol]) === pid) {
      const obj = {};
      headers.forEach((h, i) => {
        const key = headerToInternal_(h);
        obj[key] = row[i] instanceof Date ? row[i].toISOString() : String(row[i] || '');
      });
      return { ok: true, participant: obj };
    }
  }
  return { ok: false, error: 'participant_id が見つかりません', queried: pid };
}

// ─── ヘルパー ────────────────────────────────────────────────

function readTabAsObjects(ss, tabName) {
  const sh = ss.getSheetByName(tabName);
  if (!sh) return [];
  const last = sh.getLastRow();
  if (last < 2) return [];
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const data = sh.getRange(2, 1, last - 1, headers.length).getValues();
  return data
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
}

function readSettings(ss) {
  // 「サイト設定」と「設定」両方のタブから読み込んでマージ。
  // 「設定」タブ側の値が優先（後勝ち）— ユーザーが追加した設定タブで上書き可能にする。
  const out = {};
  [TAB_SETTINGS, TAB_SETTINGS_ALT].forEach(tabName => {
    const sh = ss.getSheetByName(tabName);
    if (!sh) return;
    const last = sh.getLastRow();
    if (last < 2) return;
    const data = sh.getRange(2, 1, last - 1, 2).getValues();
    data.forEach(([key, value]) => {
      const k = String(key || '').trim();
      // 空キー、または空文字値は無視（既存値を上書きしない）
      if (!k) return;
      if (value === '' || value === null || value === undefined) return;
      out[k] = value;
    });
  });
  return out;
}

function formatDate(v) {
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  }
  return String(v || '').replace(/\//g, '.');
}

function formatZoomDate(v) {
  if (v instanceof Date) {
    const m = v.getMonth() + 1;
    const d = v.getDate();
    const dow = ['日','月','火','水','木','金','土'][v.getDay()];
    return `${m}/${d}（${dow}）`;
  }
  return String(v || '');
}

// キャッシュをクリアする手動関数（管理者用）
function clearCache() {
  CacheService.getScriptCache().removeAll(['content:ja', 'content:en', 'content:zh', 'content:ko']);
  Logger.log('Content cache cleared.');
}

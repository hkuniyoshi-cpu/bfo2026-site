/**
 * BFO2026 — スプレッドシート完全初期化（日本語タブ名版）
 * ─────────────────────────────────────────────────────────────
 * このスクリプトはサイトの全セクションをスプレッドシートで管理できるように
 * すべてのタブを日本語名で作成し、初期データを投入します。
 *
 * ⚠ 既存データは全削除されます（テストデータの想定）
 * ⚠ 旧英語名のタブ（Exhibitors, News 等）は自動的に削除されます
 *
 * 使い方：
 *   1. Apps Script エディタで関数 `setupSpreadsheet` を選択して ▶ 実行
 *   2. 初回のみ権限承認のダイアログが出るので「許可」
 *   3. 完了アラートが表示されたらセットアップ完了
 *
 * 作成されるタブ（日本語）：
 *   ─ 表示コンテンツ ─
 *   ・サイトコンテンツ - 全セクションの key-value テキスト
 *   ・タイムテーブル   - スケジュール
 *   ・マーキー         - 流れるテキスト
 *   ・お知らせ         - News
 *   ・事前Zoom         - 事前Zoom説明会
 *   ・出展企業         - 出展ブース（ブースNo付き）
 *   ・飲食店           - BNIメンバーの飲食店
 *   ・会場ゾーン       - 会場レイアウトのゾーンラベル
 *
 *   ─ 運営データ ─
 *   ・参加者           - 申込者DB（フォーム入力で自動追加）
 *   ・チャプター       - リージョン・チャプターマスター
 *   ・サイト設定       - その他のサイト設定
 *
 * ※ apps-script.gs の TAB_* 定数と同期しています。両方を変更する必要があります。
 * ─────────────────────────────────────────────────────────────
 */

// 旧英語タブ → 新日本語タブ のマップ（マイグレーション用）
const LEGACY_TAB_MAP = {
  'Participants':  '参加者',
  'News':          'お知らせ',
  'ZoomSessions':  '事前Zoom',
  'Exhibitors':    '出展企業',
  'SiteSettings':  'サイト設定',
  'Chapters':      'チャプター',
  'SiteContent':   'サイトコンテンツ',
  'Schedule':      'タイムテーブル',
  'Marquee':       'マーキー',
  'Restaurants':   '飲食店',
  'VenueZones':    '会場ゾーン',
};

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('アクティブなスプレッドシートがありません。');

  // 旧英語タブを削除（マイグレーション）
  removeLegacyTabs_(ss);

  // 表示コンテンツ系
  setupSiteContent_(ss);
  setupSchedule_(ss);
  setupMarquee_(ss);
  setupNews_(ss);
  setupZoomSessions_(ss);
  setupExhibitors_(ss);
  // ※ 飲食店・会場ゾーン は廃止 → 既存シートは手動で削除してください

  // 運営データ系
  setupParticipants_(ss);
  setupChapters_(ss);
  setupSiteSettings_(ss);

  removeDefaultSheet_(ss);

  // タブ順序を整える（飲食店・会場ゾーンを除外）
  reorderSheets_(ss, [
    'サイトコンテンツ', 'タイムテーブル', 'マーキー', 'お知らせ', '事前Zoom',
    '出展企業',
    '参加者', 'チャプター', 'サイト設定'
  ]);

  // キャッシュクリア
  clearAllCache_();

  SpreadsheetApp.getUi().alert(
    'セットアップ完了',
    '9のタブを日本語名で作成しました。\n\n' +
    '【表示コンテンツ】\n' +
    '・サイトコンテンツ（全セクションの文言）\n' +
    '・タイムテーブル（スケジュール）\n' +
    '・マーキー（流れるテキスト）\n' +
    '・お知らせ（News）\n' +
    '・事前Zoom（説明会）\n' +
    '・出展企業（ブースNo付き）\n\n' +
    '【運営データ】\n' +
    '・参加者（申込者DB）\n' +
    '・チャプター（マスター）\n' +
    '・サイト設定（その他）\n\n' +
    '⚠ 「飲食店」「会場ゾーン」シートは廃止しました。\n' +
    '  既存スプレッドシートに残っている場合は手動で削除してください。\n\n' +
    'コンテンツキャッシュもクリアしました。\n' +
    'サイトをリロードすれば即時反映されます。',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ─── サイトコンテンツ ───────────────────────────────────────
// 全セクションの key-value 文言。セクション列でグループ化。
function setupSiteContent_(ss) {
  const headers = ['セクション', 'キー', '日本語の値', 'メモ'];
  const rows = [
    // ─── nav ───
    ['nav', 'about',    'イベントについて', 'ヘッダーメニュー'],
    ['nav', 'schedule', 'タイムテーブル',  'ヘッダーメニュー'],
    ['nav', 'greeting', '代表挨拶',       'ヘッダーメニュー'],
    ['nav', 'venue',    '会場',          'ヘッダーメニュー'],
    ['nav', 'access',   'アクセス',       'ヘッダーメニュー'],
    ['nav', 'tickets',  '事前申込み',     'ヘッダー右側CTAボタン'],

    // ─── hero ───
    ['hero', 'tag',            'BUSINESS FUSION OKINAWA 2026', 'ヒーロー上部タグ'],
    ['hero', 'title',          'ビジネスは、\n海をこえる。',     'メインタイトル（\\nで改行）'],
    ['hero', 'subtitle',       '沖縄から、アジアへ。\n世界とつながる、一日。', 'サブタイトル'],
    ['hero', 'countdownLabel', '開催まで',                     'カウントダウン上のラベル'],
    ['hero', 'days',    '日',     'カウントダウン単位'],
    ['hero', 'hours',   '時間',   'カウントダウン単位'],
    ['hero', 'minutes', '分',     'カウントダウン単位'],
    ['hero', 'seconds', '秒',     'カウントダウン単位'],
    ['hero', 'cta',     '展示会事前申込み',                  'メインCTAボタン文言'],
    ['hero', 'ctaSub',  '事前申込無料・当日参加5,000円',         'CTA横のサブ文言'],
    ['hero', 'ctaLimit','先着1,000名様限定',                  'ボタン内の制限表記'],

    // ─── event ───
    ['event', 'title',         'イベント概要',                    'セクションタイトル'],
    ['event', 'date',          '2026年7月7日（火）',              ''],
    ['event', 'time',          '10:00 – 18:00 / 懇親会 19:00 – 21:00', ''],
    ['event', 'venue',         'ラグナガーデンホテル',              ''],
    ['event', 'address',       '〒901-2227 沖縄県宜野湾市大山7-17-1', ''],
    ['event', 'conceptLabel',  'コンセプト',                      'コンセプト見出し'],
    ['event', 'concept',       '「FUSION」— 異なる業種、文化、世代が交わり、新たなビジネスが生まれる場。沖縄BNIが世界に発信する、年に一度のビジネスの祝祭。', '本文'],

    // ─── greeting ───
    ['greeting', 'enLabel', 'GREETING',                        '英語ラベル'],
    ['greeting', 'title',   '主催者からのご挨拶',                'セクションタイトル'],
    ['greeting', 'role',    'BNI沖縄リージョン エグゼクティブディレクター', '肩書'],
    ['greeting', 'name',    '座間味洋次（ざまみようじ）',          '名前'],
    ['greeting', 'sign',    'BNI沖縄リージョン ED',              '署名'],
    ['greeting', 'body',
      '「FUSION」— 沖縄から、アジアへ、そして世界へ。\n\n' +
      'BNI沖縄リージョンは、ビジネスの輪を広げ、地域経済を牽引するメンバーが集う場として、年に一度の祝祭「Business Fusion Okinawa 2026」を開催いたします。今回は台中リージョン・千葉京葉リージョンも共催パートナーとして加わり、海を越えたコラボレーションをお届けします。\n\n' +
      '業種を越え、世代を越え、海を越えて。多様な人と人とが出会い、化学反応を起こすことで、これまでにないビジネスが生まれます。\n\n' +
      '2026年7月7日、ラグナガーデンホテルにて、皆様のお越しを心よりお待ちしております。',
      '挨拶本文（\\n\\nで段落区切り）'],

    // ─── schedule ───
    ['schedule', 'title',     'タイムテーブル',     'セクションタイトル'],
    ['schedule', 'dateLabel', '2026.07.07 TUE',   '日付ラベル'],

    // ─── venueMap ───
    ['venueMap', 'enLabel',  'VENUE LAYOUT',          ''],
    ['venueMap', 'title',    '会場レイアウト',          ''],
    ['venueMap', 'subtitle', 'ラグナガーデンホテル 大宴会場', ''],

    // ─── exhibitors ───
    ['exhibitors', 'title',      '出展企業',     'セクションタイトル'],
    ['exhibitors', 'subtitle',   '70社が集結',   'サブタイトル'],
    ['exhibitors', 'countLabel', '出展ブース',   '社数ラベル'],

    // ─── access ───
    ['access', 'title',     'アクセス',          ''],
    ['access', 'venueName', 'ラグナガーデンホテル', ''],
    ['access', 'airport',   '那覇空港から車で約30分', ''],
    ['access', 'parking',   '無料駐車場 完備（300台）', ''],
    ['access', 'mapLabel',  'Google Mapで開く',  ''],

    // ─── video ───
    ['video', 'title',    'ムービー',                       ''],
    ['video', 'subtitle', 'ビジネスフュージョン沖縄 2025 ハイライト', ''],

    // ─── news ───
    ['news', 'enLabel',   'NEWS',         ''],
    ['news', 'title',     'お知らせ',      ''],
    ['news', 'moreLabel', '一覧を見る',    ''],
    ['news', 'empty',     'お知らせはありません', ''],

    // ─── zoom ───
    ['zoom', 'enLabel', 'PRE-EVENT BRIEFING',                                    ''],
    ['zoom', 'title',   '事前Zoom説明会',                                         ''],
    ['zoom', 'lead',    '初参加の方も安心。開催前にBNI沖縄メンバーがイベントの趣旨と参加のコツをご説明します。', ''],
    ['zoom', 'cta',     'Zoom説明会に申し込む',                                  ''],
    ['zoom', 'empty',   '現在、予定されている説明会はありません',                       ''],

    // ─── restaurants（メンバーサービス一覧）───
    ['restaurants', 'enLabel', 'BNI MEMBER SERVICES',                                              ''],
    ['restaurants', 'title',   '沖縄BNIメンバーサービス一覧',                                        ''],
    ['restaurants', 'lead',    'BNI沖縄メンバーが提供するサービスをご紹介します。お困りごとがあれば、お気軽にメンバーまでご相談ください。', ''],
    ['restaurants', 'cta',     'BNI沖縄 公式サイトで見る',                                          ''],

    // ─── cta ───
    ['cta', 'title', '一緒に、未来をつくろう。',                ''],
    ['cta', 'sub',   '事前申込無料　・　当日参加5,000円',     ''],
    ['cta', 'limit', '先着1,000名様限定',                      'ボタン内の制限表記'],
    ['cta', 'btn',   '展示会事前申込み',                       ''],

    // ─── producer（サイト制作会社紹介セクション） ───
    ['producer', 'enLabel',       'PRODUCED BY',                                    '上部 英字ラベル'],
    ['producer', 'repLabel',      'REPRESENTATIVE',                                 '代表者ラベル'],
    ['producer', 'repNameMain',   '国吉 弘孝',                                       '代表者名（メイン表示）'],
    ['producer', 'repNameSub',    'くによし ひろたか',                                'ふりがな・サブ表示'],
    ['producer', 'producerLabel', 'WEBSITE PRODUCER',                               '会社ラベル'],
    ['producer', 'companyMain',   'SearchMania Inc.',                               '会社名（メイン表示）'],
    ['producer', 'companySub',    '株式会社SearchMania',                             '会社名（サブ・正式名）'],
    ['producer', 'bniLabel',      'BNI',                                            'BNI 行ラベル'],
    ['producer', 'bniValue',      '沖縄リージョン TOPチャプター・DNAチーム',           'BNI 所属情報'],
    ['producer', 'boothLabel',    'BOOTH',                                          'ブース行ラベル'],
    ['producer', 'boothValue',    'ブース〇〇番に出展予定',                          '出展ブース番号（決定後に更新）'],
    ['producer', 'webLabel',      'WEB',                                            'WEB 行ラベル'],
    ['producer', 'webUrl',        'https://search-mania.net/',                      '公式サイト URL'],
    ['producer', 'howLabel',      '事業内容と本サイトについて',                       '紹介ブロックの見出し'],
    ['producer', 'howBody',
      'SearchMania（株式会社SearchMania）は、沖縄を拠点に企業のWebマーケティング・MEO対策・SEO対策・DX構築・サイト制作と運用支援を行っています。本イベント公式サイトは、企画・デザイン・実装まで弊社が担当。さらに、運営スタッフであれば誰でも操作できるオンライン受付・チェックインシステムも独自に構築・導入しました。サイト本体はビルド工程を持たない軽量構成（React・Google スプレッドシート・Apps Script・Netlify）で動作し、主催者がスプレッドシートを更新するだけで内容が即時反映される、運用しやすい仕組みです。',
      '紹介本文（自由に書き換え可）'],

    // ─── footer ───
    ['footer', 'produced',   'Produced by BNI沖縄リージョン',        ''],
    ['footer', 'developed',  'Website by SearchMania Inc.',          ''],
    ['footer', 'privacy',    'プライバシーポリシー',                  ''],
    ['footer', 'terms',      '利用規約',                            ''],
    ['footer', 'guidelines', 'ガイドライン',                         ''],
    ['footer', 'contact',    'お問い合わせ',                         ''],
    ['footer', 'copyright',  '© 2026 BNI Okinawa Region. All Rights Reserved.', ''],

    // ─── meta ───
    ['meta', 'title',       'Business Fusion Okinawa 2026 | 沖縄BNI主催・年に一度のビジネスの祝祭', 'HTMLタイトル'],
    ['meta', 'description', '2026年7月7日（火）、ラグナガーデンホテルにて開催。沖縄から、アジアへ。世界とつながる一日。70社が出展する、沖縄BNI主催のビジネスイベント。', 'meta description'],
    ['meta', 'ogTitle',     'Business Fusion Okinawa 2026',                ''],
    ['meta', 'ogDesc',      '2026.07.07 ラグナガーデンホテル — 沖縄から、アジアへ。', ''],
  ];
  const sh = resetSheet_(ss, 'サイトコンテンツ');
  writeHeaderAndData_(sh, headers, rows);
  sh.setColumnWidth(1, 110); sh.setColumnWidth(2, 140);
  sh.setColumnWidth(3, 540); sh.setColumnWidth(4, 200);
  sh.getRange(2, 3, rows.length, 1).setWrap(true).setVerticalAlignment('top');
  const sections = Array.from(new Set(rows.map(r => r[0])));
  const secRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(sections, true).setAllowInvalid(true).build();
  sh.getRange(2, 1, rows.length, 1).setDataValidation(secRule);
}

// ─── タイムテーブル ─────────────────────────────────────────
function setupSchedule_(ss) {
  const headers = ['公開', '並び順', '時間', 'タイトル', '説明', '強調'];
  const rows = [
    [true, 1, '07:00', '出展者・運営入場', 'スタッフ受付・設営（〜8:00）', false],
    [true, 2, '10:00', '開場・スタート',   '展示会スタート',              false],
    [true, 3, '12:00', '基調講演',         'メインステージにて',           false],
    [true, 4, '14:00', '出展ブースマッチング', '名刺交換・商談タイム',       false],
    [true, 5, '18:00', '本編クロージング',   '展示会終了',                false],
    [true, 6, '19:00', '懇親会',           '同会場にて／〜21:00',         true],
  ];
  const sh = resetSheet_(ss, 'タイムテーブル');
  writeHeaderAndData_(sh, headers, rows);
  sh.setColumnWidth(1, 60); sh.setColumnWidth(2, 70);
  sh.setColumnWidth(3, 80); sh.setColumnWidth(4, 200);
  sh.setColumnWidth(5, 320); sh.setColumnWidth(6, 60);
  sh.getRange(2, 1, rows.length, 1).insertCheckboxes();
  sh.getRange(2, 6, rows.length, 1).insertCheckboxes();
}

// ─── マーキー ───────────────────────────────────────────────
function setupMarquee_(ss) {
  const headers = ['公開', '並び順', 'テキスト'];
  const rows = [
    [true, 1, 'JULY 7 2026'],
    [true, 2, 'OKINAWA × ASIA'],
    [true, 3, 'BNI'],
    [true, 4, '70 EXHIBITORS'],
    [true, 5, 'BUSINESS FUSION'],
    [true, 6, 'LAGUNA GARDEN'],
  ];
  const sh = resetSheet_(ss, 'マーキー');
  writeHeaderAndData_(sh, headers, rows);
  sh.setColumnWidth(1, 60); sh.setColumnWidth(2, 70); sh.setColumnWidth(3, 360);
  sh.getRange(2, 1, rows.length, 1).insertCheckboxes();
}

// ─── お知らせ ───────────────────────────────────────────────
function setupNews_(ss) {
  const headers = ['公開', '日付', 'タグ', 'タイトル', '本文'];
  const rows = [
    [true, new Date(2026, 3, 1), 'お知らせ', 'BFO2026 公式サイトを公開しました',
      '本日、Business Fusion Okinawa 2026 の公式サイトを公開いたしました。\n\n7月7日（火）にラグナガーデンホテルにて開催される、沖縄BNI主催・年に一度のビジネスの祝祭です。70社の出展ブース、基調講演、ネットワーキング懇親会など、ビジネスマッチングの機会が満載です。\n\nご参加申込みは公式サイトより受け付けております。'],
    [true, new Date(2026, 4, 15), '更新情報', 'タイムテーブルを更新しました',
      '基調講演の登壇者と各セッションの時間が確定しましたので、タイムテーブルを更新しました。\n\n◆ 10:00 開場\n◆ 12:00 基調講演\n◆ 14:00 出展ブースマッチング\n◆ 18:00 本編クロージング\n◆ 19:00 懇親会'],
    [true, new Date(2026, 5, 10), 'イベント', '事前Zoom説明会のご案内',
      '初参加の方や、当日の進行イメージを掴んでおきたい方向けに、開催前にZoom説明会を実施します。\n\n◆ 6/5（金）19:00-20:00\n◆ 6/19（金）12:00-13:00\n◆ 7/3（金）19:00-20:00'],
    [true, new Date(2026, 5, 25), '重要', '駐車場のご利用について',
      'ラグナガーデンホテルには無料駐車場（300台）をご用意しております。満車時は近隣のコインパーキングをご利用ください。'],
    [true, new Date(2026, 6, 1), '締切', '事前申込み締切間近のお知らせ',
      '事前申込みは 7月5日（日）23:59 までとなります。事前申込みいただいた方は当日受付がスムーズです。'],
  ];
  const sh = resetSheet_(ss, 'お知らせ');
  writeHeaderAndData_(sh, headers, rows);
  sh.setColumnWidth(1, 60);  sh.setColumnWidth(2, 110);
  sh.setColumnWidth(3, 100); sh.setColumnWidth(4, 320); sh.setColumnWidth(5, 600);
  sh.getRange(2, 1, rows.length, 1).insertCheckboxes();
  const tagRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['お知らせ', '更新情報', 'イベント', '重要', '締切'], true)
    .setAllowInvalid(false).build();
  sh.getRange(2, 3, rows.length, 1).setDataValidation(tagRule);
  sh.getRange(2, 5, rows.length, 1).setWrap(true).setVerticalAlignment('top');
  sh.getRange(2, 2, rows.length, 1).setNumberFormat('yyyy/MM/dd');
}

// ─── 事前Zoom ───────────────────────────────────────────────
function setupZoomSessions_(ss) {
  const headers = ['公開', '日付', '時間', 'ホスト', 'URL'];
  const rows = [
    [true, new Date(2026, 5, 5),  '19:00-20:00', '座間味 ED ホスト', 'https://us02web.zoom.us/j/0000000001'],
    [true, new Date(2026, 5, 19), '12:00-13:00', 'ランチタイム回',   'https://us02web.zoom.us/j/0000000002'],
    [true, new Date(2026, 6, 3),  '19:00-20:00', '直前確認回',       'https://us02web.zoom.us/j/0000000003'],
  ];
  const sh = resetSheet_(ss, '事前Zoom');
  writeHeaderAndData_(sh, headers, rows);
  sh.setColumnWidth(1, 60);  sh.setColumnWidth(2, 110);
  sh.setColumnWidth(3, 130); sh.setColumnWidth(4, 200); sh.setColumnWidth(5, 380);
  sh.getRange(2, 1, rows.length, 1).insertCheckboxes();
  sh.getRange(2, 2, rows.length, 1).setNumberFormat('yyyy/MM/dd');
}

// ─── 出展企業（ブースNo付き）─────────────────────────────────
// ブースNo記入ルール:
//   ・通常      → "01"〜"70"（2桁ゼロ埋め）
//   ・1社2ブース → "12・13"（中点区切り。先頭の数字でソート）
//   ・2社1ブース → 同じブースNoで2行に分けて入力（例：どちらも "15"）
// 並び順はブースNoの先頭数値で自動ソートされます（スプレッドシート側でも管理可）
function setupExhibitors_(ss) {
  const headers = ['公開', '並び順', 'ブースNo', '社名', 'カテゴリ', 'URL'];
  //  公開  並び順  ブースNo  社名                          カテゴリ      URL
  // ※「1社2ブース」例: ブースNo="01・02"  ← 中点区切り
  // ※「2社1ブース」例: 同じブースNo="15" で2行作成
  const rows = [
    [true, 1,  '01',      'サーチマニア株式会社',           'IT',         'https://search-mania.net'],
    [true, 2,  '02',      '株式会社オキナワITソリューションズ', 'IT',         'https://example.com/oits'],
    [true, 3,  '03',      '琉球フードクラフト株式会社',       '飲食',       'https://example.com/ryukyu-food'],
    [true, 4,  '04',      '泡盛バル「波音」',               '飲食',       'https://example.com/naminone'],
    [true, 5,  '05',      '南風コンサルティング',            'コンサル',    'https://example.com/haebaru'],
    [true, 6,  '06',      '海風建築設計事務所',             '建築',       'https://example.com/umikaze'],
    [true, 7,  '07',      '島ライフ不動産',                '不動産',     'https://example.com/shima-life'],
    [true, 8,  '08',      '紅型デザインスタジオ',           'デザイン',    'https://example.com/bingata'],
    [true, 9,  '09',      '沖縄ヘルス&ビューティ',          '美容・健康',  'https://example.com/oki-beauty'],
    [true, 10, '10',      'パイナップル法律事務所',          '士業',       'https://example.com/pine-law'],
    [true, 11, '11',      'シーサー保険サービス',           '保険',       'https://example.com/shisa-ins'],
    [true, 12, '12',      'やんばる教育研究所',            '教育',       'https://example.com/yanbaru-edu'],
    [true, 13, '13',      '島唄エンタテインメント',         'エンタメ',    'https://example.com/shimauta'],
    // 1社2ブース の例: ブースNo="14・15"
    [true, 14, '14・15',  '琉球アグリテック（2ブース）',    '農業',       'https://example.com/ryukyu-agri'],
    // 2社1ブース の例: 同じブースNo="16" で2行
    [true, 16, '16',      'マリンスポーツ宮古（A）',        'レジャー',    'https://example.com/marine-miyako-a'],
    [true, 16, '16',      '宮古ダイビングセンター（B）',    'レジャー',    'https://example.com/miyako-dive'],
  ];
  const sh = resetSheet_(ss, '出展企業');
  writeHeaderAndData_(sh, headers, rows);
  sh.setColumnWidth(1, 60);  sh.setColumnWidth(2, 70);
  sh.setColumnWidth(3, 110); // ブースNo（"14・15" 等も収まるよう余裕を持たせる）
  sh.setColumnWidth(4, 280); sh.setColumnWidth(5, 130); sh.setColumnWidth(6, 360);
  sh.getRange(2, 1, rows.length, 1).insertCheckboxes();
  const catRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['IT','飲食','コンサル','建築','不動産','デザイン','美容・健康','士業','保険','教育','エンタメ','農業','レジャー','その他'], true)
    .setAllowInvalid(true).build();
  sh.getRange(2, 5, rows.length, 1).setDataValidation(catRule);
  // ブースNo列: 中央寄せ・太字・等幅フォント
  sh.getRange(2, 3, rows.length, 1)
    .setHorizontalAlignment('center')
    .setFontWeight('bold')
    .setFontFamily('Courier New');
  // ヘッダー行にセル注釈でルール説明
  sh.getRange(1, 3).setNote(
    'ブースNo 記入ルール:\n' +
    '・通常: "01"〜"70"（2桁ゼロ埋め）\n' +
    '・1社2ブース: "12・13"（中点区切り）\n' +
    '・2社1ブース: 同じNo で2行に分けて入力'
  );
}

// ─── 飲食店・会場ゾーン は廃止 ────────────────────────────────
// 公開ページでは BNI沖縄公式サイトへの CTA ボタンのみ表示するため、
// 個別のシート管理は不要になりました。
// 既存スプレッドシートにこれらのシートが残っている場合は手動で削除してください。

// ─── 参加者 ─────────────────────────────────────────────────
// 列名は日本語。apps-script.gs 側の PARTICIPANT_COLS マップで内部キー（英語）と
// 自動相互変換されるため、register.html のフォーム送信キーとの整合性は保たれます。
function setupParticipants_(ss) {
  const headers = [
    '参加者ID', '登録日時',
    '姓', '名', '表示名', '会社名', '業種',
    'メール', 'チケット種別',
    'リージョン', 'チャプター', '紹介者',
    '懇親会参加', '懇親会決済状態',
    '備考',
    'チェックイン', 'チェックイン日時',
    '懇親会チェックイン', '懇親会チェックイン日時',
    '前夜祭参加', '前夜祭決済状態',
    '前夜祭チェックイン', '前夜祭チェックイン日時'
  ];
  const sh = resetSheet_(ss, '参加者');
  writeHeaderAndData_(sh, headers, []);
  sh.setColumnWidth(1, 130);  // 参加者ID
  sh.setColumnWidth(2, 160);  // 登録日時
  sh.setColumnWidth(3, 80);   // 姓
  sh.setColumnWidth(4, 80);   // 名
  sh.setColumnWidth(5, 140);  // 表示名
  sh.setColumnWidth(6, 200);  // 会社名
  sh.setColumnWidth(7, 150);  // 業種
  sh.setColumnWidth(8, 220);  // メール
  sh.setColumnWidth(9, 130);  // チケット種別
  sh.setColumnWidth(10, 140); // リージョン
  sh.setColumnWidth(11, 160); // チャプター
  sh.setColumnWidth(12, 140); // 紹介者
  sh.setColumnWidth(13, 110); // 懇親会参加
  sh.setColumnWidth(14, 130); // 懇親会決済状態
  sh.setColumnWidth(15, 200); // 備考
  sh.setColumnWidth(16, 110); // チェックイン
  sh.setColumnWidth(17, 170); // チェックイン日時
  sh.setColumnWidth(18, 130); // 懇親会チェックイン
  sh.setColumnWidth(19, 180); // 懇親会チェックイン日時
  sh.setColumnWidth(20, 110); // 前夜祭参加
  sh.setColumnWidth(21, 130); // 前夜祭決済状態
  sh.setColumnWidth(22, 130); // 前夜祭チェックイン
  sh.setColumnWidth(23, 190); // 前夜祭チェックイン日時

  // フィルタ＆交互行カラーを自動適用
  applyParticipantsFilterAndBanding_(sh, headers.length);
}

// ─── 参加者シートのフィルタ＆交互行カラー適用 ────────────────
// 既存シートにも適用可能。既存のフィルタ・バンディングは事前に削除。
function applyParticipantsFilterAndBanding_(sh, columnCount) {
  // 既存フィルタを削除（重複防止）
  const existingFilter = sh.getFilter();
  if (existingFilter) existingFilter.remove();

  // 既存バンディングを削除
  sh.getBandings().forEach(b => b.remove());

  // ヘッダー含むデータ範囲にフィルタを設定
  // データが0行でも作成可能（自動でデータ追加時に拡張される）
  const lastRow = Math.max(sh.getLastRow(), 2);
  const cols = columnCount || sh.getLastColumn();
  const filterRange = sh.getRange(1, 1, lastRow, cols);
  filterRange.createFilter();

  // 交互行カラー（読みやすさ向上）
  // ヘッダー黒 + 偶数行うっすら黄色
  const banding = filterRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
  banding.setHeaderRowColor('#1a1612');
  banding.setFirstRowColor('#ffffff');
  banding.setSecondRowColor('#fbf6ec');
}

// ─── チャプター（日本・台湾・韓国の全リージョン・全チャプター）─────
// この一覧は申込フォームのプルダウン（リージョン → チャプター）に直結します。
// スプレッドシートに行を追加すれば自動的にフォームの選択肢にも追加されます。
function setupChapters_(ss) {
  const headers = ['リージョン', 'チャプター名'];

  // データを「リージョン → チャプター配列」で定義（メンテしやすい構造）
  const data = [
    // ─── 🇯🇵 日本 ────────────────────────────────────────────
    { region: '沖縄', chapters: [
      'TOP', 'Thanks', 'Blue Ocean', 'Grace', 'Lequios',
      'Haisai', 'Dragon', '龍宮', 'Yanbaru',
    ]},
    { region: '千葉京葉', chapters: [
      'DREAM BIG', 'DRAGON', 'CORN FIELD', 'Victory', 'Whales',
      'Amaterasu', 'Splendor', 'Mana Olana', 'ALL STARS',
    ]},

    // ─── 🇹🇼 台湾 ────────────────────────────────────────────
    { region: '台北', chapters: [
      // 長系（中山区・士林区）
      '長安', '長東', '長榮', '長興', '長綺', '長溙', '長旭', '長雁', '長鷹',
      '長貴', '長悅', '長城', '長翔', '長佑', '長冠軍', '長展', '長揚', '長策',
      '長星光', '長旺', '長愛', '長續', '長虹', '長翼', '長灃', '長盛', '長鑽',
      '長喜', '長長', '長達', '長和', '長雋', '長君', '長利', '長捷', '長慶', '長鶴',
      // 大系（中正区・忠孝）
      '大商之道', '大一', '大大', '大陽', '大芯', '大展', '大耀', '大漢', '大盛',
      '大立', '大恆', '大天', '大正', '大越', '大敬業', '大創', '大盈', '大丰',
      '大賦', '大千', '大無限', '大家',
      // 雲系
      '雲榮', '雲華', '雲創', '雲鼎', '雲貴', '雲愛', '雲富',
      // 金系
      '金盟', '金佑', '金利', '金澎湃', '金英',
      // その他エリア
      '旗艦', '太魯閣', '耀彰', '興創', '國際', '嘉樂', '國發',
      '菁鑽', '菁誠', '典範', '天明', '天大', '明商', '耀華',
      '誠億', '巨亮', '安信', '廣豐', '合富',
      '華冠', '華泰', '華科', '華魯', '華一',
    ]},
    { region: '新北', chapters: [
      // 板橋区
      '聚大', '聚富', '聚財', '聚道',
      // 中和区
      '華榮',
      // 三重区
      '金鈺', '金鑫', '金安', '金虎',
      // 蘆洲区
      '金暘',
      // 新莊区
      '新同心', '新元享', '新世界',
      // 萬華近郊
      '大疆',
    ]},
    { region: '桃園', chapters: [
      // 桃園区
      '永富', '永樂', '永榮', '永恩', '永福',
      // 蘆竹区
      '永晉', '永善', '永工', '永齊',
      // 中壢区
      '永強',
      // 楊梅区
      '宏力',
      // 平鎮区
      '宏鑫', '宏光',
      // オンライン
      '璞隆', '璞麗',
    ]},
    { region: '台中', chapters: [
      // 湧系
      '湧翼', '湧泉',
      // 豐系
      '豐華', '豐商',
      // 磐系
      '磐鈺', '磐石', '磐騰',
      // 全系（烏日区）
      '全勝', '全杏', '全樂', '全鑫', '全耀', '全冠', '全匠壹',
      // 震系
      '震豐益', '震智富', '震道', '震宇', '震天', '震展新',
      // その他
      '東穎', '鳳凰', '致勝', '威鋒', '威成', '百萬',
    ]},
    { region: '台南', chapters: [
      // 金系
      '金道', '金貴', '金信', '金誠',
      // 億系
      '億展', '億鑫', '億齊', '億冠',
      // 大系
      '大貴', '大信', '大商',
      // 真系（永康区）
      '真富', '真愛', '真鑫', '真鑽',
      // 新系（オンライン）
      '新生活', '新太洋', '新能量',
    ]},
    { region: '高雄', chapters: [
      // 富系
      '富禮', '富有', '富聯', '富翔', '富捷', '富瑞', '富恩',
      '富揚', '富達', '富新', '富樂', '富鼎', '富泰', '富源',
      '富和', '富豪', '富真', '富騰', '富裕', '富愛',
    ]},
    { region: '新竹', chapters: [
      '元鑽', '元創', '創始',
    ]},
    { region: '苗栗', chapters: [
      '元誠',
    ]},
    { region: '屏東', chapters: [
      '屏盛', '屏貿',
    ]},
    { region: '花蓮', chapters: [
      '國盛', '南島', '國富',
    ]},
    { region: '宜蘭', chapters: [
      '樂樂',
    ]},

    // ─── 🇰🇷 韓国 ────────────────────────────────────────────
    // ソウル特別市
    { region: 'ソウル Gangnam', chapters: [
      'All-in-One', 'Allgreen', 'Chance', 'Daebak', 'Excellent',
      'Harmony', 'Innovation', 'Master', 'Midas', 'Plus',
      'Prima', 'Smart', 'TheGangnam', 'Unique', 'Winners',
      // 元Gangnam所属（現在は성동구へ移転）
      'Happy', 'Awesome', 'Daebak 2',
    ]},
    { region: 'ソウル Mapo', chapters: [
      'Allstar', 'Attitude', 'Dream', 'Max', 'Power',
      'Runway', 'Special', 'Unicorn',
    ]},
    { region: 'ソウル Seocho', chapters: [
      'Beauty', 'Challenge', 'Craft', 'Honors', 'Medical',
      'Partners', 'Promise', 'Royal', 'Thirty', 'W',
    ]},
    { region: 'ソウル Yeongdeungpo', chapters: [
      'prime', 'professional', 'TRUST', 'Ace', 'Million',
      'leverage', 'Synergy', 'Champion', 'First', 'GROW',
    ]},
    { region: 'ソウル Seodaemun・Gangseo', chapters: [
      'Present', 'Company',
    ]},
    { region: 'ソウル Jung・Seongdong', chapters: [
      'Areum', 'Goood', 'D100',
    ]},
    { region: 'ソウル Songpa', chapters: [
      'Tribe', 'The Great',
    ]},
    { region: 'ソウル Dongdaemun', chapters: [
      'Forest',
    ]},
    // 首都圏
    { region: '首都圏 Incheon', chapters: [
      'Hero',
    ]},
    { region: '首都圏 Gyeonggi North', chapters: [
      'Choegang', 'Sunshine',
    ]},
    { region: '首都圏 Gyeonggi South', chapters: [
      'UNIQUE', 'Crown', 'ALPHA', 'Memory', 'Lucky',
      'Hana', 'Orange', 'Topaz', 'Omega',
    ]},
    { region: '首都圏 Gyeonggi Central', chapters: [
      'THE UNION', 'Dream come true', 'Episode', 'Grand',
    ]},
    // 地方都市
    { region: 'Busan', chapters: [
      'Giants', 'Pioneer',
    ]},
    { region: 'Gyeongnam', chapters: [
      'Vanguard',
    ]},
    { region: 'Daegu', chapters: [
      'Fantastic', 'Supreme', 'Wonderful', 'SKY', 'World',
      'Perfect', 'Miracle', 'Elite', 'glory', 'Amazing',
      'Phoenix', 'Legend',
    ]},
    { region: 'Daejeon', chapters: [
      'Leader', 'CEO', 'Laon',
    ]},
  ];

  // [region, chapter] のフラットな配列に展開
  const rows = [];
  data.forEach(d => {
    d.chapters.forEach(ch => rows.push([d.region, ch]));
  });

  const sh = resetSheet_(ss, 'チャプター');
  writeHeaderAndData_(sh, headers, rows);
  sh.setColumnWidth(1, 220); // リージョン
  sh.setColumnWidth(2, 240); // チャプター名

  // リージョン列にプルダウン（ユニーク値）— 入力ミス防止
  const regions = Array.from(new Set(rows.map(r => r[0])));
  const regionRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(regions, true)
    .setAllowInvalid(true) // 新リージョン追加もできるように
    .build();
  sh.getRange(2, 1, rows.length, 1).setDataValidation(regionRule);
}

// ─── サイト設定 ─────────────────────────────────────────────
function setupSiteSettings_(ss) {
  const headers = ['キー', '値', 'メモ'];
  const rows = [
    ['restaurants_url',     'https://bniokinawa.com/',                   '沖縄BNIメンバーサービス一覧のCTAボタン遷移先'],
    ['restaurants_blurb',   'BNI沖縄メンバーの店舗一覧',                  '飲食店セクションのリード文'],
    ['video_url',           'https://www.youtube.com/embed/eSgsJMw9c6M?si=u1nLjObF5zNNfsIU', 'メインムービーのembed URL（YouTube共有→埋込みコードのsrcをそのまま貼付け可）'],
    ['register_email_from', 'info@search-mania.net',                     '申込み完了メールの replyTo アドレス（MailApp 送信用・変更不要）'],
    ['contact_line',        'https://line.me/R/ti/p/@744geuzz',           'お問い合わせ先（BFO公式LINE）'],
    ['party_payment_url',   'https://eventpay.jp/event_info?shop_code=0469410230986265&EventCode=C245949457', '懇親会15,000円の外部決済URL（EventPay）— 申込み完了画面に「決済ページを開く」ボタンとして表示'],
    ['eve_party_payment_url',   '', '7/6前夜祭15,000円の外部決済URL（EventPay）。確定後に貼付け。空欄の間は完了画面で「準備中」表示'],
    ['eve_party_payment_label', 'BFO2026 前夜祭 事前決済', '前夜祭決済ボタン上に表示する名称'],
  ];
  const sh = resetSheet_(ss, 'サイト設定');
  writeHeaderAndData_(sh, headers, rows);
  sh.setColumnWidth(1, 220); sh.setColumnWidth(2, 380); sh.setColumnWidth(3, 320);
}

// ─── ユーティリティ ────────────────────────────────────────

// 旧英語名のタブを削除（マイグレーション）
function removeLegacyTabs_(ss) {
  Object.keys(LEGACY_TAB_MAP).forEach(legacy => {
    const sh = ss.getSheetByName(legacy);
    if (sh) {
      try {
        if (ss.getSheets().length === 1) ss.insertSheet('__tmp__');
        ss.deleteSheet(sh);
        Logger.log(`旧タブ「${legacy}」を削除しました`);
      } catch (e) {
        Logger.log(`旧タブ「${legacy}」削除失敗: ${e}`);
      }
    }
  });
  const tmp = ss.getSheetByName('__tmp__');
  if (tmp && ss.getSheets().length > 1) {
    try { ss.deleteSheet(tmp); } catch (_) {}
  }
}

function resetSheet_(ss, name) {
  const existing = ss.getSheetByName(name);
  if (existing) {
    if (ss.getSheets().length === 1) ss.insertSheet('__tmp_for_reset__');
    ss.deleteSheet(existing);
  }
  const sh = ss.insertSheet(name);
  const tmp = ss.getSheetByName('__tmp_for_reset__');
  if (tmp && ss.getSheets().length > 1) {
    try { ss.deleteSheet(tmp); } catch (_) {}
  }
  return sh;
}

function writeHeaderAndData_(sh, headers, rows) {
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.getRange(1, 1, 1, headers.length)
    .setBackground('#1a1612').setFontColor('#ffffff')
    .setFontWeight('bold').setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 32);
  sh.setFrozenRows(1);
  if (rows && rows.length) {
    sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sh.getRange(2, 1, rows.length, headers.length).setVerticalAlignment('middle');
  }
  const totalRows = 1 + (rows ? rows.length : 0);
  if (totalRows >= 1) {
    sh.getRange(1, 1, totalRows, headers.length)
      .setBorder(true, true, true, true, true, true, '#d0d0d0', SpreadsheetApp.BorderStyle.SOLID);
  }
}

function removeDefaultSheet_(ss) {
  const def = ss.getSheetByName('シート1') || ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) {
    try { ss.deleteSheet(def); } catch (_) {}
  }
}

function reorderSheets_(ss, order) {
  order.forEach((name, i) => {
    const sh = ss.getSheetByName(name);
    if (sh) {
      ss.setActiveSheet(sh);
      ss.moveActiveSheet(i + 1);
    }
  });
}

function clearAllCache_() {
  const cache = CacheService.getScriptCache();
  ['ja', 'en', 'zh', 'ko'].forEach(lang => cache.remove(`content:${lang}`));
  cache.remove('chapters');
}

// ─── 決済状態列にプルダウンを設定（非破壊）─────────────────
// 懇親会決済状態 / 前夜祭決済状態 の列に選択式リストを適用し、
// 既存の旧表記（未払 等）を新表記（未確認 等）へ変換する。
// 選択肢: 申込なし / 未確認 / 未確認（後追い）/ 決済確認済み
// EventPayでの決済確認が取れたら、セルで「決済確認済み」を選択する運用。
function applyPaymentStatusDropdown() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('参加者');
  if (!sh) { SpreadsheetApp.getUi().alert('「参加者」タブが見つかりません。'); return; }

  const OPTIONS = ['申込なし', '未確認', '未確認（後追い）', '決済確認済み'];
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
    .map(h => String(h || '').trim());
  // 決済状態列と、対応する申込列（表記ゆれ両対応）のペア
  const PAIRS = [
    { status: '懇親会決済状態', regNames: ['懇親会申込', '懇親会参加'] },
    { status: '前夜祭決済状態', regNames: ['前夜祭申込', '前夜祭参加'] },
  ];
  const lastRow = sh.getLastRow();
  const applyRows = Math.max(lastRow, 1000); // 将来の行もカバー
  let convertedCount = 0;
  let dropdownCount = 0;

  PAIRS.forEach(pair => {
    const sCol = headers.indexOf(pair.status);
    if (sCol < 0) return;
    let rCol = -1;
    pair.regNames.forEach(n => { if (rCol < 0) rCol = headers.indexOf(n); });

    // 既存値の変換
    if (lastRow >= 2) {
      const sRange = sh.getRange(2, sCol + 1, lastRow - 1, 1);
      const sVals = sRange.getValues();
      const rVals = (rCol >= 0)
        ? sh.getRange(2, rCol + 1, lastRow - 1, 1).getValues()
        : null;
      let changed = false;
      for (let i = 0; i < sVals.length; i++) {
        const v = String(sVals[i][0] || '').trim();
        const registered = rVals ? (String(rVals[i][0] || '').trim() === '済') : false;
        let nv = v;
        if (v === '未払')                 nv = '未確認';
        else if (v === '未払（後追い）')   nv = '未確認（後追い）';
        else if (v === '')                nv = registered ? '未確認' : '申込なし';
        // 申込なし / 未確認 / 未確認（後追い）/ 決済確認済み はそのまま
        if (nv !== v) { sVals[i][0] = nv; changed = true; convertedCount++; }
      }
      if (changed) sRange.setValues(sVals);
    }

    // プルダウン（データの入力規則）を適用
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(OPTIONS, true)
      .setAllowInvalid(true)
      .build();
    sh.getRange(2, sCol + 1, applyRows - 1, 1).setDataValidation(rule);
    dropdownCount++;
  });

  if (dropdownCount === 0) {
    SpreadsheetApp.getUi().alert('「懇親会決済状態」「前夜祭決済状態」列が見つかりませんでした。\n先に前夜祭の列を追加してください。');
    return;
  }
  clearAllCache_();
  SpreadsheetApp.getUi().alert(
    '決済状態列にプルダウンを設定しました（' + dropdownCount + '列）。\n' +
    '既存表記を ' + convertedCount + ' 件変換しました（未払→未確認 等）。\n\n' +
    '【運用】EventPayで決済確認が取れたら、対象セルのプルダウンから\n' +
    '「決済確認済み」を選択してください。'
  );
}

// ─── 参加者タブに前夜祭4列を追加（非破壊・冪等）─────────────
// 既存の参加者データ（行）は一切触らず、未登録の列のみ末尾に追加する。
function appendEvePartyColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('参加者');
  if (!sh) {
    SpreadsheetApp.getUi().alert('「参加者」タブが見つかりません。');
    return;
  }
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
    .map(h => String(h || '').trim());
  const newCols = ['前夜祭参加', '前夜祭決済状態', '前夜祭チェックイン', '前夜祭チェックイン日時'];
  const toAdd = newCols.filter(c => headers.indexOf(c) < 0);

  if (toAdd.length === 0) {
    SpreadsheetApp.getUi().alert('前夜祭の列は既に追加済みです。');
    return;
  }

  const startCol = sh.getLastColumn() + 1;
  sh.getRange(1, startCol, 1, toAdd.length).setValues([toAdd]);
  // ヘッダー行の見た目を既存に合わせる（黒背景・白文字・太字）
  sh.getRange(1, startCol, 1, toAdd.length)
    .setBackground('#1a1612').setFontColor('#ffffff').setFontWeight('bold');
  // 列幅
  for (let i = 0; i < toAdd.length; i++) {
    const w = (toAdd[i] === '前夜祭チェックイン日時') ? 190
            : (toAdd[i] === '前夜祭決済状態' || toAdd[i] === '前夜祭チェックイン') ? 130 : 110;
    sh.setColumnWidth(startCol + i, w);
  }

  clearAllCache_();
  SpreadsheetApp.getUi().alert(
    `前夜祭の列を ${toAdd.length} 件追加しました。\n` +
    '既存の参加者データはそのまま保持されています。'
  );
}

// ─── 決済URL系の行を「サイト設定」に追加（非破壊・冪等）────────
// 懇親会・前夜祭の決済 URL / ラベルのうち、未登録のキーのみ末尾に追記。
function appendEventPaymentSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('サイト設定');
  if (!sh) {
    SpreadsheetApp.getUi().alert('「サイト設定」タブが見つかりません。\n先にスプレッドシート初期化を実行してください。');
    return;
  }
  const candidates = [
    ['party_payment_url',       'https://eventpay.jp/event_info?shop_code=0469410230986265&EventCode=C245949457', '7/7当日懇親会15,000円の外部決済URL（EventPay）'],
    ['party_payment_label',     'BFO2026 懇親会 事前決済', '当日懇親会の決済ボタン上に表示する名称'],
    ['eve_party_payment_url',   '', '7/6前夜祭15,000円の外部決済URL（EventPay）。確定後に貼付け。空欄の間は「準備中」表示'],
    ['eve_party_payment_label', 'BFO2026 前夜祭 事前決済', '前夜祭の決済ボタン上に表示する名称'],
  ];
  const last = sh.getLastRow();
  const existing = new Set();
  if (last >= 2) {
    sh.getRange(2, 1, last - 1, 1).getValues().forEach(r => {
      const k = String(r[0] || '').trim();
      if (k) existing.add(k);
    });
  }
  const toAdd = candidates.filter(c => !existing.has(c[0]));
  if (toAdd.length === 0) {
    SpreadsheetApp.getUi().alert('決済URL系の行は既に全て登録済みです。\n値の変更は「サイト設定」タブで直接編集してください。');
    return;
  }
  sh.getRange(sh.getLastRow() + 1, 1, toAdd.length, 3).setValues(toAdd);
  clearAllCache_();
  SpreadsheetApp.getUi().alert(
    '決済URL系の行を ' + toAdd.length + ' 件追加しました。\n' +
    '「サイト設定」タブで値を編集後、サイトを再読み込みしてください。'
  );
}

// ─── Producer セクション行を「サイトコンテンツ」に追加（非破壊・冪等）─
// 既存行はそのまま、producer セクションで未登録のキーのみ末尾に追記。
// 既存の greeting/footer などの編集内容には触りません。
function appendProducerRowsToSiteContent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('サイトコンテンツ');
  if (!sh) {
    SpreadsheetApp.getUi().alert('「サイトコンテンツ」タブが見つかりません。\n先にスプレッドシート初期化を実行してください。');
    return;
  }

  // 追加すべき producer 行（setup-spreadsheet.gs setupSiteContent_ と同じ内容）
  const producerRows = [
    ['producer', 'enLabel',       'PRODUCED BY',                                    '上部 英字ラベル'],
    ['producer', 'repLabel',      'REPRESENTATIVE',                                 '代表者ラベル'],
    ['producer', 'repNameMain',   '国吉 弘孝',                                       '代表者名（メイン表示）'],
    ['producer', 'repNameSub',    'くによし ひろたか',                                'ふりがな・サブ表示'],
    ['producer', 'producerLabel', 'WEBSITE PRODUCER',                               '会社ラベル'],
    ['producer', 'companyMain',   'SearchMania Inc.',                               '会社名（メイン表示）'],
    ['producer', 'companySub',    '株式会社SearchMania',                             '会社名（サブ・正式名）'],
    ['producer', 'bniLabel',      'BNI',                                            'BNI 行ラベル'],
    ['producer', 'bniValue',      '沖縄リージョン TOPチャプター・DNAチーム',           'BNI 所属情報'],
    ['producer', 'boothLabel',    'BOOTH',                                          'ブース行ラベル'],
    ['producer', 'boothValue',    'ブース〇〇番に出展予定',                          '出展ブース番号（決定後に更新）'],
    ['producer', 'webLabel',      'WEB',                                            'WEB 行ラベル'],
    ['producer', 'webUrl',        'https://search-mania.net/',                      '公式サイト URL'],
    ['producer', 'howLabel',      '事業内容と本サイトについて',                       '紹介ブロックの見出し'],
    ['producer', 'howBody',
      'SearchMania（株式会社SearchMania）は、沖縄を拠点に企業のWebマーケティング・MEO対策・SEO対策・DX構築・サイト制作と運用支援を行っています。本イベント公式サイトは、企画・デザイン・実装まで弊社が担当。さらに、運営スタッフであれば誰でも操作できるオンライン受付・チェックインシステムも独自に構築・導入しました。サイト本体はビルド工程を持たない軽量構成（React・Google スプレッドシート・Apps Script・Netlify）で動作し、主催者がスプレッドシートを更新するだけで内容が即時反映される、運用しやすい仕組みです。',
      '紹介本文（自由に書き換え可）'],
  ];

  // 既存行を取得 → セクション×キーで既存セット作成
  const last = sh.getLastRow();
  const existing = new Set();
  if (last >= 2) {
    const data = sh.getRange(2, 1, last - 1, 2).getValues();
    data.forEach(r => {
      const sec = String(r[0] || '').trim();
      const key = String(r[1] || '').trim();
      if (sec && key) existing.add(`${sec}\t${key}`);
    });
  }

  // 未登録の行のみ抽出
  const toAdd = producerRows.filter(r => !existing.has(`${r[0]}\t${r[1]}`));

  if (toAdd.length === 0) {
    SpreadsheetApp.getUi().alert('Producer セクションの全ての行は既に登録済みです。\n値を編集したい場合はスプレッドシート上で直接書き換えてください。');
    return;
  }

  // 末尾に追記
  const startRow = sh.getLastRow() + 1;
  sh.getRange(startRow, 1, toAdd.length, 4).setValues(toAdd);
  // 値列は折り返し＋上揃え
  sh.getRange(startRow, 3, toAdd.length, 1).setWrap(true).setVerticalAlignment('top');

  clearAllCache_();
  SpreadsheetApp.getUi().alert(
    `Producer セクションの行を ${toAdd.length} 件追加しました。\n\n` +
    '次の手順：\n' +
    '1. 「サイトコンテンツ」タブ末尾の producer 行で文言を編集\n' +
    '2. サイトを Ctrl+F5 で再読み込み\n\n' +
    '※ キャッシュは既にクリア済みです。'
  );
}

// ─── スプレッドシート開時のメニュー ───────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('BFO 2026')
    .addItem('スプレッドシート初期化（全シート）', 'setupSpreadsheet')
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('各シートを個別に再セット')
        .addItem('タイムテーブルを再セット', 'resetScheduleOnly')
        .addItem('マーキーを再セット',       'resetMarqueeOnly')
        .addItem('お知らせを再セット',       'resetNewsOnly')
        .addItem('出展企業を再セット',       'resetExhibitorsOnly')
    )
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('参加者シート')
        .addItem('フィルタ＆交互行カラーを適用', 'applyParticipantsFilterMenu')
        .addItem('チャプター順にソート', 'sortParticipantsByChapter')
        .addItem('リージョン順にソート', 'sortParticipantsByRegion')
        .addItem('登録日時順にソート（新しい順）', 'sortParticipantsByDate')
    )
    .addSeparator()
    .addItem('Producer セクション行を追加（既存データ保持）', 'appendProducerRowsToSiteContent')
    .addItem('前夜祭の列を追加（既存データ保持）',           'appendEvePartyColumns')
    .addItem('決済URL行を追加（懇親会・前夜祭／既存データ保持）', 'appendEventPaymentSettings')
    .addItem('決済状態にプルダウンを設定（未払→未確認 変換）', 'applyPaymentStatusDropdown')
    .addSeparator()
    .addItem('キャッシュをクリア（サイト即時反映）', 'clearContentCache')
    .addToUi();
}

function clearContentCache() {
  clearAllCache_();
  SpreadsheetApp.getUi().alert('コンテンツキャッシュをクリアしました。\nサイトをリロードして反映を確認してください。');
}

// ─── 個別シート再セット関数 ─────────────────────────────────
// ※ 既存データを上書きします。テストデータは消えます。
// ※ 参加者シートは安全のためここには含めていません。

function resetScheduleOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSchedule_(ss);
  clearAllCache_();
  SpreadsheetApp.getUi().alert(
    'タイムテーブルを再セットしました。\n\n' +
    '追加された行：\n' +
    '  07:00 出展者・運営入場\n' +
    '  10:00 開場・スタート\n' +
    '  12:00 基調講演\n' +
    '  14:00 出展ブースマッチング\n' +
    '  18:00 本編クロージング\n' +
    '  19:00 懇親会\n\n' +
    'キャッシュもクリアしました。サイトをリロードして確認してください。'
  );
}

function resetMarqueeOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupMarquee_(ss);
  clearAllCache_();
  SpreadsheetApp.getUi().alert('マーキーを再セットしました。キャッシュもクリアしました。');
}

function resetNewsOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupNews_(ss);
  clearAllCache_();
  SpreadsheetApp.getUi().alert('お知らせを再セットしました。キャッシュもクリアしました。');
}

function resetExhibitorsOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupExhibitors_(ss);
  clearAllCache_();
  SpreadsheetApp.getUi().alert('出展企業を再セットしました（テストデータ）。キャッシュもクリアしました。');
}

// ─── 参加者シート操作メニュー ────────────────────────────────

function applyParticipantsFilterMenu() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('参加者');
  if (!sh) {
    SpreadsheetApp.getUi().alert('「参加者」タブが見つかりません。先にスプレッドシート初期化を実行してください。');
    return;
  }
  applyParticipantsFilterAndBanding_(sh, sh.getLastColumn());
  SpreadsheetApp.getUi().alert(
    '参加者シートにフィルタを適用しました。\n\n' +
    '使い方：\n' +
    '・各列のヘッダー右端の▼アイコンをクリック\n' +
    '・「条件で絞込み」「値で絞込み」「並び替え」が可能\n' +
    '・複数列で同時にフィルタを掛けることもできます'
  );
}

function sortParticipantsByChapter() { sortParticipants_('チャプター'); }
function sortParticipantsByRegion()  { sortParticipants_('リージョン'); }
function sortParticipantsByDate()    { sortParticipants_('登録日時', false); }

function sortParticipants_(columnName, ascending) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('参加者');
  if (!sh) {
    SpreadsheetApp.getUi().alert('「参加者」タブが見つかりません。');
    return;
  }
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const colIdx = headers.indexOf(columnName);
  if (colIdx < 0) {
    SpreadsheetApp.getUi().alert(`「${columnName}」列が見つかりません。`);
    return;
  }
  const lastRow = sh.getLastRow();
  if (lastRow < 3) {
    SpreadsheetApp.getUi().alert('並び替え対象のデータがありません（2行以上必要）。');
    return;
  }
  // データ範囲（ヘッダー除く）を並び替え
  const range = sh.getRange(2, 1, lastRow - 1, sh.getLastColumn());
  range.sort({ column: colIdx + 1, ascending: ascending !== false });
  SpreadsheetApp.getUi().alert(`「${columnName}」順に並び替えました。`);
}

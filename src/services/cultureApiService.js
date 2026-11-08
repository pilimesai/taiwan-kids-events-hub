/**
 * 全台親子活動即時搜尋與同步服務 (文化部 iCulture 開放資料 + 全台各縣市觀光節慶 Feed + 全台各大百貨商場特展)
 */
import staticCultureEvents from '../data/cultureEvents.json';
import { DEPARTMENT_STORE_EVENTS } from '../data/departmentStoreEvents.js';
import { MUNICIPAL_FESTIVALS_FEED } from '../data/municipalFestivalsFeed.js';

const COUNTIES = [
  '臺北市', '台北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', '苗栗縣',
  '臺中市', '台中市', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣',
  '臺南市', '台南市', '高雄市', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', '台東縣',
  '澎湖縣', '金門縣', '連江縣'
];

const REGION_MAP = {
  '臺北市': 'north', '新北市': 'north', '基隆市': 'north', '桃園市': 'north',
  '新竹市': 'north', '新竹縣': 'north', '宜蘭縣': 'north',
  '苗栗縣': 'central', '臺中市': 'central', '彰化縣': 'central', '南投縣': 'central', '雲林縣': 'central',
  '嘉義市': 'south', '嘉義縣': 'south', '臺南市': 'south', '高雄市': 'south', '屏東縣': 'south',
  '花蓮縣': 'east', '臺東縣': 'east',
  '澎湖縣': 'south', '金門縣': 'south', '連江縣': 'north'
};

const STOCK_IMAGES = {
  performance: [
    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=900&q=80'
  ],
  exhibition: [
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80'
  ],
  solar_term: [
    'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80'
  ],
  department_store: [
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=900&q=80'
  ],
  government: [
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=900&q=80'
  ]
};

function normalizeCounty(rawLoc) {
  if (!rawLoc) return null;
  for (const c of COUNTIES) {
    if (rawLoc.includes(c)) {
      if (c === '台北市') return '臺北市';
      if (c === '台中市') return '臺中市';
      if (c === '台南市') return '臺南市';
      if (c === '台東縣') return '臺東縣';
      return c;
    }
  }
  return null;
}

function getStockImage(category, uid = '') {
  const list = STOCK_IMAGES[category] || STOCK_IMAGES.exhibition;
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = (hash * 31 + uid.charCodeAt(i)) % list.length;
  return list[Math.abs(hash)];
}

function cleanHtml(str = '') {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/**
 * 取得當前標準日期 (YYYY-MM-DD)
 */
export function getTodayDateStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 判定活動是否已過期 (結束日早於今天即算過期)
 */
export function isEventExpired(event, todayStr = getTodayDateStr()) {
  if (!event) return true;
  const end = event.eventEndDate || event.eventStartDate;
  if (!end) return false;
  return end < todayStr;
}

/**
 * 同步取得初始活動資料 (0ms 零延遲，靜態打包導入 + localStorage 快取優先，自動濾除過期活動)
 */
export function getInitialCultureEvents() {
  const todayStr = getTodayDateStr();
  let baseEvents = [];
  try {
    const cached = localStorage.getItem('tw_kids_culture_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed.events) && parsed.events.length > 0) {
        baseEvents = parsed.events.filter(e => !isEventExpired(e, todayStr));
      }
    }
  } catch (e) {
    console.warn('讀取本地快取失敗:', e);
  }

  // 確保靜態資料庫（含最新各縣市節慶 Feed、文創特展與商場特展）完整合併，防止快取遺漏新活動
  const staticList = Array.isArray(staticCultureEvents) ? staticCultureEvents : [];
  const validStatic = staticList.filter(e => !isEventExpired(e, todayStr));
  const validMuni = (MUNICIPAL_FESTIVALS_FEED || []).filter(e => !isEventExpired(e, todayStr));
  const validDept = (DEPARTMENT_STORE_EVENTS || []).filter(e => !isEventExpired(e, todayStr));

  const existingIds = new Set(baseEvents.map(e => e.id));
  const newlyAdded = [...validMuni, ...validDept, ...validStatic].filter(e => !existingIds.has(e.id));
  const merged = [...baseEvents, ...newlyAdded];

  // 若有合併新活動，自動寫回本地快取以加速後續檢索
  if (newlyAdded.length > 0 && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('tw_kids_culture_cache', JSON.stringify({
        timestamp: Date.now(),
        events: merged
      }));
    } catch {
      // ignore storage errors
    }
  }

  return merged;
}

/**
 * 瀏覽器在線直接同步搜尋最新活動 (含文化部即時開放資料 + 各縣市觀光節慶 Feed + 全台各大百貨商場最新特展)
 */
export async function fetchLiveCultureEvents() {
  // 全面涵蓋親子家庭、地方節慶、城市光影、藝術展覽、購物商圈與童樂演出
  const kidKeywords = [
    '親子', '兒童', '童樂', '同樂', '偶戲', '繪本', '寶寶', '幼兒', '幼童', '恐龍',
    '積木', '探索', '動漫', '科學', '家庭', '小朋友', '劇團', '如果兒童', '紙風車',
    '蘋果劇團', '巧虎', '音樂劇', '工作坊', '手作', '草地', '嘉年華', '市集', '沈浸',
    '沉浸', '天文', '科博', '科教', '陶藝', '童話', '魔術', '體驗', '音樂會', '光影',
    '藝術節', '水舞', '煙火', '燈節', '燈會', '光雕', '投影', '玻璃', '琉璃', '購物節',
    '商圈', '觀光', '野餐', '露營', '放電', '闖關', '見面會', '帶動唱', '人偶', '職人',
    '打擊樂', '馬戲', '特技', '小丑', '氣球', '泡泡', '大氣球', '踩街',
    '科技藝術', '文創', '園區', '科技節', '生成式', 'AI', '數位藝術', '互動藝術', '創客'
  ];

  try {
    let rawList = [];

    // 優先以 category=all 全量檢索最新文化部資料
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(
        'https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=all',
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        rawList = await res.json();
      }
    } catch {
      // 備援方案：依類別個別抓取
      const categories = [1, 2, 3, 4, 5, 6, 7, 8, 17];
      const fetchPromises = categories.map(async (cat) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const url = `https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=${cat}`;
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) return [];
          return await res.json();
        } catch {
          return [];
        }
      });
      const results = await Promise.all(fetchPromises);
      rawList = results.flat();
    }

    const processed = [];
    const seenTitles = new Set();

    if (Array.isArray(rawList)) {
      for (const item of rawList) {
        if (!item.title) continue;
        const desc = cleanHtml(item.descriptionFilterHtml || '');
        const comment = cleanHtml(item.comment || '');
        const fullText = `${item.title} ${desc} ${comment}`;

        if (!kidKeywords.some(kw => fullText.includes(kw))) continue;

        const normalizedTitle = item.title.trim();
        if (seenTitles.has(normalizedTitle)) continue;
        seenTitles.add(normalizedTitle);

        const show0 = item.showInfo?.[0] || {};
        const rawLoc = show0.location || '';
        const rawVenue = show0.locationName || '';
        const county = normalizeCounty(rawLoc) || normalizeCounty(rawVenue);
        if (!county) continue;

        const region = REGION_MAP[county] || 'north';

        let category = 'performance';
        if (item.category === '1' || item.category === '2' || item.category === '3') {
          category = 'performance';
        } else if (item.category === '6' || item.category === '8' || normalizedTitle.includes('展')) {
          category = 'exhibition';
        } else if (item.category === '4' || item.category === '7') {
          category = 'solar_term';
        } else {
          category = 'government';
        }

        let minAge = 0;
        let maxAge = 99;
        let ageLabel = '全年齡親子皆宜';
        if (fullText.includes('寶寶') || fullText.includes('0-2') || fullText.includes('嬰幼兒')) {
          minAge = 0;
          maxAge = 3;
          ageLabel = '0-3 歲萌寶感統';
        } else if (fullText.includes('學齡前') || fullText.includes('幼兒') || fullText.includes('繪本') || fullText.includes('偶戲')) {
          minAge = 3;
          maxAge = 6;
          ageLabel = '3-6 歲幼兒啟蒙';
        } else if (fullText.includes('國小') || fullText.includes('科普') || fullText.includes('科學')) {
          minAge = 7;
          maxAge = 12;
          ageLabel = '7-12 歲國小科普';
        }

        const rawPrice = (show0.price || '').trim();
        const isFree = !rawPrice || rawPrice === '0' || rawPrice.includes('免費') || rawPrice.includes('自由入場');
        const ticketPrice = isFree ? '免費入場（免門票）' : `NT$ ${rawPrice}`;

        let bookingStatus = isFree ? 'free_walkin' : (show0.onSales === 'Y' ? 'booking_open' : 'tickets_selling');
        const isOutdoor = fullText.includes('草地') || fullText.includes('戶外') || fullText.includes('公園');
        const indoorOutdoor = isOutdoor ? 'outdoor' : 'indoor';
        const indoorOutdoorLabel = isOutdoor ? '戶外自然・草地同樂' : '室內專業場館・風雨無阻';

        const image = (item.imageUrl && item.imageUrl.startsWith('http'))
          ? item.imageUrl
          : getStockImage(category, item.UID || normalizedTitle);

        const todayStr = getTodayDateStr();
        const startDateClean = item.startDate ? item.startDate.replace(/\//g, '-') : todayStr;
        const endDateClean = item.endDate ? item.endDate.replace(/\//g, '-') : startDateClean;

        // 過期的活動自動濾除（已結束活動不予收錄）
        if (endDateClean < todayStr) continue;

        const highlights = [];
        if (rawVenue) highlights.push(`演出場館：${rawVenue}`);
        if (show0.time) highlights.push(`場次時間：${show0.time.split(' ')[0]} ${show0.time.split(' ')[1]?.slice(0, 5) || ''}`);
        highlights.push(isFree ? '公家免門票或藝文推廣自由入場' : `購票資訊：${ticketPrice}`);
        highlights.push('資料來源：文化部 iCulture 全國藝文活動開放資料平台');

        const notice = desc ? (desc.slice(0, 150) + (desc.length > 150 ? '...' : '')) : '詳情請見官方購票售票系統或主辦單位最新公告。開演前請依場館規範提早入場。';

        processed.push({
          id: `culture-${item.UID || Math.random().toString(36).substring(2, 9)}`,
          title: normalizedTitle,
          category,
          region,
          county,
          venue: rawVenue || county,
          address: rawLoc || rawVenue || `${county}藝文中心`,
          eventStartDate: startDateClean,
          eventEndDate: endDateClean,
          bookingStatus,
          bookingOpenDate: `${startDateClean} 10:00`,
          bookingPlatform: item.sourceWebName || '文化部 iCulture / 官方售票系統',
          bookingUrl: item.webSales || item.sourceWebPromote || 'https://cloud.culture.tw',
          ticketPrice,
          isFree,
          minAge,
          maxAge,
          ageLabel,
          indoorOutdoor,
          indoorOutdoorLabel,
          image,
          highlights,
          notice,
          organizer: item.masterUnit?.[0] || item.showUnit || item.sourceWebName || '文化部指導 / 主辦單位',
          isLiveApi: true,
          sourceType: 'culture_tw',
          sourceWebName: item.sourceWebName || '文化部 iCulture'
        });
      }
    }

    // 將全台各縣市政府觀光節慶 Feed 與各大百貨商場活動合併（排除過期）
    const todayStr = getTodayDateStr();
    const validMuniEvents = (MUNICIPAL_FESTIVALS_FEED || []).filter(e => !isEventExpired(e, todayStr));
    const validDeptEvents = (DEPARTMENT_STORE_EVENTS || []).filter(e => !isEventExpired(e, todayStr));
    const allCombined = [...validMuniEvents, ...validDeptEvents, ...processed].filter(e => !isEventExpired(e, todayStr));

    if (allCombined.length > 0) {
      try {
        localStorage.setItem('tw_kids_culture_cache', JSON.stringify({
          timestamp: Date.now(),
          events: allCombined
        }));
      } catch (e) {
        console.warn('快取寫入 localStorage 失敗:', e);
      }
    }

    return allCombined;
  } catch (err) {
    console.error('線上尋找最新活動失敗:', err);
    const todayStr = getTodayDateStr();
    const validMuni = (MUNICIPAL_FESTIVALS_FEED || []).filter(e => !isEventExpired(e, todayStr));
    const validDept = (DEPARTMENT_STORE_EVENTS || []).filter(e => !isEventExpired(e, todayStr));
    const validStatic = (staticCultureEvents || []).filter(e => !isEventExpired(e, todayStr));
    return [...validMuni, ...validDept, ...validStatic];
  }
}

/**
 * 跨來源全域即時深層搜尋 (搜尋時自動穿透比對文化部、各縣市節慶 Feed 與各大商場)
 * 確保任何活動（如光影節、童樂會、玻璃展、購物節、帶動唱）皆能立即檢索出
 */
export function searchAllEventsLive(query = '', currentEvents = []) {
  if (!query || !query.trim()) return currentEvents;
  const q = query.trim().toLowerCase();
  const todayStr = getTodayDateStr();

  // 匯整全台所有潛在資料庫與即時 Feed
  const allSources = [
    ...(MUNICIPAL_FESTIVALS_FEED || []),
    ...(DEPARTMENT_STORE_EVENTS || []),
    ...(staticCultureEvents || []),
    ...currentEvents
  ].filter(e => !isEventExpired(e, todayStr));

  const seenIds = new Set(currentEvents.map(e => e.id));
  const newDiscovered = [];

  for (const evt of allSources) {
    if (seenIds.has(evt.id)) continue;
    const matchTitle = evt.title?.toLowerCase().includes(q);
    const matchVenue = evt.venue?.toLowerCase().includes(q);
    const matchCounty = evt.county?.toLowerCase().includes(q);
    const matchAddress = evt.address?.toLowerCase().includes(q);
    const matchDesc = evt.description?.toLowerCase().includes(q);
    const matchHighlights = evt.highlights?.some(h => h.toLowerCase().includes(q));
    const matchNotice = evt.notice?.toLowerCase().includes(q);
    const matchOrganizer = evt.organizer?.toLowerCase().includes(q);
    const matchUrl = evt.bookingUrl?.toLowerCase().includes(q);
    const matchPlatform = evt.bookingPlatform?.toLowerCase().includes(q);

    if (
      matchTitle ||
      matchVenue ||
      matchCounty ||
      matchAddress ||
      matchDesc ||
      matchHighlights ||
      matchNotice ||
      matchOrganizer ||
      matchUrl ||
      matchPlatform
    ) {
      seenIds.add(evt.id);
      newDiscovered.push(evt);
    }
  }

  return [...currentEvents, ...newDiscovered];
}

/**
 * 整合精選活動、百貨商場特展與文化部開放資料（全面過濾已結束過期活動）
 */
export function mergeEvents(mockEvents = [], cultureEvents = [], dataSource = 'all') {
  const todayStr = getTodayDateStr();
  let list = [];

  // 合併並以 mockEvents 為精選置頂，過濾重複活動標題與過期活動
  const titles = new Set();

  for (const evt of mockEvents) {
    if (isEventExpired(evt, todayStr)) continue; // 過期活動直接刪除濾除
    titles.add(evt.title.trim().toLowerCase());
    list.push(evt);
  }

  for (const evt of cultureEvents) {
    if (isEventExpired(evt, todayStr)) continue; // 過期活動直接刪除濾除
    const key = evt.title.trim().toLowerCase();
    if (!titles.has(key)) {
      titles.add(key);
      list.push(evt);
    }
  }

  // 依來源進一步篩選
  if (dataSource === 'curated') {
    return list.filter(e => e.id.startsWith('evt-'));
  }
  if (dataSource === 'department') {
    return list.filter(e => e.category === 'department_store' || e.sourceType === 'department_store');
  }
  if (dataSource === 'municipal') {
    return list.filter(e => e.sourceType === 'municipal_feed' || e.category === 'government');
  }
  if (dataSource === 'culture') {
    return list.filter(e => e.sourceType === 'culture_tw');
  }

  return list;
}

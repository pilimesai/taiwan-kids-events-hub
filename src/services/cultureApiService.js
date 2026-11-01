/**
 * 文化部 iCulture 全國藝文活動開放資料 API 服務
 * 官方資料集: 文化部文化活動資訊開放資料 (Access-Control-Allow-Origin: *)
 */
import staticCultureEvents from '../data/cultureEvents.json';

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
 * 同步取得初始文化部開放資料 (0ms 零延遲，靜態打包導入 + localStorage 快取優先)
 */
export function getInitialCultureEvents() {
  try {
    const cached = localStorage.getItem('tw_kids_culture_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed.events) && parsed.events.length > 0) {
        return parsed.events;
      }
    }
  } catch (e) {
    console.warn('讀取文化部本地快取失敗:', e);
  }
  return Array.isArray(staticCultureEvents) ? staticCultureEvents : [];
}

/**
 * 瀏覽器在線直接同步文化部即時 API (支援 CORS)
 */
export async function fetchLiveCultureEvents() {
  const kidKeywords = [
    '親子', '兒童', '童樂', '偶戲', '繪本', '寶寶', '恐龍', '積木', '探索', '動漫',
    '科學', '家庭', '小朋友', '劇團', '如果兒童', '紙風車', '蘋果劇團', '巧虎',
    '音樂劇', '工作坊', '手作', '草地', '嘉年華', '市集', '沈浸', '沉浸', '天文', '科博', '科教',
    '陶藝', '童話', '魔術', '體驗', '音樂會'
  ];

  try {
    let rawList = [];

    // 嘗試一次抓取全部活動 (category=all)，速度最快且涵蓋最完整
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
      // 若 category=all 逾時，改用分組抓取備援
      const categories = [1, 2, 4, 6, 7, 8];
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

    if (!Array.isArray(rawList) || !rawList.length) return [];

    const processed = [];
    const seenTitles = new Set();

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

      const startDateClean = item.startDate ? item.startDate.replace(/\//g, '-') : '2026-11-01';
      const endDateClean = item.endDate ? item.endDate.replace(/\//g, '-') : startDateClean;

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

    if (processed.length > 0) {
      try {
        localStorage.setItem('tw_kids_culture_cache', JSON.stringify({
          timestamp: Date.now(),
          events: processed
        }));
      } catch (e) {
        console.warn('快取寫入 localStorage 失敗:', e);
      }
    }

    return processed;
  } catch (err) {
    console.error('線上同步文化部即時活動失敗:', err);
    return [];
  }
}

/**
 * 整合精選 Mock 資料與文化部開放資料
 */
export function mergeEvents(mockEvents = [], cultureEvents = [], dataSource = 'all') {
  if (dataSource === 'curated') {
    return mockEvents;
  }
  if (dataSource === 'culture') {
    return cultureEvents;
  }

  // 合併並以 mockEvents 為精選置頂，過濾重複活動標題
  const titles = new Set();
  const merged = [];

  for (const evt of mockEvents) {
    titles.add(evt.title.trim().toLowerCase());
    merged.push(evt);
  }

  for (const evt of cultureEvents) {
    const key = evt.title.trim().toLowerCase();
    if (!titles.has(key)) {
      titles.add(key);
      merged.push(evt);
    }
  }

  return merged;
}

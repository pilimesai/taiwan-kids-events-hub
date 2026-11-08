import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function fetchCategory(cat) {
  return new Promise((resolve) => {
    https.get(
      `https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=${cat}`,
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            console.error(`解析分類 ${cat} 失敗:`, e.message);
            resolve([]);
          }
        });
      }
    ).on('error', (err) => {
      console.error(`抓取分類 ${cat} 失敗:`, err.message);
      resolve([]);
    });
  });
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

export async function syncCultureEvents() {
  console.log('🔄 開始同步文化部 iCulture 全國藝文活動開放資料...');

  // 計算台灣當前日期 (UTC+8) 作為過期篩選基準
  const now = new Date();
  const taiwanTime = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
  const y = taiwanTime.getFullYear();
  const m = String(taiwanTime.getMonth() + 1).padStart(2, '0');
  const d = String(taiwanTime.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;
  console.log(`📅 當前基準日期: ${todayStr} (自動濾除已過期活動)`);

  const categories = [1, 2, 3, 4, 5, 6, 7, 8, 17];
  const allResults = await Promise.all(categories.map(fetchCategory));
  const rawList = allResults.flat();
  console.log(`📥 文化部原始活動取得筆數: ${rawList.length}`);

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

  const processedEvents = [];
  const seenTitles = new Set();

  for (const item of rawList) {
    if (!item.title) continue;
    const desc = cleanHtml(item.descriptionFilterHtml || '');
    const comment = cleanHtml(item.comment || '');
    const fullText = `${item.title} ${desc} ${comment}`;

    const isKidRelevant = kidKeywords.some(kw => fullText.includes(kw));
    if (!isKidRelevant) continue;

    // 去除重複標題 (部分活動多梯次或多場次重複)
    const normalizedTitle = item.title.trim();
    if (seenTitles.has(normalizedTitle)) continue;
    seenTitles.add(normalizedTitle);

    const show0 = item.showInfo?.[0] || {};
    const rawLoc = show0.location || '';
    const rawVenue = show0.locationName || '';
    const county = normalizeCounty(rawLoc) || normalizeCounty(rawVenue);
    if (!county) continue;

    const region = REGION_MAP[county] || 'north';

    // 判斷類型
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

    // 判斷年齡層
    let minAge = 0;
    let maxAge = 99;
    let ageLabel = '全年齡親子皆宜';

    if (fullText.includes('寶寶') || fullText.includes('0-2') || fullText.includes('嬰幼兒') || fullText.includes('爬行')) {
      minAge = 0;
      maxAge = 3;
      ageLabel = '0-3 歲萌寶感統';
    } else if (fullText.includes('學齡前') || fullText.includes('幼兒') || fullText.includes('繪本') || fullText.includes('偶戲') || fullText.includes('3-6')) {
      minAge = 3;
      maxAge = 6;
      ageLabel = '3-6 歲幼兒啟蒙';
    } else if (fullText.includes('國小') || fullText.includes('科普') || fullText.includes('科學') || fullText.includes('創客') || fullText.includes('7-12')) {
      minAge = 7;
      maxAge = 12;
      ageLabel = '7-12 歲國小科普';
    }

    // 費用判定
    const rawPrice = (show0.price || '').trim();
    const isFree = !rawPrice || rawPrice === '0' || rawPrice.includes('免費') || rawPrice.includes('自由入場');
    const ticketPrice = isFree ? '免費入場（免門票）' : `NT$ ${rawPrice}`;

    // 預約 / 報名狀態
    let bookingStatus = 'tickets_selling';
    if (isFree) {
      bookingStatus = 'free_walkin';
    } else if (show0.onSales === 'Y') {
      bookingStatus = 'booking_open';
    }

    // 室內 / 戶外
    const isOutdoor = fullText.includes('草地') || fullText.includes('戶外') || fullText.includes('公園') || fullText.includes('廣場') || rawVenue.includes('公園');
    const indoorOutdoor = isOutdoor ? 'outdoor' : 'indoor';
    const indoorOutdoorLabel = isOutdoor ? '戶外自然・草地同樂' : '室內專業場館・風雨無阻';

    // 圖片
    const image = (item.imageUrl && item.imageUrl.startsWith('http'))
      ? item.imageUrl
      : getStockImage(category, item.UID || normalizedTitle);

    // 日期格式化 (YYYY-MM-DD)
    const startDateClean = item.startDate ? item.startDate.replace(/\//g, '-') : todayStr;
    const endDateClean = item.endDate ? item.endDate.replace(/\//g, '-') : startDateClean;

    // 自動濾除已過期活動（活動結束日期早於今天者直接刪除）
    if (endDateClean < todayStr) continue;

    // 亮點特色
    const highlights = [];
    if (rawVenue) highlights.push(`演出場館：${rawVenue}`);
    if (show0.time) highlights.push(`場次時間：${show0.time.split(' ')[0]} ${show0.time.split(' ')[1]?.slice(0, 5) || ''}`);
    highlights.push(isFree ? '公家免門票或藝文推廣自由入場' : `購票資訊：${ticketPrice}`);
    highlights.push('資料來源：文化部 iCulture 全國藝文活動開放資料平台');

    const notice = desc ? (desc.slice(0, 150) + (desc.length > 150 ? '...' : '')) : '詳情請見官方購票售票系統或主辦單位最新公告。開演前請依場館規範提早入場。';

    const eventObj = {
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
    };

    processedEvents.push(eventObj);
  }

  console.log(`✅ 親子精選活動處理完成，共萃取 ${processedEvents.length} 筆文化部活動！`);

  // 加入全台各縣市政府觀光節慶、城市特色活動與市政童樂盛典 Feed
  let municipalEvents = [];
  try {
    const muniModule = await import('../src/data/municipalFestivalsFeed.js');
    const rawMuniEvents = muniModule.MUNICIPAL_FESTIVALS_FEED || [];
    municipalEvents = rawMuniEvents.filter(e => {
      const end = e.eventEndDate || e.eventStartDate;
      return !end || end >= todayStr;
    });
    console.log(`🏛️ 已成功納入全台各縣市政府觀光與地方節慶活動: ${municipalEvents.length} 檔！`);
  } catch (err) {
    console.warn('載入地方政府活動失敗:', err.message);
  }

  // 加入全台各大百貨商場最新特展與快閃活動（過濾已過期）
  let deptEvents = [];
  try {
    const deptModule = await import('../src/data/departmentStoreEvents.js');
    const rawDeptEvents = deptModule.DEPARTMENT_STORE_EVENTS || [];
    deptEvents = rawDeptEvents.filter(e => {
      const end = e.eventEndDate || e.eventStartDate;
      return !end || end >= todayStr;
    });
    console.log(`🛍️ 已成功納入全台各大百貨商場活動: ${deptEvents.length} 檔！`);
  } catch (err) {
    console.warn('載入百貨商場活動失敗:', err.message);
  }

  const allCombined = [...municipalEvents, ...deptEvents, ...processedEvents].filter(e => {
    const end = e.eventEndDate || e.eventStartDate;
    return !end || end >= todayStr;
  });

  // 儲存至 public/data/cultureEvents.json 與 src/data/cultureEvents.json
  const publicDir = path.resolve(__dirname, '../public/data');
  const srcDir = path.resolve(__dirname, '../src/data');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });

  const publicFile = path.join(publicDir, 'cultureEvents.json');
  const srcFile = path.join(srcDir, 'cultureEvents.json');
  const jsonContent = JSON.stringify(allCombined, null, 2);

  fs.writeFileSync(publicFile, jsonContent, 'utf-8');
  fs.writeFileSync(srcFile, jsonContent, 'utf-8');
  console.log(`💾 成功儲存至 ${publicFile} 與 ${srcFile}，總計 ${allCombined.length} 檔活動！`);

  return allCombined;
}

// 支援命令列直接執行
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncCultureEvents()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}


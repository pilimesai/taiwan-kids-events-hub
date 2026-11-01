import React, { useState, useEffect, useMemo } from 'react';
import {
  MOCK_EVENTS,
  REGIONS
} from './data/mockEvents';
import {
  getInitialCultureEvents,
  fetchLiveCultureEvents,
  mergeEvents
} from './services/cultureApiService';
import TaiwanMap from './components/TaiwanMap';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import TicketRadarBanner from './components/TicketRadarBanner';
import IgInfluencersBanner from './components/IgInfluencersBanner';
import EventCard from './components/EventCard';
import EventModal from './components/EventModal';
import FavoritesDrawer from './components/FavoritesDrawer';
import {
  Map,
  Grid,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import './App.css';

export default function App() {
  // 文化部開放資料與資料來源狀態 (預先靜態導入 370+ 檔活動，保證 0ms 零延遲立即呈現)
  const [cultureEvents, setCultureEvents] = useState(getInitialCultureEvents);
  const [dataSource, setDataSource] = useState('all'); // 'all', 'culture', 'curated'
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  // 篩選狀態
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCounty, setSelectedCounty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgePreset, setSelectedAgePreset] = useState('all');
  const [customAge, setCustomAge] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [indoorFilter, setIndoorFilter] = useState('all');
  const [onlyFree, setOnlyFree] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 載入 localStorage 快取 (若使用者先前曾線上同步過更即時的資料)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('tw_kids_culture_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.events) && parsed.events.length > 0) {
          setCultureEvents(parsed.events);
        }
      }
    } catch (e) {
      console.warn('讀取本地快取失敗:', e);
    }
  }, []);

  // 視圖切換 (手機與平板適配)
  const [mobileTab, setMobileTab] = useState('list'); // 'map' or 'list'

  // 收藏清單 (Local Storage 持久化)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('tw_kids_events_favs');
      return saved ? JSON.parse(saved) : ['evt-01', 'evt-06'];
    } catch {
      return ['evt-01', 'evt-06'];
    }
  });

  // Modal 狀態
  const [activeModalEvent, setActiveModalEvent] = useState(null);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);

  // 收藏異動儲存
  useEffect(() => {
    try {
      localStorage.setItem('tw_kids_events_favs', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const toggleFavorite = (eventId) => {
    setFavorites(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  // 即時連線文化部 API 手動同步
  const handleSyncCulture = async () => {
    setIsSyncing(true);
    setSyncToast({ type: 'info', message: '正在連線文化部 iCulture API 同步最新藝文活動...' });
    try {
      const fresh = await fetchLiveCultureEvents();
      if (fresh && fresh.length > 0) {
        setCultureEvents(fresh);
        setSyncToast({
          type: 'success',
          message: `🎉 同步完成！取得 ${fresh.length} 筆文化部即時開放資料！`
        });
      } else {
        setSyncToast({
          type: 'info',
          message: `目前已連線文化部開放資料庫，共 ${cultureEvents.length} 檔活動！`
        });
      }
    } catch {
      setSyncToast({
        type: 'warning',
        message: '連線逾時，已維持使用本地預載之文化部活動資料。'
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  // 整合精選與文化部開放資料
  const allEvents = useMemo(() => {
    return mergeEvents(MOCK_EVENTS, cultureEvents, dataSource);
  }, [cultureEvents, dataSource]);

  // 即將搶票 / 需預約的熱門活動 (未來14天內開搶或名額告急)
  const urgentEvents = useMemo(() => {
    return allEvents.filter(
      evt => evt.bookingStatus === 'booking_soon' || evt.bookingStatus === 'almost_full'
    );
  }, [allEvents]);

  // 多重條件過濾邏輯
  const filteredEvents = useMemo(() => {
    return allEvents.filter(evt => {
      // 1. 地區與縣市
      if (selectedCounty !== 'all') {
        if (selectedCounty === '新竹' || selectedCounty === '新竹縣市') {
          if (!evt.county.includes('新竹')) return false;
        } else if (selectedCounty === '嘉義' || selectedCounty === '嘉義縣市') {
          if (!evt.county.includes('嘉義')) return false;
        } else if (evt.county !== selectedCounty) {
          return false;
        }
      } else if (selectedRegion !== 'all') {
        const allowedCounties = REGIONS[selectedRegion]?.counties || [];
        if (!allowedCounties.includes(evt.county)) return false;
      }

      // 2. 活動類別
      if (selectedCategory !== 'all') {
        if (evt.category !== selectedCategory) return false;
      }

      // 3. 年齡篩選 (自訂具體年齡優先，次為標籤區間)
      if (customAge !== '') {
        const ageNum = Number(customAge);
        if (!isNaN(ageNum)) {
          if (ageNum < evt.minAge || ageNum > evt.maxAge) return false;
        }
      } else if (selectedAgePreset !== 'all') {
        if (selectedAgePreset === 'toddler') {
          // 0-2歲
          if (evt.minAge > 2 || evt.maxAge < 0) return false;
        } else if (selectedAgePreset === 'preschool') {
          // 3-6歲
          if (evt.minAge > 6 || evt.maxAge < 3) return false;
        } else if (selectedAgePreset === 'elementary') {
          // 7-12歲
          if (evt.minAge > 12 || evt.maxAge < 7) return false;
        }
      }

      // 4. 搶票與預約狀態
      if (bookingFilter !== 'all') {
        if (evt.bookingStatus !== bookingFilter) return false;
      }

      // 5. 是否只看免費
      if (onlyFree && !evt.isFree) {
        return false;
      }

      // 6. 室內 / 戶外
      if (indoorFilter !== 'all') {
        if (indoorFilter === 'indoor' && evt.indoorOutdoor === 'outdoor') return false;
        if (indoorFilter === 'outdoor' && evt.indoorOutdoor === 'indoor') return false;
      }

      // 7. 關鍵字搜尋 (支援智慧識別「新活動」、「最新」等泛稱，並深度比對所有欄位)
      if (searchTerm.trim() !== '') {
        const q = searchTerm.trim().toLowerCase();
        const isGenericQuery = ['新活動', '最新活動', '最新', '活動', '全部活動', '所有活動'].includes(q);
        if (!isGenericQuery) {
          const matchTitle = evt.title.toLowerCase().includes(q);
          const matchVenue = evt.venue.toLowerCase().includes(q);
          const matchCounty = evt.county.toLowerCase().includes(q);
          const matchAddress = evt.address?.toLowerCase().includes(q);
          const matchHighlights = evt.highlights?.some(h => h.toLowerCase().includes(q));
          const matchOrganizer = evt.organizer?.toLowerCase().includes(q);
          const matchPlatform = evt.bookingPlatform?.toLowerCase().includes(q);
          if (!matchTitle && !matchVenue && !matchCounty && !matchAddress && !matchHighlights && !matchOrganizer && !matchPlatform) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    allEvents,
    selectedRegion,
    selectedCounty,
    selectedCategory,
    selectedAgePreset,
    customAge,
    bookingFilter,
    onlyFree,
    indoorFilter,
    searchTerm
  ]);

  const handleResetFilters = () => {
    setSelectedRegion('all');
    setSelectedCounty('all');
    setSelectedCategory('all');
    setSelectedAgePreset('all');
    setCustomAge('');
    setBookingFilter('all');
    setIndoorFilter('all');
    setOnlyFree(false);
    setSearchTerm('');
    setDataSource('all');
  };

  const scrollToRadar = () => {
    const el = document.getElementById('ticket-radar-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExecuteSearch = (optionalTerm) => {
    let termToSearch = searchTerm;
    if (typeof optionalTerm === 'string') {
      termToSearch = optionalTerm;
      setSearchTerm(optionalTerm);
    }
    setMobileTab('list');

    // 即時提示搜尋反饋
    if (termToSearch.trim()) {
      setSyncToast({
        type: 'info',
        message: `🔎 為您檢索「${termToSearch.trim()}」，即刻呈現全台相關精彩活動！`
      });
      setTimeout(() => setSyncToast(null), 3000);
    }

    setTimeout(() => {
      const el = document.getElementById('events-results-section') || document.querySelector('.events-column');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <div className="app-root">
      {/* 頂部導航 */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExecuteSearch={handleExecuteSearch}
        urgentCount={urgentEvents.length}
        favoriteCount={favorites.length}
        cultureCount={cultureEvents.length}
        onSyncCulture={handleSyncCulture}
        isSyncing={isSyncing}
        onOpenFavorites={() => setIsFavoritesDrawerOpen(true)}
        onScrollToRadar={scrollToRadar}
      />

      <main className="main-content-layout">
        {/* 同步狀態浮動橫幅 */}
        {syncToast && (
          <div className={`sync-toast-banner ${syncToast.type}`}>
            {syncToast.type === 'success' && <CheckCircle2 size={16} />}
            {syncToast.type === 'warning' && <AlertCircle size={16} />}
            {syncToast.type === 'info' && <RefreshCw size={16} className={isSyncing ? 'spin-icon' : ''} />}
            <span>{syncToast.message}</span>
          </div>
        )}

        {/* 搶票預警雷達區 */}
        <TicketRadarBanner
          urgentEvents={urgentEvents}
          onSelectEvent={setActiveModalEvent}
        />

        {/* 熱門親子 IG / 社群達人每週推薦專欄 */}
        <IgInfluencersBanner
          activeCuratorQuery={searchTerm}
          onSelectCurator={(query) => {
            setSearchTerm(query);
            // 當選取達人時，重設其他過嚴篩選以確保活動能完整展示
            if (query) {
              setSelectedCategory('all');
            }
          }}
        />

        {/* 綜合篩選工具區 (年齡、類型、搶票條件、資料來源) */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedAgePreset={selectedAgePreset}
          onSelectAgePreset={setSelectedAgePreset}
          customAge={customAge}
          onCustomAgeChange={setCustomAge}
          bookingFilter={bookingFilter}
          onBookingFilterChange={setBookingFilter}
          onlyFree={onlyFree}
          onToggleOnlyFree={setOnlyFree}
          indoorFilter={indoorFilter}
          onIndoorFilterChange={setIndoorFilter}
          dataSource={dataSource}
          onDataSourceChange={setDataSource}
          totalResultsCount={filteredEvents.length}
          onExecuteSearch={handleExecuteSearch}
        />

        {/* 手機版模式切換標籤 (地圖 / 列表) */}
        <div className="mobile-view-tabs">
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'list' ? 'active' : ''}`}
            onClick={() => setMobileTab('list')}
          >
            <Grid size={16} />
            <span>活動情報列表 ({filteredEvents.length})</span>
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'map' ? 'active' : ''}`}
            onClick={() => setMobileTab('map')}
          >
            <Map size={16} />
            <span>切換台灣地圖選取</span>
          </button>
        </div>

        {/* 核心雙欄佈局：左側台灣地圖選取，右側活動卡片串流 */}
        <div className="explorer-grid-layout">
          {/* 左欄：台灣地圖探索器 */}
          <aside className={`map-column ${mobileTab === 'map' ? 'mobile-show' : ''}`}>
            <div className="sticky-map-wrapper">
              <TaiwanMap
                selectedCounty={selectedCounty}
                onSelectCounty={setSelectedCounty}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                events={filteredEvents}
              />
            </div>
          </aside>

          {/* 右欄：活動清單列表 */}
          <section
            id="events-results-section"
            className={`events-column ${mobileTab === 'list' ? 'mobile-show' : ''}`}
          >
            <div className="results-header-bar">
              <div className="results-stats">
                <span className="results-count-number">{filteredEvents.length}</span>
                <span className="results-label">檔未來 2 個月精彩活動</span>
                {(selectedCounty !== 'all' || selectedRegion !== 'all' || selectedCategory !== 'all' || customAge || onlyFree || searchTerm || dataSource !== 'all') && (
                  <span className="active-filters-summary">
                    （已套用自訂篩選條件）
                  </span>
                )}
              </div>

              {(selectedCounty !== 'all' || selectedRegion !== 'all' || selectedCategory !== 'all' || customAge || onlyFree || searchTerm || dataSource !== 'all') && (
                <button
                  type="button"
                  className="reset-filters-btn"
                  onClick={handleResetFilters}
                >
                  <RotateCcw size={13} />
                  <span>清除全部條件</span>
                </button>
              )}
            </div>

            {/* 活動卡片列表 */}
            {filteredEvents.length === 0 ? (
              <div className="empty-results-box">
                <div className="empty-icon">🔍</div>
                <h3 className="empty-title">
                  {searchTerm ? `查無符合「${searchTerm}」的活動` : '查無符合條件的活動'}
                </h3>
                <p className="empty-desc">
                  {searchTerm
                    ? '建議搜尋活動關鍵字（如：恐龍、劇團、音樂會、繪本、市集），或直接瀏覽下方為您精選的推薦活動！'
                    : '嘗試更換選取的縣市、放寬年齡層限制，或是切換其他活動類型看看！'}
                </p>
                <div className="empty-actions-row">
                  <button
                    type="button"
                    className="btn-empty-reset"
                    onClick={handleResetFilters}
                  >
                    重置並查看全部 400+ 檔活動
                  </button>
                  <button
                    type="button"
                    className="btn-empty-sync"
                    onClick={handleSyncCulture}
                    disabled={isSyncing}
                  >
                    <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
                    <span>{isSyncing ? '連線同步中...' : '連線文化部搜尋最新活動'}</span>
                  </button>
                </div>

                {/* 智慧推薦熱門活動，絕不讓家長面對空白頁 */}
                <div className="empty-recommend-section">
                  <h4 className="empty-recommend-title">
                    <Sparkles size={16} className="text-amber" />
                    <span>為您推薦近期最熱門親子活動：</span>
                  </h4>
                  <div className="events-cards-grid">
                    {allEvents.slice(0, 4).map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        isFavorite={favorites.includes(event.id)}
                        onToggleFavorite={toggleFavorite}
                        onOpenDetails={setActiveModalEvent}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="events-cards-grid">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isFavorite={favorites.includes(event.id)}
                    onToggleFavorite={toggleFavorite}
                    onOpenDetails={setActiveModalEvent}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 頁尾提示 */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-title">🎈 台灣親子玩聚地圖 ‧ 未來 2 個月親子情報站</p>
          <p className="footer-sub">
            收錄全台縣市展覽、兒童劇團演出、公家圖書館文化節慶、節氣自然體驗與百貨快閃活動。排除常規補習收費班，陪伴家庭充實週末與假期！
          </p>
        </div>
      </footer>

      {/* 活動詳情與搶票彈窗 */}
      {activeModalEvent && (
        <EventModal
          event={activeModalEvent}
          onClose={() => setActiveModalEvent(null)}
          isFavorite={favorites.includes(activeModalEvent.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* 口袋收藏抽屜 */}
      <FavoritesDrawer
        isOpen={isFavoritesDrawerOpen}
        onClose={() => setIsFavoritesDrawerOpen(false)}
        favorites={favorites}
        allEvents={allEvents}
        onRemoveFavorite={toggleFavorite}
        onSelectEvent={setActiveModalEvent}
      />
    </div>
  );
}

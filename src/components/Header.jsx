import React from 'react';
import { Calendar, BellRing, Bookmark, Search } from 'lucide-react';

function BrandLogoSvg() {
  return (
    <svg viewBox="0 0 128 128" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="headerBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5E62" />
          <stop offset="50%" stopColor="#FF9966" />
          <stop offset="100%" stopColor="#FFA07A" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="120" height="120" rx="28" fill="url(#headerBgGrad)" />
      <path d="M 16,92 Q 22,82 32,84 Q 40,76 52,82 Q 62,84 66,92 Z" fill="#FFFFFF" opacity="0.35" />
      <path d="M 72,100 Q 80,90 92,92 Q 102,86 112,94 Z" fill="#FFFFFF" opacity="0.28" />
      <g transform="translate(64, 52)">
        <path d="M 0,-38 C 26,-38 36,-14 26,10 C 20,24 10,32 6,34 L -6,34 C -10,32 -20,24 -26,10 C -36,-14 -26,-38 0,-38 Z" fill="#FFFFFF" />
        <path d="M -8,-37 C -3,-37 0,-14 -1,34 L -7,34 C -12,30 -19,20 -24,8 C -18,-12 -14,-32 -8,-37 Z" fill="#0EA5E9" />
        <path d="M 8,-37 C 3,-37 0,-14 1,34 L 7,34 C 12,30 19,20 24,8 C 18,-12 14,-32 8,-37 Z" fill="#F43F5E" />
        <path d="M -3,-37.8 C 0,-38 0,-38 3,-37.8 C 3,-10 2,15 1,34 L -1,34 C -2,15 -3,-10 -3,-37.8 Z" fill="#FBBF24" />
        <ellipse cx="-12" cy="-22" rx="5" ry="9" transform="rotate(-25 -12 -22)" fill="#FFFFFF" opacity="0.65" />
        <line x1="-8" y1="34" x2="-6" y2="42" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8" y1="34" x2="6" y2="42" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="-2" y1="34" x2="-2" y2="42" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="34" x2="2" y2="42" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="-9" y="42" width="18" height="12" rx="3.5" fill="#B45309" stroke="#78350F" strokeWidth="1.2" />
        <line x1="-9" y1="46" x2="9" y2="46" stroke="#D97706" strokeWidth="1.5" />
        <polygon points="-6,46 -3,51 0,46" fill="#F59E0B" />
        <polygon points="0,46 3,51 6,46" fill="#10B981" />
      </g>
      <g fill="#FEF08A">
        <path d="M 22,28 Q 28,28 28,22 Q 28,28 34,28 Q 28,28 28,34 Q 28,28 22,28 Z" />
        <path d="M 96,24 Q 103,24 103,17 Q 103,24 110,24 Q 103,24 103,31 Q 103,24 96,24 Z" />
      </g>
      <path d="M 58,114 Q 64,118 70,114" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
    </svg>
  );
}

export default function Header({
  searchTerm,
  onSearchChange,
  onExecuteSearch,
  urgentCount = 0,
  favoriteCount = 0,
  onOpenFavorites,
  onScrollToRadar
}) {
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (onExecuteSearch) {
      onExecuteSearch();
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* 頂部品牌與快速按鈕列 */}
        <div className="header-top-row">
          <div className="brand-group">
            <div className="brand-logo-wrap" title="台灣親子玩聚地圖">
              <BrandLogoSvg />
            </div>
            <div className="brand-texts">
              <div className="brand-title-row">
                <h1 className="brand-title">台灣親子玩聚地圖</h1>
                <span className="brand-pill-beta">
                  <Calendar size={11} />
                  未來 2 個月
                </span>
              </div>
              <p className="brand-subtitle">
                互動地圖 ‧ 年齡篩選 ‧ 展覽/表演/節氣/商場/政府活動 ‧ 搶票防漏
              </p>
            </div>
          </div>

          <div className="header-quick-btns">
            {urgentCount > 0 && (
              <button
                type="button"
                className="btn-radar-alert"
                onClick={onScrollToRadar}
                title="查看即將開賣搶票活動"
              >
                <BellRing size={15} className="radar-bell-pulse" />
                <span className="btn-label-text">搶票預警</span>
                <span className="radar-count-tag">{urgentCount}</span>
              </button>
            )}

            <button
              type="button"
              className="btn-favorites"
              onClick={onOpenFavorites}
              title="查看我的收藏清單"
            >
              <Bookmark size={15} />
              <span className="fav-label btn-label-text">我的收藏</span>
              {favoriteCount > 0 && (
                <span className="fav-count-tag">{favoriteCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* 搜尋列與熱門標籤 */}
        <div className="header-search-bar">
          <form className="search-input-wrapper" onSubmit={handleSubmit}>
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="搜尋活動、恐龍、劇團、商場..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                title="清除搜尋文字"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="search-submit-btn"
              title="立即搜尋全台活動"
            >
              <Search size={13} />
              <span>開始搜尋</span>
            </button>
          </form>

          <div className="header-quick-tags">
            <span className="quick-tags-label">熱門：</span>
            {[
              { label: '📸 IG熱推', query: '推薦' },
              { label: '🎨 造島手作', query: '造島' },
              { label: '🎭 如果劇團', query: '如果兒童劇團' },
              { label: '🐷 豬探長', query: '豬探長' },
              { label: '🎭 兒童劇團', query: '劇團' },
              { label: '🎃 萬聖節', query: '萬聖' },
              { label: '🎄 耶誕城', query: '耶誕' },
              { label: '🐶 史努比', query: '史努比' }
            ].map((item) => (
              <button
                key={item.query}
                type="button"
                className={`quick-tag-btn ${searchTerm === item.query ? 'active' : ''}`}
                onClick={() => onSearchChange(searchTerm === item.query ? '' : item.query)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

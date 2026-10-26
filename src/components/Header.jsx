import React from 'react';
import { Sparkles, Calendar, BellRing, Bookmark, Search, Baby } from 'lucide-react';

export default function Header({
  searchTerm,
  onSearchChange,
  urgentCount = 0,
  favoriteCount = 0,
  onOpenFavorites,
  onScrollToRadar
}) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="brand-logo-wrap">
            <span className="brand-logo-icon">🎈</span>
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">台灣親子玩聚地圖</h1>
              <span className="brand-pill-beta">
                <Calendar size={12} />
                未來 2 個月情報
              </span>
            </div>
            <p className="brand-subtitle">
              互動地圖 ‧ 年齡精準篩選 ‧ 展覽/表演/節氣/百貨/政府活動 ‧ 搶票預約防漏提醒
            </p>
          </div>
        </div>

        {/* 搜尋與操作工具列 */}
        <div className="header-actions">
          <div className="header-search-bar">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="搜尋活動名稱、恐龍、劇團、市立圖書館、商場..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
              >
                ✕
              </button>
            )}
            <div className="header-quick-tags">
              <span className="quick-tags-label">熱門關鍵字：</span>
              {[
                { label: '📸 IG熱推', query: '推薦' },
                { label: '🎨 造島手作', query: '造島' },
                { label: '🎭 如果劇團', query: '如果兒童劇團' },
                { label: '🐷 豬探長', query: '豬探長' },
                { label: '🎭 兒童劇團', query: '劇團' },
                { label: '🎃 萬聖節', query: '萬聖' },
                { label: '🎄 耶誕城', query: '耶誕' },
                { label: '🐶 史努比', query: '史努比' }
              ].map(item => (
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

          <div className="header-quick-btns">
            {urgentCount > 0 && (
              <button
                type="button"
                className="btn-radar-alert"
                onClick={onScrollToRadar}
                title="查看即將開賣搶票活動"
              >
                <BellRing size={16} className="radar-bell-pulse" />
                <span>搶票預警</span>
                <span className="radar-count-tag">{urgentCount}</span>
              </button>
            )}

            <button
              type="button"
              className="btn-favorites"
              onClick={onOpenFavorites}
              title="查看我的收藏清單"
            >
              <Bookmark size={16} />
              <span className="fav-label">我的收藏</span>
              {favoriteCount > 0 && (
                <span className="fav-count-tag">{favoriteCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

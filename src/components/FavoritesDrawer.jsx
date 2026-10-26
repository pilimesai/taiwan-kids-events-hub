import React from 'react';
import { X, Bookmark, Calendar, Clock, MapPin, Trash2, ExternalLink } from 'lucide-react';
import { BOOKING_STATUSES } from '../data/mockEvents';

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites = [],
  allEvents = [],
  onRemoveFavorite,
  onSelectEvent
}) {
  if (!isOpen) return null;

  const favoriteEvents = allEvents.filter(e => favorites.includes(e.id));

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <Bookmark size={20} className="text-amber" />
            <div>
              <h3 className="drawer-title">家長口袋收藏名單</h3>
              <p className="drawer-subtitle">
                共 {favoriteEvents.length} 檔已收藏，方便統籌搶票時間
              </p>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {favoriteEvents.length === 0 ? (
            <div className="drawer-empty-state">
              <div className="empty-icon-wrap">📌</div>
              <h4>目前尚未收藏任何活動</h4>
              <p>在探索地圖或活動卡片上點擊書籤圖示，即可將想搶票的活動加入此處！</p>
            </div>
          ) : (
            <div className="drawer-list">
              {favoriteEvents.map((evt) => {
                const statusInfo = BOOKING_STATUSES[evt.bookingStatus] || BOOKING_STATUSES.booking_open;
                return (
                  <div
                    key={evt.id}
                    className="drawer-item-card"
                    onClick={() => {
                      onSelectEvent(evt);
                      onClose();
                    }}
                  >
                    <div className="drawer-item-top">
                      <span className={`drawer-status-pill ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </span>
                      <button
                        type="button"
                        className="drawer-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFavorite(evt.id);
                        }}
                        title="移出收藏"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <h4 className="drawer-item-title">{evt.title}</h4>

                    <div className="drawer-item-meta">
                      <div className="meta-sub">
                        <MapPin size={12} />
                        <span>{evt.county} ‧ {evt.venue}</span>
                      </div>
                      <div className="meta-sub highlight-date">
                        <Clock size={12} />
                        <span>搶票：{evt.bookingOpenDate || '請見活動頁'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <button
            type="button"
            className="drawer-close-action-btn"
            onClick={onClose}
          >
            返回繼續探索
          </button>
        </div>
      </aside>
    </div>
  );
}

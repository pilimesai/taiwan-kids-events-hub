import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Bookmark,
  Users,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES, BOOKING_STATUSES } from '../data/mockEvents';

export default function EventCard({
  event,
  isFavorite,
  onToggleFavorite,
  onOpenDetails
}) {
  const categoryInfo = CATEGORIES.find(c => c.id === event.category) || CATEGORIES[0];
  const statusInfo = BOOKING_STATUSES[event.bookingStatus] || BOOKING_STATUSES.booking_open;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(event.id);
    if (!isFavorite) {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#F59E0B', '#EC4899', '#3B82F6', '#10B981']
      });
    }
  };

  return (
    <article className="event-card" onClick={() => onOpenDetails(event)}>
      {/* 頂部圖片與浮水印標籤 */}
      <div className="event-card-media">
        <img
          src={event.image}
          alt={event.title}
          className="event-card-img"
          loading="lazy"
        />
        <div className="media-overlay"></div>

        {/* 類別與地區浮動標籤 */}
        <div className="media-top-tags">
          <span
            className="category-badge-chip"
            style={{ backgroundColor: categoryInfo.color }}
          >
            {categoryInfo.name}
          </span>
          <span className="county-badge-chip">
            <MapPin size={11} />
            {event.county}
          </span>
          {event.curator && (
            <span className="curator-badge-chip">
              📸 {event.curator}
            </span>
          )}
        </div>

        {/* 收藏按鈕 */}
        <button
          type="button"
          className={`card-bookmark-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          title={isFavorite ? '已收藏（點擊取消）' : '加入口袋收藏清單'}
        >
          <Bookmark size={18} fill={isFavorite ? '#F59E0B' : 'transparent'} />
        </button>

        {/* 搶票 / 預約狀態警示條 */}
        <div className={`booking-status-ribbon ${statusInfo.badgeClass}`}>
          {event.bookingStatus === 'booking_soon' && <Clock size={12} className="animate-spin-slow" />}
          {event.bookingStatus === 'almost_full' && <ShieldAlert size={12} />}
          {event.bookingStatus === 'free_walkin' && <CheckCircle2 size={12} />}
          <span>{statusInfo.label}</span>
          {event.bookingOpenDate && event.bookingStatus === 'booking_soon' && (
            <span className="open-time-hint">・{event.bookingOpenDate.split(' ')[0].slice(5)}開搶</span>
          )}
        </div>
      </div>

      {/* 卡片內容主體 */}
      <div className="event-card-body">
        {/* 年齡標籤與費用 */}
        <div className="event-specs-row">
          <span className="age-spec-pill">
            <Users size={12} />
            {event.ageLabel}
          </span>
          <span className={`price-spec-pill ${event.isFree ? 'is-free' : ''}`}>
            {event.isFree ? '🎁 免門票' : '🎟️ 售票/需付費'}
          </span>
        </div>

        {/* 標題 */}
        <h3 className="event-card-title" title={event.title}>
          {event.title}
        </h3>

        {/* 地點與場館 */}
        <div className="event-venue-row">
          <MapPin size={14} className="icon-subtle" />
          <span className="venue-name">{event.venue}</span>
        </div>

        {/* 活動日期 */}
        <div className="event-date-row">
          <Calendar size={14} className="icon-subtle" />
          <span className="date-text">
            {event.eventStartDate} ~ {event.eventEndDate}
          </span>
        </div>

        {/* 特色亮點搶先看 (1~2條) */}
        {event.highlights && event.highlights.length > 0 && (
          <ul className="event-card-highlights">
            {event.highlights.slice(0, 2).map((h, i) => (
              <li key={i}>
                <span className="bullet-star">✦</span>
                <span className="highlight-text">{h}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 卡片底部操作區 */}
      <div className="event-card-footer">
        <div className="indoor-tag">
          {event.indoorOutdoorLabel.split('・')[0]}
        </div>
        <button
          type="button"
          className="btn-view-details"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(event);
          }}
        >
          <span>搶票攻略 / 詳情</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
}

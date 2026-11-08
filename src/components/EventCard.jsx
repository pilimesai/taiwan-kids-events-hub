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

  // 計算活動出遊時程標籤 (進行中 / 幾天後開跑)
  const timingBadge = React.useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    const start = event.eventStartDate || todayStr;
    const end = event.eventEndDate || start;
    if (end < todayStr) {
      return { label: '⚠️ 已結束', className: 'timing-expired' };
    }
    if (start <= todayStr && end >= todayStr) {
      return { label: '🟢 進行中', className: 'timing-ongoing' };
    }
    if (start > todayStr) {
      const diffDays = Math.ceil((new Date(start) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        return { label: `⚡ ${diffDays}天內登場`, className: 'timing-soon' };
      }
      if (diffDays <= 7) {
        return { label: `📅 本週登場`, className: 'timing-week' };
      }
      if (diffDays <= 14) {
        return { label: `🗓️ 雙週內`, className: 'timing-future' };
      }
      return { label: `🗓️ ${start.slice(5)}登場`, className: 'timing-future' };
    }
    return null;
  }, [event.eventStartDate, event.eventEndDate]);

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
          {event.sourceType === 'culture_tw' && (
            <span className="culture-badge-chip" title="文化部 iCulture 全國藝文開放資料即時同步">
              🏛️ 文化部同步
            </span>
          )}
          {event.sourceType === 'department_store' && (
            <span className="dept-badge-chip" title="全台各大百貨商場最新快閃特展">
              🛍️ 百貨特展快閃
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
        {/* 年齡標籤、費用與時程 */}
        <div className="event-specs-row">
          <span className="age-spec-pill">
            <Users size={12} />
            {event.ageLabel}
          </span>
          <span className={`price-spec-pill ${event.isFree ? 'is-free' : ''}`}>
            {event.isFree ? '🎁 免門票' : '🎟️ 售票/需付費'}
          </span>
          {timingBadge && (
            <span className={`timing-spec-pill ${timingBadge.className}`}>
              {timingBadge.label}
            </span>
          )}
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

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Bookmark,
  Share2,
  Users,
  AlertTriangle,
  Sparkles,
  Download,
  CheckCircle,
  Building2,
  Umbrella
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES, BOOKING_STATUSES } from '../data/mockEvents';

export default function EventModal({
  event,
  onClose,
  isFavorite,
  onToggleFavorite
}) {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const categoryInfo = CATEGORIES.find(c => c.id === event.category) || CATEGORIES[0];
  const statusInfo = BOOKING_STATUSES[event.bookingStatus] || BOOKING_STATUSES.booking_open;

  // 生成 Google Calendar 連結
  const generateGoogleCalendarUrl = () => {
    const startDateClean = event.eventStartDate.replace(/-/g, '');
    const endDateClean = event.eventEndDate.replace(/-/g, '');
    const title = encodeURIComponent(`【親子行程】${event.title}`);
    const details = encodeURIComponent(
      `場地：${event.venue}\n地址：${event.address}\n年齡：${event.ageLabel}\n搶票/預約：${event.bookingPlatform} (${event.bookingOpenDate || '請見活動頁'})\n提醒：${event.notice}`
    );
    const location = encodeURIComponent(`${event.venue}, ${event.address}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateClean}/${endDateClean}&details=${details}&location=${location}`;
  };

  // 匯出 .ics 行事曆檔案
  const downloadIcsFile = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Taiwan Kids Events Hub//TW',
      'BEGIN:VEVENT',
      `SUMMARY:【親子】${event.title}`,
      `DESCRIPTION:${event.notice} 預約管道：${event.bookingPlatform}`,
      `LOCATION:${event.venue} (${event.address})`,
      `DTSTART;VALUE=DATE:${event.eventStartDate.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${event.eventEndDate.replace(/-/g, '')}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleFavorite = () => {
    onToggleFavorite(event.id);
    if (!isFavorite) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* 頂部關閉與操作 */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="關閉視窗"
        >
          <X size={20} />
        </button>

        {/* 橫幅大圖區 */}
        <div className="modal-hero">
          <img
            src={event.image}
            alt={event.title}
            className="modal-hero-image"
          />
          <div className="modal-hero-gradient"></div>

          <div className="modal-hero-tags">
            <span
              className="modal-category-chip"
              style={{ backgroundColor: categoryInfo.color }}
            >
              {categoryInfo.name}
            </span>
            <span className={`modal-status-chip ${statusInfo.badgeClass}`}>
              {statusInfo.label}
            </span>
            <span className="modal-weather-chip">
              <Umbrella size={12} />
              {event.indoorOutdoorLabel}
            </span>
            {event.curator && (
              <span className="modal-curator-chip">
                📸 {event.curator} 精選推薦
              </span>
            )}
          </div>

          <h2 className="modal-title">{event.title}</h2>
        </div>

        {/* 彈窗內容卷軸 */}
        <div className="modal-content-scroll">
          {/* 搶票與預約戰情室 (重點功能) */}
          <div className="ticket-war-room">
            <div className="war-room-header">
              <div className="war-room-title">
                <Clock className="icon-pulse" size={18} />
                <span>搶票與報名資訊</span>
              </div>
              <span className="war-room-badge">{event.bookingPlatform}</span>
            </div>

            <div className="war-room-grid">
              <div className="war-room-item">
                <span className="item-label">開放預約 / 搶票時間</span>
                <span className="item-value highlight-gold">
                  {event.bookingOpenDate || '目前已開放登記中'}
                </span>
              </div>
              <div className="war-room-item">
                <span className="item-label">票價 / 費用說明</span>
                <span className="item-value">
                  {event.ticketPrice}
                </span>
              </div>
              <div className="war-room-item">
                <span className="item-label">適合年齡建議</span>
                <span className="item-value">
                  {event.ageLabel} (約 {event.minAge} ~ {event.maxAge} 歲)
                </span>
              </div>
              <div className="war-room-item">
                <span className="item-label">活動展演期間</span>
                <span className="item-value">
                  {event.eventStartDate} 至 {event.eventEndDate}
                </span>
              </div>
            </div>

            {/* 家長搶票與入場小提醒 */}
            {event.notice && (
              <div className="war-room-notice">
                <AlertTriangle size={16} className="notice-icon" />
                <div className="notice-body">
                  <strong>家長卡位提醒：</strong>
                  <span>{event.notice}</span>
                </div>
              </div>
            )}

            {/* 搶票直接前往按鈕群 */}
            <div className="war-room-actions">
              <a
                href={event.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-booking-primary"
              >
                <span>前往官方預約 / 購票平台</span>
                <ExternalLink size={16} />
              </a>

              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-calendar-secondary"
                title="加入 Google 日曆提醒"
              >
                <Calendar size={15} />
                <span>加入 Google 日曆</span>
              </a>

              <button
                type="button"
                className="btn-ics-download"
                onClick={downloadIcsFile}
                title="下載 .ics 行事曆檔案"
              >
                <Download size={15} />
                <span>匯出 .ics</span>
              </button>
            </div>
          </div>

          {/* 活動亮點 */}
          <div className="modal-section">
            <h3 className="section-title">
              <Sparkles size={17} className="text-amber" />
              <span>活動亮點與特色</span>
            </h3>
            <ul className="modal-highlights-list">
              {event.highlights.map((item, idx) => (
                <li key={idx} className="highlight-item">
                  <CheckCircle size={16} className="check-icon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 地點與主辦資訊 */}
          <div className="modal-section">
            <h3 className="section-title">
              <MapPin size={17} className="text-blue" />
              <span>場地與交通位置</span>
            </h3>
            <div className="venue-detail-card">
              <div className="venue-row">
                <Building2 size={16} />
                <span className="venue-title-text">{event.venue}</span>
              </div>
              <div className="venue-address-row">
                <span className="address-text">{event.address}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue + ' ' + event.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="google-maps-link"
                >
                  在 Google 地圖中開啟 <ExternalLink size={12} />
                </a>
              </div>
              <div className="organizer-text">
                主辦單位：{event.organizer}
              </div>
            </div>
          </div>
        </div>

        {/* 底部功能按鈕 */}
        <div className="modal-footer">
          <button
            type="button"
            className={`btn-fav-toggle ${isFavorite ? 'favorited' : ''}`}
            onClick={handleFavorite}
          >
            <Bookmark size={16} fill={isFavorite ? '#F59E0B' : 'transparent'} />
            <span>{isFavorite ? '已在我的收藏' : '加入口袋收藏'}</span>
          </button>

          <button
            type="button"
            className="btn-share-link"
            onClick={handleShare}
          >
            <Share2 size={16} />
            <span>{copied ? '已複製分享連結！' : '分享活動'}</span>
          </button>

          <button
            type="button"
            className="btn-modal-close-action"
            onClick={onClose}
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}

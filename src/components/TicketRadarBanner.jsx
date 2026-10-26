import React from 'react';
import { AlertCircle, Clock, ExternalLink, Calendar, MapPin, ChevronRight, Flame } from 'lucide-react';

export default function TicketRadarBanner({ urgentEvents = [], onSelectEvent }) {
  if (!urgentEvents.length) return null;

  return (
    <section className="ticket-radar-section" id="ticket-radar-section">
      <div className="radar-header">
        <div className="radar-title-box">
          <div className="radar-flame-icon">
            <Flame size={20} />
          </div>
          <div>
            <h2 className="radar-title">搶票與預約雷達 ‧ 提早卡位不向隅</h2>
            <p className="radar-desc">
              熱門親子特展、紙風車劇團與夜宿活動通常開賣即秒殺！特別為您彙整未來 14 天內開搶與名額告急活動：
            </p>
          </div>
        </div>
        <div className="radar-badge-pulse">
          <Clock size={14} />
          <span>{urgentEvents.length} 檔熱門預約倒數中</span>
        </div>
      </div>

      <div className="radar-cards-scroll">
        {urgentEvents.map((event) => {
          return (
            <div
              key={event.id}
              className="radar-card"
              onClick={() => onSelectEvent(event)}
            >
              <div className="radar-card-top">
                <span className="radar-urgent-tag">
                  {event.bookingStatus === 'booking_soon' ? '⏳ 即將開搶' : '🔥 名額告急'}
                </span>
                <span className="radar-location-tag">
                  <MapPin size={11} />
                  {event.county}
                </span>
              </div>

              <h4 className="radar-event-title">{event.title}</h4>

              <div className="radar-open-time">
                <Clock size={12} />
                <span>開搶日：<strong>{event.bookingOpenDate}</strong></span>
              </div>

              <div className="radar-meta-row">
                <span className="radar-platform">{event.bookingPlatform}</span>
                <span className="radar-view-link">
                  查看詳情 <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import React from 'react';
import { Camera, Sparkles, ExternalLink, Compass, Heart, ArrowUpRight } from 'lucide-react';
import { IG_CURATORS } from '../data/mockEvents';

export default function IgInfluencersBanner({ onSelectCurator, activeCuratorQuery }) {
  if (!IG_CURATORS || !IG_CURATORS.length) return null;

  return (
    <section className="ig-curators-section" id="ig-curators-section">
      <div className="ig-curators-header">
        <div className="ig-header-title-box">
          <div className="ig-logo-icon">
            <Camera size={20} />
          </div>
          <div>
            <div className="ig-title-row">
              <h2 className="ig-section-title">熱門親子 IG / 社群達人每週推薦</h2>
              <span className="ig-hot-badge">
                <Sparkles size={12} />
                媽媽圈熱議平台
              </span>
            </div>
            <p className="ig-section-desc">
              追蹤全台親子旅遊與週末去哪玩人氣帳號，點擊卡片一鍵篩出達人精選活動與特色手作體驗：
            </p>
          </div>
        </div>
      </div>

      <div className="ig-cards-grid">
        {IG_CURATORS.map((curator) => {
          const isActive = activeCuratorQuery === curator.tagQuery;
          return (
            <div
              key={curator.id}
              className={`ig-curator-card ${isActive ? 'active' : ''}`}
              style={{ '--accent-color': curator.accentColor }}
            >
              <div className="curator-card-top">
                <div className="curator-avatar-badge">{curator.avatar}</div>
                <div className="curator-meta">
                  <div className="curator-name-row">
                    <h4 className="curator-name">{curator.name}</h4>
                    <span className="curator-badge-pill">{curator.badge}</span>
                  </div>
                  <span className="curator-handle">{curator.handle}</span>
                </div>
              </div>

              <p className="curator-desc">{curator.desc}</p>

              <div className="curator-card-actions">
                <button
                  type="button"
                  className={`curator-filter-btn ${isActive ? 'selected' : ''}`}
                  onClick={() => onSelectCurator(isActive ? '' : curator.tagQuery)}
                >
                  <Compass size={13} />
                  <span>{isActive ? '✓ 顯示中（點擊取消）' : '查看精選活動'}</span>
                </button>

                <a
                  href={curator.igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="curator-ig-link"
                  title={`前往 ${curator.name} 社群粉專`}
                >
                  <span>社群追蹤</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

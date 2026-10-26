import React, { useState } from 'react';
import { MapPin, Sparkles, Navigation, Layers } from 'lucide-react';
import { REGIONS } from '../data/mockEvents';

// 定義精確美觀的台灣縣市 SVG 路徑及定位中心點
const TAIWAN_COUNTIES = [
  {
    id: '基隆市',
    name: '基隆市',
    region: 'north',
    center: [365, 80],
    path: 'M 352,70 L 372,66 L 380,78 L 368,88 L 350,82 Z'
  },
  {
    id: '臺北市',
    name: '臺北市',
    region: 'north',
    center: [340, 102],
    path: 'M 326,92 L 350,88 L 358,102 L 348,118 L 328,112 L 324,98 Z'
  },
  {
    id: '新北市',
    name: '新北市',
    region: 'north',
    center: [330, 135],
    path: 'M 318,72 L 350,65 L 388,72 L 400,105 L 385,140 L 360,155 L 325,162 L 298,135 L 305,100 L 324,88 L 322,118 L 348,124 L 362,102 L 348,84 L 322,88 Z'
  },
  {
    id: '桃園市',
    name: '桃園市',
    region: 'north',
    center: [288, 142],
    path: 'M 292,102 L 316,132 L 324,162 L 308,188 L 278,168 L 268,138 L 278,112 Z'
  },
  {
    id: '新竹市',
    name: '新竹市',
    region: 'north',
    center: [256, 172],
    path: 'M 250,165 L 268,166 L 266,182 L 248,180 Z'
  },
  {
    id: '新竹縣',
    name: '新竹縣',
    region: 'north',
    center: [282, 190],
    path: 'M 268,165 L 278,168 L 308,188 L 300,218 L 275,225 L 260,198 L 268,182 Z'
  },
  {
    id: '宜蘭縣',
    name: '宜蘭縣',
    region: 'north',
    center: [365, 185],
    path: 'M 362,152 L 385,138 L 402,155 L 388,212 L 358,235 L 338,208 L 345,178 Z'
  },
  {
    id: '苗栗縣',
    name: '苗栗縣',
    region: 'central',
    center: [255, 230],
    path: 'M 248,185 L 275,222 L 298,218 L 285,258 L 245,268 L 230,238 L 235,205 Z'
  },
  {
    id: '臺中市',
    name: '臺中市',
    region: 'central',
    center: [270, 285],
    path: 'M 242,268 L 285,256 L 332,238 L 328,285 L 295,315 L 255,322 L 218,300 L 222,278 Z'
  },
  {
    id: '彰化縣',
    name: '彰化縣',
    region: 'central',
    center: [215, 325],
    path: 'M 215,302 L 252,320 L 242,352 L 202,345 L 192,320 Z'
  },
  {
    id: '南投縣',
    name: '南投縣',
    region: 'central',
    center: [288, 350],
    path: 'M 288,285 L 328,282 L 335,325 L 325,385 L 292,410 L 262,395 L 250,335 Z'
  },
  {
    id: '雲林縣',
    name: '雲林縣',
    region: 'central',
    center: [205, 375],
    path: 'M 198,345 L 242,352 L 255,388 L 220,405 L 178,390 L 180,362 Z'
  },
  {
    id: '嘉義市',
    name: '嘉義市',
    region: 'south',
    center: [215, 412],
    path: 'M 208,405 L 225,404 L 224,418 L 208,416 Z'
  },
  {
    id: '嘉義縣',
    name: '嘉義縣',
    region: 'south',
    center: [235, 425],
    path: 'M 178,392 L 220,404 L 258,388 L 285,410 L 275,448 L 230,455 L 185,442 L 170,418 Z'
  },
  {
    id: '臺南市',
    name: '臺南市',
    region: 'south',
    center: [205, 480],
    path: 'M 172,438 L 225,452 L 265,450 L 260,495 L 225,520 L 175,510 L 165,465 Z'
  },
  {
    id: '高雄市',
    name: '高雄市',
    region: 'south',
    center: [240, 520],
    path: 'M 222,485 L 262,455 L 290,442 L 288,505 L 268,548 L 242,572 L 205,550 L 185,532 L 210,518 Z'
  },
  {
    id: '屏東縣',
    name: '屏東縣',
    region: 'south',
    center: [255, 605],
    path: 'M 242,568 L 268,545 L 280,562 L 282,625 L 272,670 L 252,675 L 242,630 L 238,585 Z'
  },
  {
    id: '花蓮縣',
    name: '花蓮縣',
    region: 'east',
    center: [350, 315],
    path: 'M 358,235 L 388,215 L 398,285 L 368,395 L 330,422 L 324,360 L 335,285 Z'
  },
  {
    id: '臺東縣',
    name: '臺東縣',
    region: 'east',
    center: [315, 500],
    path: 'M 330,420 L 368,398 L 358,495 L 322,575 L 282,598 L 280,555 L 290,485 Z'
  }
];

// 外島離島群組（獨立可點擊區域）
const ISLANDS = [
  { id: '澎湖縣', name: '澎湖縣', region: 'islands', x: 75, y: 350, radius: 24, countKey: '澎湖縣' },
  { id: '金門縣', name: '金門縣', region: 'islands', x: 65, y: 220, radius: 20, countKey: '金門縣' },
  { id: '連江縣', name: '連江縣(馬祖)', region: 'islands', x: 65, y: 110, radius: 18, countKey: '連江縣' }
];

export default function TaiwanMap({
  selectedCounty,
  onSelectCounty,
  selectedRegion,
  onSelectRegion,
  events = []
}) {
  const [hoveredCounty, setHoveredCounty] = useState(null);

  // 計算各縣市活動數
  const countyCounts = React.useMemo(() => {
    const counts = {};
    events.forEach(evt => {
      counts[evt.county] = (counts[evt.county] || 0) + 1;
    });
    return counts;
  }, [events]);

  // 取得縣市主要活動預覽
  const getTopEventForCounty = (countyName) => {
    return events.find(e => e.county === countyName);
  };

  const handleCountyClick = (countyId) => {
    if (selectedCounty === countyId) {
      onSelectCounty('all'); // 再次點擊取消單一縣市篩選
    } else {
      onSelectCounty(countyId);
    }
  };

  const handleRegionPillClick = (regionId) => {
    if (selectedRegion === regionId && selectedCounty === 'all') {
      onSelectRegion('all');
    } else {
      onSelectRegion(regionId);
      onSelectCounty('all');
    }
  };

  const activeHoverData = hoveredCounty ? {
    name: hoveredCounty,
    count: countyCounts[hoveredCounty] || 0,
    topEvent: getTopEventForCounty(hoveredCounty)
  } : null;

  return (
    <div className="taiwan-map-card">
      <div className="map-card-header">
        <div className="map-title-wrap">
          <div className="map-icon-badge">
            <Navigation className="icon-pulse" size={18} />
          </div>
          <div>
            <h3 className="map-title">台灣探索地圖</h3>
            <p className="map-subtitle">點擊縣市或區域立即鎖定近 2 個月活動</p>
          </div>
        </div>

        {/* 區域快速切換標籤 */}
        <div className="region-pills">
          <button
            type="button"
            className={`region-pill ${selectedRegion === 'all' && selectedCounty === 'all' ? 'active' : ''}`}
            onClick={() => {
              onSelectRegion('all');
              onSelectCounty('all');
            }}
          >
            全台灣 ({events.length})
          </button>
          {Object.values(REGIONS).map(r => {
            const countInRegion = events.filter(e => r.counties.includes(e.county)).length;
            const isActive = selectedRegion === r.id;
            return (
              <button
                key={r.id}
                type="button"
                className={`region-pill ${isActive ? 'active' : ''}`}
                style={{
                  '--region-color': r.color
                }}
                onClick={() => handleRegionPillClick(r.id)}
              >
                <span className="region-dot" style={{ backgroundColor: r.color }}></span>
                {r.shortName} ({countInRegion})
              </button>
            );
          })}
        </div>
      </div>

      {/* 地圖互動主視窗 */}
      <div className="map-svg-container">
        {/* 地圖左上離島外框提示 */}
        <div className="islands-box">
          <div className="islands-header">
            <Layers size={13} />
            <span>外島離島</span>
          </div>
          <div className="islands-list">
            {ISLANDS.map(isle => {
              const count = countyCounts[isle.countKey] || 0;
              const isSelected = selectedCounty === isle.countKey;
              return (
                <button
                  key={isle.id}
                  type="button"
                  className={`island-btn ${isSelected ? 'active' : ''} ${count > 0 ? 'has-events' : ''}`}
                  onClick={() => handleCountyClick(isle.countKey)}
                  onMouseEnter={() => setHoveredCounty(isle.countKey)}
                  onMouseLeave={() => setHoveredCounty(null)}
                >
                  <span className="island-name">{isle.name}</span>
                  <span className={`island-count ${count > 0 ? 'highlight' : ''}`}>
                    {count} 檔
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SVG 地圖主體 */}
        <svg
          viewBox="140 40 280 650"
          className="taiwan-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3B82F6" floodOpacity="0.35" />
            </filter>
            <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#F59E0B" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* 台灣本島各縣市形狀 */}
          <g className="counties-group">
            {TAIWAN_COUNTIES.map((c) => {
              const count = countyCounts[c.name] || 0;
              const isSelected = selectedCounty === c.name;
              const isRegionActive = selectedRegion === 'all' || selectedRegion === c.region;
              const isHovered = hoveredCounty === c.name;

              let fillColor = '#E2E8F0';
              if (count > 0) {
                fillColor = '#BAE6FD'; // 有活動預設淡藍
              }
              if (isHovered) {
                fillColor = '#38BDF8';
              }
              if (isSelected) {
                fillColor = '#F59E0B'; // 選中亮琥珀橘
              }

              return (
                <g key={c.id} className="county-element">
                  <path
                    d={c.path}
                    className={`county-path ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${!isRegionActive ? 'dimmed' : ''}`}
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    filter={isSelected ? 'url(#activeGlow)' : (isHovered ? 'url(#glow)' : undefined)}
                    onClick={() => handleCountyClick(c.name)}
                    onMouseEnter={() => setHoveredCounty(c.name)}
                    onMouseLeave={() => setHoveredCounty(null)}
                  />

                  {/* 標記縣市名稱與活動數圓點標籤 */}
                  <g
                    transform={`translate(${c.center[0]}, ${c.center[1]})`}
                    className={`county-label-group ${isSelected ? 'selected' : ''} ${!isRegionActive ? 'dimmed' : ''}`}
                    onClick={() => handleCountyClick(c.name)}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  >
                    {count > 0 && (
                      <circle
                        cx="0"
                        cy="-8"
                        r={count > 2 ? 8.5 : 7}
                        className="event-count-badge-bg"
                        fill={isSelected ? '#78350F' : '#0284C7'}
                      />
                    )}
                    {count > 0 && (
                      <text
                        x="0"
                        y="-5"
                        textAnchor="middle"
                        className="event-count-text"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="700"
                      >
                        {count}
                      </text>
                    )}
                    <text
                      x="0"
                      y={count > 0 ? "7" : "3"}
                      textAnchor="middle"
                      className="county-text"
                      fill={isSelected ? '#1E293B' : (count > 0 ? '#0F172A' : '#64748B')}
                      fontSize={isSelected ? '11.5' : '10'}
                      fontWeight={isSelected || count > 0 ? '700' : '500'}
                    >
                      {c.name.replace('市', '').replace('縣', '')}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 懸停浮動資訊小卡片 */}
        {activeHoverData && (
          <div className="map-hover-card">
            <div className="hover-card-header">
              <span className="hover-county-badge">
                <MapPin size={12} />
                {activeHoverData.name}
              </span>
              <span className="hover-event-count">
                {activeHoverData.count > 0 ? `${activeHoverData.count} 檔精選活動` : '目前無活動'}
              </span>
            </div>
            {activeHoverData.topEvent ? (
              <div className="hover-event-preview">
                <div className="hover-event-title">{activeHoverData.topEvent.title}</div>
                <div className="hover-event-meta">
                  <span className="hover-venue">{activeHoverData.topEvent.venue}</span>
                  <span className="hover-date">{activeHoverData.topEvent.eventStartDate} 起</span>
                </div>
              </div>
            ) : (
              <div className="hover-event-empty">點擊查看鄰近縣市精彩活動</div>
            )}
          </div>
        )}
      </div>

      {/* 地圖底部選取狀態提示列 */}
      <div className="map-footer-status">
        <div className="current-status-text">
          <span className="status-label">當前地區：</span>
          <span className="status-value">
            {selectedCounty !== 'all' ? (
              <strong>{selectedCounty}</strong>
            ) : selectedRegion !== 'all' ? (
              <strong>{REGIONS[selectedRegion]?.name || '指定區域'}</strong>
            ) : (
              <strong>全台灣</strong>
            )}
          </span>
          <span className="status-badge">
            {events.filter(e => {
              if (selectedCounty !== 'all') return e.county === selectedCounty;
              if (selectedRegion !== 'all') return REGIONS[selectedRegion]?.counties.includes(e.county);
              return true;
            }).length} 檔活動
          </span>
        </div>
        {(selectedCounty !== 'all' || selectedRegion !== 'all') && (
          <button
            type="button"
            className="clear-map-filter-btn"
            onClick={() => {
              onSelectCounty('all');
              onSelectRegion('all');
            }}
          >
            重置為全台
          </button>
        )}
      </div>
    </div>
  );
}

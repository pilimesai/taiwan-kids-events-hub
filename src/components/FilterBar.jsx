import React from 'react';
import {
  Compass,
  Drama,
  Landmark,
  SunMedium,
  ShoppingBag,
  Sparkles,
  Baby,
  Smile,
  GraduationCap,
  Users,
  Filter,
  Check,
  Umbrella,
  Ticket,
  Search
} from 'lucide-react';
import { CATEGORIES, AGE_PRESETS } from '../data/mockEvents';

const categoryIcons = {
  Compass,
  Drama,
  Landmark,
  SunMedium,
  ShoppingBag,
  Sparkles
};

const ageIcons = {
  Baby,
  Smile,
  GraduationCap,
  Users
};

export default function FilterBar({
  selectedCategory,
  onSelectCategory,
  selectedAgePreset,
  onSelectAgePreset,
  customAge,
  onCustomAgeChange,
  bookingFilter,
  onBookingFilterChange,
  onlyFree,
  onToggleOnlyFree,
  indoorFilter,
  onIndoorFilterChange,
  totalResultsCount = 0,
  onExecuteSearch
}) {
  return (
    <div className="filter-panel">
      {/* 類別篩選群組 */}
      <div className="filter-section category-section">
        <div className="filter-section-title">
          <span className="filter-badge">1</span>
          <span>活動類型（排除常規補習收費課程）</span>
        </div>
        <div className="category-chips-list">
          {CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat.icon] || Sparkles;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-chip ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <Icon size={16} className="chip-icon" />
                <span className="chip-name">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 年齡層篩選群組 */}
      <div className="filter-section age-section">
        <div className="filter-row-between">
          <div className="filter-section-title">
            <span className="filter-badge">2</span>
            <span>適合年齡層</span>
          </div>

          {/* 精確年齡輸入 */}
          <div className="custom-age-input-box">
            <span className="custom-age-label">輸入寶貝年齡：</span>
            <div className="custom-age-field">
              <input
                type="number"
                min="0"
                max="18"
                placeholder="歲數"
                value={customAge}
                onChange={(e) => onCustomAgeChange(e.target.value)}
                className="age-number-input"
              />
              <span className="age-unit">歲</span>
            </div>
            {customAge && (
              <button
                type="button"
                className="clear-age-btn"
                onClick={() => onCustomAgeChange('')}
                title="清除精準年齡"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="age-chips-list">
          {AGE_PRESETS.map((age) => {
            const Icon = ageIcons[age.icon] || Users;
            const isSelected = !customAge && selectedAgePreset === age.id;
            return (
              <button
                key={age.id}
                type="button"
                className={`age-chip ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  onCustomAgeChange(''); // 清除自訂年齡，啟用預設標籤
                  onSelectAgePreset(age.id);
                }}
              >
                <Icon size={15} />
                <span>{age.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 進階條件快捷列 (搶票狀態、免費、室內雨天) */}
      <div className="filter-section extra-conditions-section">
        <div className="conditions-grid">
          {/* 搶票狀態 */}
          <div className="condition-item">
            <label className="condition-label">
              <Ticket size={13} />
              預約與搶票狀態：
            </label>
            <select
              value={bookingFilter}
              onChange={(e) => onBookingFilterChange(e.target.value)}
              className="condition-select"
            >
              <option value="all">全部預約狀態</option>
              <option value="booking_soon">⏳ 即將開搶預告（提前佈局）</option>
              <option value="booking_open">🎟️ 搶票預約中（席位有限）</option>
              <option value="free_walkin">🏃 免預約自由入場（說走就走）</option>
              <option value="tickets_selling">🎫 常態購票中</option>
            </select>
          </div>

          {/* 室內 / 戶外 */}
          <div className="condition-item">
            <label className="condition-label">
              <Umbrella size={13} />
              氣候與場地：
            </label>
            <select
              value={indoorFilter}
              onChange={(e) => onIndoorFilterChange(e.target.value)}
              className="condition-select"
            >
              <option value="all">不拘室內外</option>
              <option value="indoor">室內空調・雨天備案首選</option>
              <option value="outdoor">戶外自然・大草皮放電</option>
              <option value="both">室內外兼具園區</option>
            </select>
          </div>

          {/* 只看免費活動開關 */}
          <div className="condition-item condition-toggle">
            <label className="toggle-switch-label">
              <input
                type="checkbox"
                checked={onlyFree}
                onChange={(e) => onToggleOnlyFree(e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">只看免費入場活動</span>
            </label>
          </div>
        </div>
      </div>

      {/* 底部開始搜尋按鈕 */}
      <div className="filter-search-footer">
        <button
          type="button"
          className="filter-execute-search-btn"
          onClick={() => onExecuteSearch?.()}
        >
          <Search size={16} />
          <span>開始搜尋符合條件活動（即時彙整 {totalResultsCount} 檔）</span>
        </button>
      </div>
    </div>
  );
}

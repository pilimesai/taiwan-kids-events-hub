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
  Search,
  Layers,
  Calendar,
  Clock,
  Hourglass
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
  selectedDaysPreset = 'all',
  onSelectDaysPreset,
  customDays = '',
  onCustomDaysChange,
  bookingFilter,
  onBookingFilterChange,
  onlyFree,
  onToggleOnlyFree,
  indoorFilter,
  onIndoorFilterChange,
  dataSource = 'all',
  onDataSourceChange,
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

      {/* 活動時程（幾日內的活動篩選） */}
      <div className="filter-section days-section">
        <div className="filter-row-between">
          <div className="filter-section-title">
            <span className="filter-badge">3</span>
            <span>活動時程（選擇幾日內活動）</span>
          </div>

          {/* 自訂天數輸入 */}
          <div className="custom-days-input-box">
            <span className="custom-days-label">自訂天數：</span>
            <div className="custom-days-field">
              <input
                type="number"
                min="1"
                max="90"
                placeholder="天數"
                value={customDays}
                onChange={(e) => onCustomDaysChange?.(e.target.value)}
                className="days-number-input"
              />
              <span className="days-unit">天內</span>
            </div>
            {customDays && (
              <button
                type="button"
                className="clear-days-btn"
                onClick={() => onCustomDaysChange?.('')}
                title="清除自訂天數"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="days-chips-list">
          {[
            { id: 'all', label: '全部檔期 (不限天數)', icon: Calendar, days: null },
            { id: '3', label: '⚡ 未來 3 天內 (本週末出發)', icon: Clock, days: 3 },
            { id: '7', label: '📅 未來 7 天內 (一週內放電)', icon: Calendar, days: 7 },
            { id: '14', label: '🗓️ 未來 14 天內 (雙週行程)', icon: Calendar, days: 14 },
            { id: '30', label: '🎪 未來 30 天內 (近一個月)', icon: Hourglass, days: 30 }
          ].map((preset) => {
            const Icon = preset.icon;
            const isSelected = !customDays && selectedDaysPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`days-chip ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  onCustomDaysChange?.('');
                  onSelectDaysPreset?.(preset.id);
                }}
              >
                <Icon size={14} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 進階條件快捷列 (搶票狀態、免費、室內雨天) */}
      <div className="filter-section extra-conditions-section">
        <div className="filter-section-title-subtle">
          <span className="filter-badge">4</span>
          <span>進階條件篩選</span>
        </div>
        <div className="conditions-grid">
          {/* 資料來源切換 */}
          <div className="condition-item">
            <label className="condition-label">
              <Layers size={13} />
              資料來源：
            </label>
            <select
              value={dataSource}
              onChange={(e) => onDataSourceChange?.(e.target.value)}
              className="condition-select highlight-source"
            >
              <option value="all">🌟 全台全部活動 (百貨商場 + 文化部 + 精選)</option>
              <option value="department">🛍️ 各大百貨商場特展快閃 (新光三越/SOGO/巨城/三井/漢神)</option>
              <option value="culture">🏛️ 文化部 iCulture 即時開放資料</option>
              <option value="curated">🎯 特色精選搶票活動</option>
            </select>
          </div>

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

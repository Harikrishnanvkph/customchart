import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ChartSettings = ({
  showChartSettings,
  setShowChartSettings,
  valueFontSize,
  setValueFontSize,
  showBorder,
  setShowBorder,
  borderThickness,
  setBorderThickness,
}) => {

  const dflexCenterX = "d-flex align-items-center"

  return (
    <div className="collapsible-container chart-settings">
      <div
        onClick={() => setShowChartSettings((prev) => !prev)}
        className="collapsible-header"
      >
        {showChartSettings ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        Chart Settings
      </div>

      {showChartSettings && (
        <div className="collapsible-content d-flex justify-content-around align-items-center">
          <label className="block-label">
            Value Font Size:&nbsp;
            <input
              type="number"
              min="8"
              max="40"
              value={valueFontSize}
              onChange={(e) => setValueFontSize(Number(e.target.value))}
              className="small-input"
            />
          </label>

          <label className={`block-label ${dflexCenterX}`}>
            <input
              type="checkbox"
              checked={showBorder}
              onChange={(e) => setShowBorder(e.target.checked)}
              className="checkbox-input"
            />
            Border
          </label>

          {showBorder && (
            <label className="block-label">
              Thickness:&nbsp;
              <input
                type="number"
                min="0"
                max="10"
                value={borderThickness}
                onChange={(e) => setBorderThickness(Number(e.target.value))}
                className="small-input"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartSettings;

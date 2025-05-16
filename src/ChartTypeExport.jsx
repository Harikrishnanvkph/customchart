import React from 'react';
import { Download } from 'lucide-react';

const ChartTypeExport = ({
  chartType,
  setChartType,
  selectedExportFormat,
  setSelectedExportFormat,
  exportChartAsImage,
}) => {
  return (
    <div className="chart-top-section">
      <label>
        Chart Type:&nbsp;
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="select-input"
        >
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
        </select>
      </label>

      <label>
        Export as:&nbsp;
        <select
          value={selectedExportFormat}
          onChange={(e) => setSelectedExportFormat(e.target.value)}
          className="select-input"
        >
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WEBP</option>
          <option value="csv">CSV</option>
        </select>
      </label>

      <button
        onClick={() => exportChartAsImage(selectedExportFormat)}
        className="btn export-btn"
        title="Export chart"
      >
        <Download size={16} />
        Export
      </button>
    </div>
  );
};

export default ChartTypeExport;

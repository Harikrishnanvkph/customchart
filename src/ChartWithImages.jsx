import React, { useState, useRef } from 'react';
import BarChart from './BarChart';
import PieChart from './PieChart';
import ChartTypeExport from './ChartTypeExport';
import ChartSettings from './ChartSettings';
import SliceManagement from './SliceManagement';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const ChartWithImagesAndToggle = () => {
  const [chartType, setChartType] = useState('bar');
  const [slices, setSlices] = useState([
    { label: 'Apples', value: 60, imageURL: '', color: '#FF6384' },
    { label: 'Bananas', value: 100, imageURL: '', color: '#FFCE56' },
    { label: 'Cherries', value: 50, imageURL: '', color: '#4BC0C0' },
  ]);
  const [visibleLabels, setVisibleLabels] = useState(slices.map((s) => String(s.label)));

  const [selectedLabel, setSelectedLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editData, setEditData] = useState({ label: '', value: '', imageURL: '', color: '#000000', localImage: null });

  const [selectedExportFormat, setSelectedExportFormat] = useState('png');
  const chartRef = useRef(null);

  const [showChartSettings, setShowChartSettings] = useState(false);
  const [showSliceManagement, setShowSliceManagement] = useState(false);
  const [valueFontSize, setValueFontSize] = useState(12);
  const [showBorder, setShowBorder] = useState(true);
  const [borderThickness, setBorderThickness] = useState(1);

  const handleSelectSlice = (label) => {
    setSelectedLabel(label);
    setIsAdding(false);
    const slice = slices.find((s) => s.label === label);
    if (slice) {
      setEditData({
        label: slice.label,
        value: slice.value,
        imageURL: slice.imageURL || '',
        color: slice.color || '#000000',
        localImage: null,
      });
    } else {
      setEditData({ label: '', value: '', imageURL: '', color: '#000000', localImage: null });
    }
  };

  const handleAddClick = () => {
    setSelectedLabel('');
    setIsAdding(true);
    setEditData({ label: '', value: '', imageURL: '', color: '#000000', localImage: null });
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setSelectedLabel('');
    setEditData({ label: '', value: '', imageURL: '', color: '#000000', localImage: null });
  };

  const saveEdit = () => {
    const safeLabel = String(editData.label).trim();
    if (!safeLabel) return alert('Label is required');
    if (isNaN(editData.value) || editData.value === '') return alert('Value must be a number');

    const imageURL = editData.localImage ? URL.createObjectURL(editData.localImage) : editData.imageURL;
    const updatedSlices = [...slices];

    if (isAdding) {
      if (updatedSlices.some((s) => s.label === safeLabel)) return alert('Label already exists');
      updatedSlices.push({ label: safeLabel, value: Number(editData.value), imageURL, color: editData.color });
    } else {
      const index = updatedSlices.findIndex((s) => s.label === selectedLabel);
      if (index === -1) return;
      updatedSlices[index] = { label: safeLabel, value: Number(editData.value), imageURL, color: editData.color };
    }

    setSlices(updatedSlices);
    setVisibleLabels((prev) => {
      if (!prev.includes(safeLabel)) return [...prev, safeLabel];
      if (!isAdding && safeLabel !== selectedLabel) {
        return prev.map((l) => (l === selectedLabel ? safeLabel : l));
      }
      return prev;
    });

    cancelEdit();
  };

  const deleteSlice = () => {
    const updated = slices.filter((s) => s.label !== selectedLabel);
    setSlices(updated);
    setVisibleLabels(visibleLabels.filter((l) => l !== selectedLabel));
    cancelEdit();
  };

  const toggleLabel = (label) => {
    setVisibleLabels((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  };

  const exportChartAsImage = async (format = 'png') => {
    if (format === 'csv') {
      const csvContent =
        'data:text/csv;charset=utf-8,' + ['Label,Value', ...slices.map((s) => `${s.label},${s.value}`)].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'chart-data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!chartRef.current) return;

    const images = chartRef.current.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map((img) =>
        img.complete ? Promise.resolve() : new Promise((res) => ((img.onload = res), (img.onerror = res)))
      )
    );

    const rect = chartRef.current.getBoundingClientRect();
    const canvas = await html2canvas(chartRef.current, {
      scale: 1,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: rect.width,
      windowHeight: rect.height,
    });

    canvas.toBlob((blob) => blob && saveAs(blob, `chart-highres.${format}`), `image/${format}`, 1.0);
  };

  const labels = slices.map((s) => s.label);
  const allValues = slices.map((s) => s.value);
  const imageURLs = Object.fromEntries(slices.map((s) => [s.label, s.imageURL]));
  const colors = Object.fromEntries(slices.map((s) => [s.label, s.color || '#888']));

  return (
    <div className="chart">
      <div className="sidebar overflow-hidden">
        <div className="menubar overflow-auto">
          <ChartTypeExport
            chartType={chartType}
            setChartType={setChartType}
            selectedExportFormat={selectedExportFormat}
            setSelectedExportFormat={setSelectedExportFormat}
            exportChartAsImage={exportChartAsImage}
          />

          <div className="toolbar">
            <ChartSettings
              showChartSettings={showChartSettings}
              setShowChartSettings={setShowChartSettings}
              valueFontSize={valueFontSize}
              setValueFontSize={setValueFontSize}
              showBorder={showBorder}
              setShowBorder={setShowBorder}
              borderThickness={borderThickness}
              setBorderThickness={setBorderThickness}
            />

            <SliceManagement
              showSliceManagement={showSliceManagement}
              setShowSliceManagement={setShowSliceManagement}
              slices={slices}
              selectedLabel={selectedLabel}
              handleSelectSlice={handleSelectSlice}
              handleAddClick={handleAddClick}
              isAdding={isAdding}
              editData={editData}
              setEditData={setEditData}
              saveEdit={saveEdit}
              deleteSlice={deleteSlice}
              cancelEdit={cancelEdit}
            />
          </div>
        </div>
      </div>

      <div ref={chartRef} className="chart-display">
        <div className="slice-toggles">
          <strong>{`${chartType.toUpperCase()} Chart`} :</strong>
          <div className="toggle-buttons-container">
            {slices.map((slice) => (
              <button
                key={slice.label}
                onClick={() => toggleLabel(slice.label)}
                className={`toggle-btn ${visibleLabels.includes(slice.label) ? 'active' : ''}`}
                title={`Toggle ${slice.label}`}
                style={{ backgroundColor: visibleLabels.includes(slice.label) ? slice.color : undefined }}
              >
                {slice.label}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-section">
          {chartType === 'bar' ? (
            <BarChart
              labels={labels}
              allValues={allValues}
              visibleLabels={visibleLabels}
              imageURLs={imageURLs}
              colors={colors}
              showBorder={showBorder}
              borderThickness={borderThickness}
              valueFontSize={valueFontSize}
            />
          ) : (
            <PieChart
              labels={labels}
              allValues={allValues}
              visibleLabels={visibleLabels}
              imageURLs={imageURLs}
              colors={colors}
              showBorder={showBorder}
              borderThickness={borderThickness}
              valueFontSize={valueFontSize}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartWithImagesAndToggle;
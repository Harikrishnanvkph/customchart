import React, { useState, useRef } from 'react';
import BarChart from './BarChart';
import PieChart from './PieChart';
import { Check, X, Download, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const ChartWithImagesAndToggle = () => {
  const [chartType, setChartType] = useState('bar');
  const [slices, setSlices] = useState([
    { label: 'Apples', value: 60, imageURL: '', color: '#FF6384' },
    { label: 'Bananas', value: 100, imageURL: '', color: '#FFCE56' },
    { label: 'Cherries', value: 50, imageURL: '', color: '#4BC0C0' },
  ]);
  const [visibleLabels, setVisibleLabels] = useState(
    slices.map((s) => String(s.label))
  );
  const [selectedLabel, setSelectedLabel] = useState('');
  const [editBuffer, setEditBuffer] = useState({
    label: '',
    value: 0,
    imageURL: '',
    color: '#888888',
    localImage: null,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState('png');
  const chartRef = useRef(null);

  const handleSliceChange = (key, value) => {
    setEditBuffer((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectSlice = (label) => {
    if (!label) {
      setSelectedLabel('');
      setEditBuffer({
        label: '',
        value: 0,
        imageURL: '',
        color: '#888888',
        localImage: null,
      });
      return;
    }

    const index = slices.findIndex((s) => s.label === label);
    if (index >= 0) {
      setSelectedLabel(label);
      setIsAdding(false);
      setEditBuffer({ ...slices[index], localImage: null });
    }
  };

  const handleAddClick = () => {
    setSelectedLabel('');
    setIsAdding(true);
    setEditBuffer({
      label: '',
      value: 0,
      imageURL: '',
      color: '#888888',
      localImage: null,
    });
  };

  const cancelEdit = () => {
    setSelectedLabel('');
    setIsAdding(false);
  };

  const saveEdit = () => {
    const safeLabel = String(editBuffer.label || '').trim();
    if (!safeLabel || isNaN(editBuffer.value)) return;

    const imageURL = editBuffer.localImage
      ? URL.createObjectURL(editBuffer.localImage)
      : editBuffer.imageURL;
    const updated = [...slices];
    const index = slices.findIndex((s) => s.label === safeLabel);

    if (isAdding) {
      if (index !== -1) return; // Prevent duplicate label
      updated.push({ ...editBuffer, label: safeLabel, imageURL });
    } else if (index >= 0) {
      updated[index] = { ...editBuffer, label: safeLabel, imageURL };
    }

    setSlices(updated);
    if (!visibleLabels.includes(safeLabel)) {
      setVisibleLabels([...visibleLabels, safeLabel]);
    }

    setSelectedLabel('');
    setIsAdding(false);
  };

  const deleteSlice = () => {
    const updatedSlices = slices.filter((s) => s.label !== selectedLabel);
    setSlices(updatedSlices);
    setVisibleLabels(visibleLabels.filter((l) => l !== selectedLabel));
    setSelectedLabel('');
  };

  const toggleLabel = (label) => {
    setVisibleLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const exportChartAsImage = async (format = 'png') => {
    if (format === 'csv') {
      // Export CSV (labels and values)
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        ['Label,Value', ...slices.map((s) => `${s.label},${s.value}`)].join(
          '\n'
        );
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

    // Wait for images to load inside chart
    const images = chartRef.current.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (!img.complete) {
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }
      })
    );

    // Get chart dimensions to use for windowWidth and windowHeight
    const rect = chartRef.current.getBoundingClientRect();

    const canvas = await html2canvas(chartRef.current, {
      scale: 1, // keep default scale
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: rect.width,
      windowHeight: rect.height,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 15000, // increase timeout to 15s for images
      // allowTaint: false, // default false, no need to set
    });

    let mimeType = 'image/png';
    if (format === 'jpeg') mimeType = 'image/jpeg';
    else if (format === 'webp') mimeType = 'image/webp';

    canvas.toBlob(
      (blob) => {
        if (blob) {
          saveAs(blob, `chart-highres.${format}`);
        }
      },
      mimeType,
      1.0
    );
  };

  const labels = slices.map((s) => String(s.label));
  const allValues = slices.map((s) => s.value);
  const imageURLs = slices.reduce((acc, s) => {
    acc[s.label] = s.imageURL;
    return acc;
  }, {});
  const colors = slices.reduce((acc, s) => {
    acc[s.label] = s.color || '#888';
    return acc;
  }, {});

  return (
    <div className="chart" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Chart Type:&nbsp;
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="bar">Bar</option>
            <option value="pie">Pie</option>
          </select>
        </label>

        <div
          style={{
            margin: '1rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <label>Choose Slice:</label>
          <select
            value={selectedLabel}
            onChange={(e) => handleSelectSlice(e.target.value)}
          >
            <option value="">-- Select Slice --</option>
            {slices.map((s, i) => (
              <option key={i} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
          <button onClick={handleAddClick}>Add Slice</button>

          <label>Export as:</label>
          <select
            value={selectedExportFormat}
            onChange={(e) => setSelectedExportFormat(e.target.value)}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
            <option value="csv">CSV</option>
          </select>
          <button onClick={() => exportChartAsImage(selectedExportFormat)}>
            <Download size={16} /> Export
          </button>
        </div>

        {(isAdding || selectedLabel) && (
          <div
            style={{
              background: '#f9f9f9',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ccc',
            }}
          >
            <input
              type="text"
              placeholder="Label"
              value={editBuffer.label}
              onChange={(e) => handleSliceChange('label', e.target.value)}
              style={{ display: 'block', marginBottom: 6, width: '100%' }}
            />
            <input
              type="number"
              placeholder="Value"
              value={editBuffer.value}
              onChange={(e) =>
                handleSliceChange('value', Number(e.target.value))
              }
              style={{ display: 'block', marginBottom: 6, width: '100%' }}
            />
            <input
              type="text"
              placeholder="Image URL"
              value={editBuffer.imageURL}
              onChange={(e) => handleSliceChange('imageURL', e.target.value)}
              style={{ display: 'block', marginBottom: 6, width: '100%' }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleSliceChange('localImage', e.target.files?.[0] || null)
              }
              style={{ display: 'block', marginBottom: 6 }}
            />
            <input
              type="color"
              value={editBuffer.color}
              onChange={(e) => handleSliceChange('color', e.target.value)}
              style={{ display: 'block', marginBottom: 10 }}
            />
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
              }}
            >
              <button onClick={saveEdit}>
                <Check size={16} />
              </button>
              <button onClick={cancelEdit}>
                <X size={16} />
              </button>
              {!isAdding && (
                <button onClick={deleteSlice}>
                  <Trash2 size={16} color="red" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {labels.map((label, index) => (
          <div
            key={label + index}
            onClick={() => toggleLabel(label)}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '12px',
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: visibleLabels.includes(label)
                  ? colors[label]
                  : '#ccc',
                border: '1px solid #555',
                marginRight: 4,
              }}
            ></div>
            {label}
          </div>
        ))}
      </div>

      <div ref={chartRef} style={{ backgroundColor: '#ffffff', padding: 10 }}>
        {chartType === 'bar' ? (
          <BarChart
            labels={labels}
            allValues={allValues}
            visibleLabels={visibleLabels}
            imageURLs={imageURLs}
            colors={colors}
          />
        ) : (
          <PieChart
            labels={labels}
            allValues={allValues}
            visibleLabels={visibleLabels}
            imageURLs={imageURLs}
            colors={colors}
          />
        )}
      </div>
    </div>
  );
};

export default ChartWithImagesAndToggle;

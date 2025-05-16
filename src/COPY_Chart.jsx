import React, { useState, useRef } from 'react';
import BarChart from './BarChart';
import PieChart from './PieChart';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ChartSettings from './ChartSettings';
import SliceEditor from './SliceEditor';

const ChartWithImagesAndToggle = () => {
  const [chartType, setChartType] = useState('bar');
  const [slices, setSlices] = useState([
    { label: 'Apples', value: 60, imageURL: '', color: '#FF6384' },
    { label: 'Bananas', value: 100, imageURL: '', color: '#FFCE56' },
    { label: 'Cherries', value: 50, imageURL: '', color: '#4BC0C0' },
  ]);
  const [visibleLabels, setVisibleLabels] = useState(slices.map((s) => String(s.label)));
  const [selectedLabel, setSelectedLabel] = useState('');
  const [editBuffer, setEditBuffer] = useState({
    label: '',
    value: 0,
    imageURL: '',
    color: '#888888',
    localImage: null,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const chartRef = useRef(null);

  // Handlers from your original code, unchanged (just adjusted for passing)
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
    if (!chartRef.current) return;

    const exportWidth = chartRef.current.offsetWidth;
    const exportHeight = chartRef.current.offsetHeight;

    if (format === 'png' || format === 'jpeg') {
      const canvas = await html2canvas(chartRef.current, {
        scale: 6,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        width: exportWidth,
        height: exportHeight,
      });
      const imgData = canvas.toDataURL(`image/${format}`);
      const link = document.createElement('a');
      link.download = `chart.${format}`;
      link.href = imgData;
      link.click();
    } else if (format === 'pdf') {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        width: exportWidth,
        height: exportHeight,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', [exportWidth, exportHeight]);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const tableData = slices.map((slice) => ({
        Label: slice.label,
        Value: slice.value,
        Color: slice.color,
        ImageURL: slice.imageURL,
      }));

      const columnStyles = {
        Label: { fontStyle: 'bold' },
        Value: { halign: 'right' },
        Color: { fillColor: '#eeeeee' },
        ImageURL: { cellWidth: 40, halign: 'center' },
      };

      const headerStyles = {
        fillColor: '#007bff',
        textColor: '#fff',
        fontStyle: 'bold',
      };

      pdf.autoTable({
        head: [
          { label: 'Label', value: 'Value', color: 'Color', imageURL: 'Image' },
        ],
        body: tableData,
        startY: pdfHeight + 10,
        columnStyles: columnStyles,
        headStyles: headerStyles,
        didDrawCell: (data) => {
          if (data.column.dataKey === 'Color') {
            const cell = data.cell;
            pdf.setFillColor(data.row.raw.Color);
            pdf.rect(
              cell.x + 2,
              cell.y + 2,
              cell.width - 4,
              cell.height - 4,
              'F'
            );
          }
        },
      });
      pdf.save('chart.pdf');
    } else if (format === 'html') {
      const chartContent = chartRef.current.innerHTML;
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Chart Export</title>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            .chart-container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="chart-container">
            ${chartContent}
          </div>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'chart.html';
      link.href = url;
      link.click();
    }
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
      <ChartSettings
        chartType={chartType}
        setChartType={setChartType}
        slices={slices}
        visibleLabels={visibleLabels}
        selectedLabel={selectedLabel}
        onSelectSlice={handleSelectSlice}
        onAddClick={handleAddClick}
        onToggleLabel={toggleLabel}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        onExport={() => exportChartAsImage(exportFormat)}
      />

      {(isAdding || selectedLabel) && (
        <SliceEditor
          editBuffer={editBuffer}
          onChange={handleSliceChange}
          onSave={saveEdit}
          onCancel={cancelEdit}
          onDelete={!isAdding ? deleteSlice : undefined}
          isAdding={isAdding}
        />
      )}

      <div
        ref={chartRef}
        style={{ backgroundColor: '#ffffff', padding: 10 }}
      >
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

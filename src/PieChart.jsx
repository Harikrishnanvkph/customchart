import React, { useRef, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({
  labels,
  allValues,
  visibleLabels,
  imageURLs,
  colors,
  valueFontSize = 14,
  showBorder = true,
  borderThickness = 1,
}) => {
  const chartRef = useRef(null);
  const imagesRef = useRef({});

  const filteredIndices = labels
    .map((label, i) => (visibleLabels.includes(label) ? i : null))
    .filter((i) => i !== null);

  const filteredLabels = filteredIndices.map((i) => labels[i]);
  const filteredValues = filteredIndices.map((i) => allValues[i]);
  const backgroundColors = labels.map((label) => colors[label] || 'gray');
  const borderColors = labels.map((label) => colors[label] || 'gray');
  const filteredBG = filteredIndices.map((i) => backgroundColors[i]);
  const filteredBorder = filteredIndices.map((i) => borderColors[i]);

  const isEmptyPie = filteredValues.length === 0;

  const data = {
    labels: isEmptyPie ? ['Empty'] : filteredLabels,
    datasets: [
      {
        label: 'Fruits',
        data: isEmptyPie ? [1] : filteredValues,
        backgroundColor: isEmptyPie ? ['#f0f0f0'] : filteredBG,
        borderColor: showBorder ? (isEmptyPie ? ['#ccc'] : filteredBorder) : 'transparent',
        borderWidth: showBorder ? (isEmptyPie ? 0 : borderThickness) : 0,
      },
    ],
  };

  useEffect(() => {
    filteredLabels.forEach((label) => {
      const url = imageURLs[label];
      if (url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => {
          imagesRef.current[label] = img;
          if (chartRef.current) chartRef.current.update();
        };
      } else {
        imagesRef.current[label] = null;
      }
    });
  }, [imageURLs, filteredLabels]);

  const valueLabelPlugin = {
    id: 'valueLabelPlugin',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const dataset = chart.data.datasets[0];
      const meta = chart.getDatasetMeta(0);

      ctx.save();
      ctx.font = `bold ${valueFontSize}px Arial`;
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (dataset.data.length === 1 && !isEmptyPie) {
        const value = dataset.data[0];
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        ctx.fillText(value, centerX, centerY);
      } else {
        dataset.data.forEach((value, index) => {
          const element = meta.data[index];
          if (!element || isEmptyPie) return;
          const { x, y } = element.tooltipPosition();
          ctx.fillText(value, x, y);
        });
      }

      ctx.restore();
    },
  };

  const imagePlugin = {
    id: 'imagePlugin',
    afterDatasetsDraw(chart) {
      const dataset = chart.data.datasets[0];
      const meta = chart.getDatasetMeta(0);
      const { ctx } = chart;

      dataset.data.forEach((value, index) => {
        const element = meta.data[index];
        if (!element) return;
        const label = chart.data.labels[index];
        const img = imagesRef.current[label];
        if (!img || !img.complete) return;

        const centerX = chart.chartArea.left + chart.chartArea.width / 2;
        const centerY = chart.chartArea.top + chart.chartArea.height / 2;
        const startAngle = element.startAngle;
        const endAngle = element.endAngle;
        const radius = element.outerRadius;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.clip();

        const midAngle = (startAngle + endAngle) / 2;
        const boundingSize = radius * 1.4;
        const imageRadius = radius * 0.6;
        const imageX = centerX + Math.cos(midAngle) * imageRadius;
        const imageY = centerY + Math.sin(midAngle) * imageRadius;

        const aspectRatio = img.width / img.height;
        let drawWidth, drawHeight;
        if (aspectRatio > 1) {
          drawWidth = boundingSize;
          drawHeight = boundingSize / aspectRatio;
        } else {
          drawHeight = boundingSize;
          drawWidth = boundingSize * aspectRatio;
        }

        ctx.drawImage(
          img,
          imageX - drawWidth / 2,
          imageY - drawHeight / 2,
          drawWidth,
          drawHeight
        );

        ctx.restore();
      });
    },
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <Pie
      ref={(el) => (chartRef.current = el?.chart || el?.chartInstance)}
      data={data}
      options={options}
      plugins={[valueLabelPlugin, imagePlugin]}
    />
  );
};

export default PieChart;

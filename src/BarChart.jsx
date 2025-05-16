import React, { useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const BarChart = ({
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

  const data = {
    labels: filteredLabels,
    datasets: [
      {
        data: filteredValues,
        backgroundColor: filteredBG,
        borderColor: showBorder ? filteredBorder : 'transparent',
        borderWidth: showBorder ? borderThickness : 0,
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

  const imagePlugin = {
    id: 'imagePlugin',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const dataset = chart.data.datasets[0];
      const meta = chart.getDatasetMeta(0);

      dataset.data.forEach((value, index) => {
        const element = meta.data[index];
        if (!element) return;

        const label = chart.data.labels[index];
        const img = imagesRef.current[label];
        if (!img || !img.complete) return;

        const { x, y, base } = element;
        const barHeight = base - y;
        const barWidth = element.width;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x - barWidth / 2, y, barWidth, barHeight);
        ctx.clip();

        const aspectRatio = img.width / img.height;
        let drawWidth = barWidth;
        let drawHeight = barHeight;

        if (aspectRatio > 1) {
          drawHeight = barWidth / aspectRatio;
        } else {
          drawWidth = barHeight * aspectRatio;
        }

        const imgX = x - drawWidth / 2;
        const imgY = y + (barHeight - drawHeight) / 2;

        ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
        ctx.restore();
      });
    },
  };

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

      const { scales: { x, y } = {} } = chart;
      dataset.data.forEach((value, index) => {
        const element = meta.data[index];
        if (!element) return;
        const barX = x.getPixelForValue(index);
        const barY = y.getPixelForValue(value);
        const zeroY = y.getPixelForValue(0);
        const centerY = (zeroY + barY) / 2;
        ctx.fillText(value, barX, centerY);
      });

      ctx.restore();
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 3,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: function(context) {
            return `Value: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...filteredValues, 0) + 20,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    }
  };

  return (
    <Bar
      ref={(el) => (chartRef.current = el?.chart || el?.chartInstance)}
      data={data}
      options={options}
      plugins={[valueLabelPlugin, imagePlugin]}
    />
  );
};

export default BarChart;
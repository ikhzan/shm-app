// utils/chart-helper.ts
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export class ChartHelper {
  static renderHumidityChart(
    ctx: CanvasRenderingContext2D,
    data: { timestamp: string; value: number }[],
    label: string
  ): Chart {
    return this.renderLineChart(ctx, data, label, 'green', 'Humidity (%)', 0, 100);
  }

  static renderTemperatureChart(
    ctx: CanvasRenderingContext2D,
    data: { timestamp: string; value: number }[],
    label: string
  ): Chart {
    return this.renderLineChart(ctx, data, label, '#EF5350', 'Temperature (°C)', -10, 50);
  }

  private static renderLineChart(
    ctx: CanvasRenderingContext2D,
    data: { timestamp: string; value: number }[],
    label: string,
    color: string,
    yLabel: string,
    yMin: number,
    yMax: number
  ): Chart {
    const rgbaColor = color.replace('1)', '0.1)').replace('rgb', 'rgba');

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => `#${i + 1}`), // Keep index-based labels
        datasets: [{
          label,
          data: data.map(d => d.value),
          borderColor: color,
          backgroundColor: rgbaColor,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 4,
          pointBackgroundColor: color,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500,
          easing: 'easeOutQuart'
        },
        interaction: {
          mode: 'nearest',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'nearest',
            intersect: false,
            bodyFont: { size: 10 },
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 6,
            cornerRadius: 4,
            callbacks: {
              label: (tooltipItem) => {
              
                return `${tooltipItem.formattedValue}`;
              }
            }
          }

        },
        scales: {
          x: {
            ticks: { display: false },
            grid: { display: false },
            title: { display: false }
          },
          y: {
            beginAtZero: false,
            min: yMin,
            max: yMax,
            ticks: {
              font: { size: 9 },
              stepSize: 10,
              color: '#666'
            },
            title: {
              display: true,
              text: yLabel,
              font: { size: 10 },
              color: '#444'
            },
            grid: {
              color: '#eee'
            }
          }
        }
      }
    });
  }

}
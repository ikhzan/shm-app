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
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => `#${i + 1}`),
        datasets: [{
          label,
          data: data.map(d => d.value),
          borderColor: color,
          backgroundColor: color.replace('1)', '0.1)').replace('rgb', 'rgba'),
          // fill: true,
          tension: 0.4,
          pointRadius: 1.5,
          pointHoverRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              font: { size: 10 },
              boxWidth: 10
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            bodyFont: { size: 10 },
            titleFont: { size: 11 }
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
              stepSize: 10
            },
            title: {
              display: true,
              text: yLabel,
              font: { size: 10 }
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
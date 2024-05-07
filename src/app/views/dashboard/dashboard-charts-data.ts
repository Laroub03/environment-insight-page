import { Injectable } from '@angular/core';
import {
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  PluginOptionsByType,
  ScaleOptions,
  TooltipLabelStyle
} from 'chart.js';
import { DeepPartial } from 'chart.js/dist/types/utils';
import { getStyle, hexToRgba } from '@coreui/utils';
import { SensorDataService } from '../../services/sensor-Data.service';
import { ClientData } from '../../interfaces/clientData';

interface SensorRanges {
  [key: string]: { min: number, max: number, stepSize: number };
}

export interface IChartProps {
  data?: ChartData;
  labels?: string[];
  options?: ChartOptions;
  type: ChartType;
}

@Injectable({
  providedIn: 'any'
})
export class DashboardChartsData {
  private sensorRanges: SensorRanges = {
    humidity: { min: 0, max: 100, stepSize: 20 },
    altitude: { min: 0, max: 5000, stepSize: 1000 },
    pressure: { min: 900, max: 1100, stepSize: 40 },
    temperature: { min: -50, max: 50, stepSize: 20 },
    light: { min: 0, max: 1023, stepSize: 20000 }
  };
  
  public mainChart: IChartProps = { type: 'line', labels: [], options: {} };

  constructor(private sensorDataService: SensorDataService) {
    this.initMainChart();
  }

  private generateRandomData(elementCount: number, min: number, max: number): number[] {
    return Array.from({ length: elementCount }, () => Math.floor(Math.random() * (max - min + 1) + min));
  }

  private getChartColors(): { backgroundColor: string, borderColor: string, pointHoverBackgroundColor: string, borderWidth: number, fill: boolean } {
    const brandInfo = getStyle('--cui-info') ?? '#20a8d8';
    const brandInfoBg = hexToRgba(brandInfo, 10);
    return {
      backgroundColor: brandInfoBg,
      borderColor: brandInfo,
      pointHoverBackgroundColor: brandInfo,
      borderWidth: 2,
      fill: true
    };
  }

  extractValuesAndRange(property: keyof ClientData): { values: any[], range: number } {
    var clientData: ClientData [] = [];
    this.sensorDataService.clientsData$.subscribe((data) => clientData = data);
    let values: any[] = clientData.map(data => data[property]);
    let min = Math.min(...values);
    let max = Math.max(...values);
    let range = max - min;
    return { values, range };
  }

  public initMainChart(period: string = 'Month') {
    const colors = this.getChartColors();
    const labels = this.getLabelsForPeriod(period);
    const datasets: ChartDataset[] = [];

    // Define properties and titles directly within the loop
    const properties: (keyof ClientData)[] = ['humidity', 'altitude', 'pressure', 'temperature', 'light'];
    const titles: string[] = ['Humidity', 'Altitude', 'Pressure', 'Temperature', 'Light'];

    // Manually populate datasets for each property and title
    for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        const title = titles[i];

        let { values, range } = this.extractValuesAndRange(property);

        const dataset: ChartDataset = {
            data: values,
            label: title,
            ...colors
        };

        datasets.push(dataset);
    }

    this.mainChart.data = { datasets, labels };
    this.mainChart.options = this.getChartOptions();
}

  private getLabelsForPeriod(period: string): string[] {
    switch (period) {
      case 'Year':
        return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      case 'Day':
        return Array.from({ length: 24 }, (_, i) => `${i}:00`);
      default:
        return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].concat(...Array(3).fill(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']));
    }
  }

  private getChartOptions(): ChartOptions {
    return {
      maintainAspectRatio: false,
      plugins: this.getPlugins(),
      scales: this.getScales('defaultSensorType'),
      elements: {
        line: { tension: 0.4 },
        point: { radius: 0, hitRadius: 10, hoverRadius: 4, hoverBorderWidth: 3 }
      }
    };
  }

  private getPlugins(): DeepPartial<PluginOptionsByType<any>> {
    return {
      legend: { display: false },
      tooltip: {
        callbacks: {
          labelColor: (context) => ({ backgroundColor: context.dataset.borderColor } as TooltipLabelStyle)
        }
      }
    };
  }

  getScales(sensorType: string): ScaleOptions<any> {
    const range = this.sensorRanges[sensorType] || { min: 0, max: 250, stepSize: 50 };
    return {
      y: {
        beginAtZero: true,
        max: range.max,
        min: range.min,
        ticks: {
          stepSize: range.stepSize,
          maxTicksLimit: 5
        }
      }
    };
  }  
}

import { DOCUMENT, NgStyle } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckLabelDirective,
  GutterDirective,
  ProgressBarDirective,
  ProgressComponent,
  RowComponent,
  TableDirective,
  TextColorDirective
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';

import { WidgetsBrandComponent } from '../widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '../widgets/widgets-dropdown/widgets-dropdown.component';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import { ChartOptions } from 'chart.js';
import { SensorDataService } from 'src/app/services/sensor-Data.service';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, WidgetsDropdownComponent, TextColorDirective, CardComponent, CardBodyComponent, RowComponent, ColComponent, ButtonDirective, IconDirective, ReactiveFormsModule, ButtonGroupComponent, FormCheckLabelDirective, ChartjsComponent, NgStyle, CardFooterComponent, GutterDirective, ProgressBarDirective, ProgressComponent, WidgetsBrandComponent, CardHeaderComponent, TableDirective, AvatarComponent]
})
export class DashboardComponent implements OnInit { 
  sensorData: any;
  
  public sensors = [
    { id: 'humidity', title: 'Humidity', dateRange: '' },
    { id: 'altitude', title: 'Altitude', dateRange: '' },
    { id: 'pressure', title: 'Pressure', dateRange: '' },
    { id: 'temperature', title: 'Temperature', dateRange: '' },
    { id: 'light', title: 'Light', dateRange: '' }
  ];
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #document: Document = inject(DOCUMENT);
  readonly #renderer: Renderer2 = inject(Renderer2);
  readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);

  public mainChart: IChartProps = { type: 'line' };
  public mainChartRef: WritableSignal<any> = signal(undefined);
  #mainChartRefEffect = effect(() => {
    if (this.mainChartRef()) {
      this.setChartStyles();
    }
  });
  public sensorDataGroup = new FormGroup({
    sensorData: new FormControl('Month')
  });
  
  constructor(private sensorDataService: SensorDataService) {}

  ngOnInit(): void {
    this.updateDateRanges();
    this.initCharts();
    this.updateChartOnColorModeChange();
    this.loadSensorData();
  }

  loadSensorData() {
    const clientId = 'yourClientId'; // This should be dynamically set based on user selection or another parameter
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = currentTime - 3600; // Last hour data
    const endTime = currentTime;

    this.sensorDataService.fetchSensorData(clientId, startTime, endTime).subscribe(
      data => {
        this.sensorData = data;
        console.log('Fetched sensor data:', data);
      },
      error => console.error('Error fetching sensor data:', error)
    );
  }


  updateDateRanges(): void {
    const currentYear = new Date().getFullYear();
    const dateRange = `January - December ${currentYear}`;
    this.sensors.forEach(sensor => sensor.dateRange = dateRange);
  }

  initCharts(): void {
    this.mainChart = this.#chartsData.mainChart;
  }

  setSensorData(value: string): void {
    if (this.sensorDataGroup.get('sensorData')?.value !== value) {
      this.sensorDataGroup.setValue({ sensorData: value });
      this.#chartsData.initMainChart(value); // Here, ensure that initMainChart uses the correct sensor type to fetch the right scales
      this.initCharts();
      this.setChartStyles(); // Update chart styles with the new configuration
    }
  } 
  
  handleChartRef($chartRef: any) {
    if ($chartRef) {
      this.mainChartRef.set($chartRef);
      this.setChartStyles(); // Immediately apply the correct styles
    } else {
      console.error('Failed to set chart reference');
    }
  }  
  
  updateChartOnColorModeChange() {
    const unListen = this.#renderer.listen(this.#document.documentElement, 'ColorSchemeChange', () => {
      this.setChartStyles();
    });

    this.#destroyRef.onDestroy(() => {
      unListen();
    });
  }

  setChartStyles() {
    if (this.mainChartRef()) {
      setTimeout(() => {
        const sensorType = this.sensorDataGroup.get('sensorData')?.value || 'defaultSensorType';
        console.log('Sensor Type:', sensorType); // Check the sensor type being used
        const scales = this.#chartsData.getScales(sensorType);
        console.log('Scales being set:', scales); // Check the scales being calculated
        this.mainChartRef().options.scales = scales;
        this.mainChartRef().update();
      }, 0); // timeout set to 0 for immediate execution
    }
  }
  
}
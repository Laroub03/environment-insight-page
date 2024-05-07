import { DOCUMENT, NgStyle } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { formatDate } from '@angular/common';
import { ClientData } from 'src/app/interfaces/clientData';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, WidgetsDropdownComponent, TextColorDirective, CardComponent, CardBodyComponent, RowComponent, ColComponent, ButtonDirective, IconDirective, ReactiveFormsModule, ButtonGroupComponent, FormCheckLabelDirective, ChartjsComponent, NgStyle, CardFooterComponent, GutterDirective, ProgressBarDirective, ProgressComponent, WidgetsBrandComponent, CardHeaderComponent, TableDirective, AvatarComponent]
})
export class DashboardComponent { 
  sensorData: any;
  minDate: string = '';
  maxDate: string = '';

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
    clientId: new FormControl('', Validators.required), // Ensure client ID is not empty
    fromDate: new FormControl('', Validators.required), // Ensure date is selected
    toDate: new FormControl('', Validators.required), // Ensure date is selected
    sensorData: new FormControl('Month') // Default to 'Month'
  });
  
  constructor(private sensorDataService: SensorDataService) {}



  ngOnInit(): void {
    this.initializeDateRange();

    this.initCharts();
    this.updateChartOnColorModeChange();

  }

  initializeDateRange(): void {
    const currentDate = new Date();
    const tomorrow = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add one day to current date

    this.maxDate = formatDate(tomorrow, 'yyyy-MM-dd', 'en-US'); // Allow selection up to tomorrow

    const lastYearDate = new Date(currentDate.getTime());
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
    this.minDate = formatDate(lastYearDate, 'yyyy-MM-dd', 'en-US');
  }

  getMaxFromDate(): string {
    // Prevent the fromDate from being set after the toDate
    return this.sensorDataGroup.value.toDate || this.maxDate;
  }

  getMinToDate(): string {
    // Prevent the toDate from being set before the fromDate
    return this.sensorDataGroup.value.fromDate || this.minDate;
  }

  onSubmit() {
    if (this.sensorDataGroup.valid) {
      const clientId = this.sensorDataGroup.value.clientId as string;
      const fromDate = Math.floor(new Date(this.sensorDataGroup.value.fromDate as string).getTime() / 1000);
      const toDate = Math.floor(new Date(this.sensorDataGroup.value.toDate as string).getTime() / 1000);
      console.log(fromDate);

      this.sensorDataService.fetchSensorData(clientId, fromDate, toDate);
      this.sensorDataService.clientsData$.subscribe((data) => console.log(data));
    }
  }
  

  // loadSensorData() {
  //   const clientId = 'yourClientId'; // This should be dynamically set based on user selection or another parameter
  //   const currentTime = Math.floor(Date.now() / 1000);
  //   const startTime = currentTime - 3600; // Last hour data
  //   const endTime = currentTime;

  //   this.sensorDataService.fetchSensorData(clientId, startTime, endTime).subscribe(
  //     data => {
  //       this.sensorData = data;
  //       console.log('Fetched sensor data:', data);
  //     },
  //     error => console.error('Error fetching sensor data:', error)
  //   );
  // }


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
      this.sensorDataGroup.patchValue({
        sensorData: value
      });
      this.#chartsData.initMainChart(value); // Initialize chart data based on the selected sensor
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
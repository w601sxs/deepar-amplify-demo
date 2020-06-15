import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as customers from '../customers.json';

@Component({
  selector: 'app-machine-learning-demo',
  templateUrl: './machine-learning-demo.component.html',
  styleUrls: ['./machine-learning-demo.component.scss']
})
export class MachineLearningDemoComponent implements OnInit, AfterViewInit {
  private input = {
    confidence: 30,
    data: {
      start: '2014-01-14 00:00:00',
      target: [],
    }
  };
  private results = null;

  public today = (new Date(this.input.data.start)).toISOString();
  private loadingData = false;
  public lineChartData: ChartDataSets[] = [{data: []}];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    title: {
      text: 'Predicted Data'
    },
    tooltips: {
      mode: 'x',
      intersect: false,
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{
          type: 'time',
          distribution: 'linear',
          time: {
            tooltipFormat: 'll HH:mm',
            unit: 'day',
            unitStepSize: 1,
            displayFormats: {
              day: 'MM/DD/YYYY',
            }
          },
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Date',
          },
        }
      ],
      yAxes: [
        {
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Value',
          }
        }
      ]
    },
    annotation: null
  };
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];
  private colors = {
    target: '#000000',
    lower: '#9999ff',
    median: '#0066ff',
    upper: '#9999ff',
    fill: '#9999ff'
  };

  public datasets: Array<{ name: string, points: string}>;
  private _dataPoints: string;

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor(private cdr: ChangeDetectorRef, private http: HttpClient) {
    this.datasets = [
      { name: 'Customer 1', points: customers['Customer 1'] },
      { name: 'Customer 2', points: customers['Customer 2'] },
      { name: 'Customer 3', points: customers['Customer 3'] },
      { name: 'Customer 4', points: customers['Customer 4'] },
      { name: 'Customer 5', points: customers['Customer 5'] },
      { name: 'Customer 6', points: customers['Customer 6'] }
    ];
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  onDateChange(event) {
    const dateString = moment(event.target.value).format('MM/DD/YYYY HH:mm:ss');
    console.log( 'Date Change Event:', dateString);
    this.input.data.start = dateString;
    this.inputChanged();
  }

  onDataChange(event) {
    const data = event.target.value as string;
    console.log( 'Data Change Event:', event.target.value );
    this.parseDatapointString(data);
    this.inputChanged();
  }

  private parseDatapointString(data: string) {
    const points = data.split(',').filter(p => p.trim());
    this.input.data.target = points.map(p => parseFloat(p));
  }

  inputChanged() {
    if (this.input.data.start && this.input.data.target && this.input.data.target.length) {
      this.results = null;
      this.renderChart();
    }
  }

  get dataPoints(): string {
    return this._dataPoints;
  }
  set dataPoints(value: string) {
    this._dataPoints = value;
    this.parseDatapointString(this._dataPoints);
  }

  get confidence(): number {
    return this.input.confidence;
  }
  set confidence(value: number) {
    this.input.confidence = value;
    this.load();
  }

  private renderChart() {
    this.lineChartData = [];
    const chartStartDate = moment(this.input.data.start);
    const currentX = moment(chartStartDate);
    let points = [];
    for (const point of this.input.data.target) {
      console.log(currentX.toString());
      points.push({
        x: moment(currentX),
        y: point,
      });
      currentX.add(2, 'h');
    }
    console.log(currentX.toString());
    if (this.results) {
      points.push({
        x: moment(currentX),
        y: Number.parseFloat(this.results.predictions['0.5'][0])
      });
    }
    this.lineChartData.push({
      type: 'line',
      label: 'target',
      fill: false,
      pointRadius: 2,
      pointBorderColor: this.colors.target,
      pointBackgroundColor: this.colors.target,
      borderColor: this.colors.target,
      data: points
    });
    if (this.results) {
      const dataStartDate = currentX;
      // Sort the list of predictions by confidence value
      let predictionKeys = [];
      for (const key in this.results.predictions) { 
        if (!this.results.predictions.hasOwnProperty(key)) {
          continue;
        }
        predictionKeys.push(key);
      };
      predictionKeys = predictionKeys.sort();
      for (const key of predictionKeys) {
        const dataX = moment(dataStartDate);
        points = [];
        for (const point of this.results.predictions[key]) {
          points.push({
            x: moment(dataX),
            y: Number.parseFloat(point),
          });
          dataX.add(2, 'h');
        }
        const dataset = {
          type: 'line',
          label: key,
          pointRadius: 2,
          fill: '+1',
          backgroundColor: this.colors.fill,
          pointBorderColor: this.colors[key],
          pointBackgroundColor: this.colors[key],
          borderColor: this.colors[key],
          data: points
        };
        this.lineChartData.push(dataset);
      }
    }
    this.cdr.detectChanges();
    this.chart.update();
  }

  ngOnInit(): void {
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    // console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    // console.log(event, active);
  }

  get buttonDisabled(): boolean {
    return !(this.input.data.start && this.input.data.target && this.input.data.target.length) || this.loading;
  }

  get loading(): boolean {
    return this.loadingData;
  }
  set loading(value: boolean)
  {
    this.loadingData = value;
  }

  public load(event?: MouseEvent) {
    if (event) { event.preventDefault(); }
    this.loading = true;
    this.http.post(environment.inferenceUrl, this.input).subscribe({
      next: data => {
        console.log('Data received!', data);
        this.results = data;
        this.loading = false;
        this.renderChart();
      },
      error: () => this.loading = false
    });
  }
}

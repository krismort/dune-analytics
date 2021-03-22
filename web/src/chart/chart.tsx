import * as React from 'react';

import ReactApexChart from "react-apexcharts";

import './chart.css';

export class Chart extends React.Component<any, any> {
  public state = {
    columns: [] as any[],
    rows: [] as any[]
  };

  componentDidMount() {
    if ( this.props.columns?.length ) {
      this._updateColumns();
    }
    if ( this.props.rows?.length ) {
      this._updateRows();
    }
  }
  
  async componentDidUpdate(prevProps: any /*, prevState: any*/ ) {
    if ( !prevProps.columns && !this.props.columns ) {
      return;
    }
    if ( (!prevProps.columns && this.props.columns) ||
          prevProps.columns.length !== this.props.columns.length ||
          (prevProps.columns && JSON.stringify(prevProps.columns || null) !== JSON.stringify(this.props.columns || null) ) )
    {
      this._updateColumns();
    }
    if ( (!prevProps.rows && this.props.rows) ||
          prevProps.rows.length !== this.props.rows.length ||
          (prevProps.rows && JSON.stringify(prevProps.rows || null) !== JSON.stringify(this.props.rows || null) ) )
    {
      this._updateRows();
    }
  }

  private _updateColumns() {
    const {columns} = this.props;
    const columnDefs = columns.map( (c: any) => {
      const {friendly_name, type, name} = c;
      return friendly_name;
    } );
    this.setState({columns: columnDefs});
  }

  private _updateRows() {
    const cols = this.props.columns;
    const rows = this.props.rows.map((r: any) => {
      return cols.map( (c: any) => r[c.name] );
    });
    this.setState({rows});
  }

  render() {
    const {rows, columns} = this.state;

    // console.error({rows, columns});

    if ( !rows || !columns || !rows.length || columns.length !== 2 ) {
      return null;
    }

    const series = [{
      name: columns[1],
      data: rows.map( (row: any) => row[1] )
    }];

    const xAxisCategories = rows.map( (row: any) => new Date( row[0] ).toDateString() );

    const options = {
      animations: {
        enabled: false
      },
      chart: {
        width: '100%',
        animations: {
          enabled: false,
          dynamicAnimation: {
            enabled: false,
          }
        },
        height: 350,
        type: 'bar',
      },
      plotOptions: {
        bar: {
          borderRadius: 1,
          dataLabels: {
            enabled: false,
            position: 'top', // top, center, bottom
          },
        }
      },

      dataLabels: {
        enabled: false,
      },
      
      xaxis: {
        categories: xAxisCategories,
        position: 'bottom',
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        dataLabels: {
          enabled: false,
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#D8E3F0',
              colorTo: '#BED1E6',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            }
          }
        },
        labels: {
          show: false,
          enabled: false,
        },
        tooltip: {
          enabled: false,
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false
        }
      },
      title: {
        show: false,
      }
    };

    return (
      <div id="chart">
        <ReactApexChart options={options} series={series} type="bar" height={350} />
      </div>
    );
  }
}


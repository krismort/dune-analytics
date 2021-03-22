import React from 'react';
import logo from './logo.svg';
import './App.css';

import {MySQLEditor} from './mysql-editor';
import {QueryResultTable} from './query-result-table';
import { Tab, Tabs, Button} from "@blueprintjs/core";
import {Chart} from './chart';
import {service} from './services';

const queryString =
`SELECT
    date_trunc('day', block_time) AS week,
    SUM(usd_amount) AS cumulative_trades
FROM dex.trades
WHERE block_time > now() - interval '7 days'
AND project = 'Uniswap'
GROUP BY 1
ORDER BY 1;
`;

export default class App extends React.Component {
  state = {
    selTab: '0',
    tabs: [
      {
        id: '0',
        key: '0',
        type: 'table',
        title: 'Table'
      },
      {
        id: '1',
        key: '1',
        type: 'bar',
        title: 'Bar chart'
      }
    ],
    queryString,
    rows: [] as any[],
    columns: [] as any[],
    error: null as any
  };

  handleTabChange = (selTab: string) => {
    this.setState({
      selTab
    });
  };

  executeQuery = async () => {
    try {
      const {queryString} = this.state;
      const ret = await service.executeQuery(queryString);
      const {columns, rows} = ret.query_result.data;
      this.setState({columns, rows});
    } catch( e ) {
      console.error(e);
      this.setState({columns: null, rows: null, error: e});
    }
  };

  setQueryString = (queryString: string) => this.setState({queryString});

  addAreaChart = () => {
    const {tabs} = this.state;
    const id = tabs.length.toString();
    tabs.push({
      id,
      key: id,
      type: 'area',
      title: 'New vis'
    });
    this.setState({tabs, selTab: id});
  };

  addBarChart = () => {
    const {tabs} = this.state;
    const id = tabs.length.toString();
    tabs.push({
      id,
      key: id,
      type: 'bar',
      title: 'New vis'
    });
    this.setState({tabs, selTab: id});
  };

  render() {
    const {selTab, columns, rows, queryString, tabs} = this.state;
    return (
      <div className="App">
        <div className="flex-column">
          <MySQLEditor onExecute={this.executeQuery} onChange={this.setQueryString} value={queryString}/>

          <Tabs id="tabs"
              onChange={this.handleTabChange}
              animate={true}
              large={true}
              renderActiveTabPanelOnly={true}
              selectedTabId={selTab}>
            {
              tabs.map( (tab: any) => { return <Tab {...tab} /> } )
            }
            <Tab id="add" title="Add visualisation" />
          </Tabs>

          {selTab === '0' && <QueryResultTable {...{columns, rows}}/>}
          {selTab === '1' && <Chart {...{columns, rows, type: 'bar'}} />}
          {['0', '1', 'add'].indexOf(selTab) === -1 && <Chart {...{columns, rows, type: this.state.tabs[selTab as any as number].type}} />}
          {selTab === 'add' && <div>
            <Button onClick={this.addAreaChart}>Add area chart</Button>
            <Button onClick={this.addBarChart}>Add bar chart</Button>
          </div>}
        </div>
      </div>
    );
  }
}

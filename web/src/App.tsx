import React from 'react';
import logo from './logo.svg';
import './App.css';

import {MySQLEditor} from './mysql-editor';
import {QueryResultTable} from './query-result-table';
import { Tab, Tabs, Navbar, Alignment} from "@blueprintjs/core";
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
    selTab: '1',
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

  renderAdd = () => <div>Add visualisation form here</div>;

  render() {
    const {selTab, columns, rows, queryString} = this.state;
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
            <Tab id="0" title="Table" />
            <Tab id="1" title="Bar chart" />
            <Tab id="add" title="Add visualisation" />
          </Tabs>

          {selTab === '0' && <QueryResultTable {...{columns, rows}}/>}
          {selTab === '1' && <Chart {...{columns, rows}} />}
          {selTab === 'add' && this.renderAdd() }
        </div>
      </div>
    );
  }
}

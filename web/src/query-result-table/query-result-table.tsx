/* eslint-disable max-classes-per-file */

import * as React from "react";

import { Menu, MenuItem } from "@blueprintjs/core";
import { Example, IExampleProps } from "@blueprintjs/docs-theme";
import {
    Cell,
    Column,
    ColumnHeaderCell,
    CopyCellsMenuItem,
    IMenuContext,
    SelectionModes,
    Table,
    Utils,
} from "@blueprintjs/table";

export type ICellLookup = (rowIndex: number, columnIndex: number) => any;
export type ISortCallback = (columnIndex: number, comparator: (a: any, b: any) => number) => void;

export interface ISortableColumn {
    getColumn(getCellData: ICellLookup, sortColumn: ISortCallback): JSX.Element;
}

abstract class AbstractSortableColumn implements ISortableColumn {
  constructor(protected name: string, protected index: number) {}

  public getColumn(getCellData: ICellLookup, sortColumn: ISortCallback) {
    const cellRenderer = (rowIndex: number, columnIndex: number) => (
        <Cell>{getCellData(rowIndex, columnIndex)}</Cell>
    );
    const menuRenderer = this.renderMenu.bind(this, sortColumn);
    const columnHeaderCellRenderer = () => <ColumnHeaderCell name={this.name} menuRenderer={menuRenderer} />;
    return (
      <Column
        cellRenderer={cellRenderer}
        columnHeaderCellRenderer={columnHeaderCellRenderer}
        key={this.index}
        name={this.name}
      />
    );
  }

  protected abstract renderMenu(sortColumn: ISortCallback): JSX.Element;
}

class TextSortableColumn extends AbstractSortableColumn {
    protected renderMenu(sortColumn: ISortCallback) {
        const sortAsc = () => sortColumn(this.index, (a, b) => this.compare(a, b));
        const sortDesc = () => sortColumn(this.index, (a, b) => this.compare(b, a));
        return (
            <Menu>
                <MenuItem icon="sort-asc" onClick={sortAsc} text="Sort Asc" />
                <MenuItem icon="sort-desc" onClick={sortDesc} text="Sort Desc" />
            </Menu>
        );
    }

    private compare(a: any, b: any) {
        return a.toString().localeCompare(b);
    }
}

export class QueryResultTable extends React.Component<any> {
  public state = {
    columns: [
    ] as ISortableColumn[],
    rows: [] as any[],
    sortedIndexMap: [] as number[],
  };

  componentDidMount() {
  	if ( this.props.columns.length ) {
  		this._updateColumns();
  	}
  	if ( this.props.rows.length ) {
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

  _updateColumns() {
  	const {columns} = this.props;
  	const columnDefs = columns.map( (c: any) => {
  		const {friendly_name, type, name} = c;
  		return new TextSortableColumn(friendly_name, 0);
  	} );
  	this.setState({columns: columnDefs});
  }

  _updateRows() {
  	const cols = this.props.columns;
  	const rows = this.props.rows.map((r: any) => {
  		return cols.map( (c: any) => r[c.name] );
	  });
  	this.setState({rows});
  }

  public render() {
  	const {columns, rows} = this.state;

  	if ( !columns || !columns.length ) {
  		return null;
  	}

    const columnRenderables = this.state.columns.map(col => col.getColumn(this.getCellData, this.sortColumn));
    return (
      <div style={{maxHeight: '400px', overflow: 'scroll'}}>
        <Table
          bodyContextMenuRenderer={this.renderBodyContextMenu}
          numRows={rows.length}
          selectionModes={SelectionModes.COLUMNS_AND_CELLS}
        >
          {columnRenderables}
        </Table>
      </div>
    );
  }

  private getCellData = (rowIndex: number, columnIndex: number) => {
  	const {rows} = this.state;
    const sortedRowIndex = this.state.sortedIndexMap[rowIndex];
    if (sortedRowIndex != null) {
      rowIndex = sortedRowIndex;
    }
    return rows[rowIndex][columnIndex];
  };

  private renderBodyContextMenu = (context: IMenuContext) => {
    return (
      <Menu>
        <CopyCellsMenuItem context={context} getCellData={this.getCellData} text="Copy" />
      </Menu>
    );
  };

  private sortColumn = (columnIndex: number, comparator: (a: any, b: any) => number) => {
    const { rows } = this.state;
    const sortedIndexMap = Utils.times(rows.length, (i: number) => i);
    sortedIndexMap.sort((a: number, b: number) => {
        return comparator(rows[a][columnIndex], rows[b][columnIndex]);
    });
    this.setState({ sortedIndexMap });
  };
}


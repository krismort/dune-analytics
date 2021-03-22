// import * as _ from 'lodash';
import * as React from "react";

import {Button} from "@blueprintjs/core";

import AceEditor from "react-ace";

import './mysql-editor.css';

import 'ace-builds/src-noconflict/mode-mysql';
import 'ace-builds/src-noconflict/theme-tomorrow_night_eighties';

export class MySQLEditor extends React.Component<any, any> {
  state = {
    value: '',
    h: 250,
    w: 'auto',
    valueSet: false,
  };
  editor = React.createRef<AceEditor>();

  componentDidMount() {
    const value = this.props.value || '';
    this.setState({value, h: this.props.height || 400 }, () => {
      this._tryInit();
      this._updateAnnotations();
    });
  }

  async componentDidUpdate(prevProps: any /*, prevState: any*/ ) {
    if ( !prevProps.annotations && !this.props.annotations ) {
      return;
    }
    if ( (!prevProps.annotations && this.props.annotations) ||
          prevProps.annotations.length !== this.props.annotations.length ||
          (prevProps.annotations && JSON.stringify(prevProps.annotations || null) !== JSON.stringify(this.props.annotations || null) ) )
    {
      this._updateAnnotations();
    }
  }

  private _tryInit() {
    if ( this.state.value && !this.state.valueSet ) {
      this.state.valueSet = true;
      this.props?.onInit &&
        this.props?.onInit(this.state.value);
    }
  }

  private onChange = (value: string) => {
    this._tryInit();
    // console.log("change", value);
    this.setState({value});
    this.props?.onChange &&
      this.props?.onChange(value);
  };

  private onCursorChange = ( /* value: any, event?: any */ ) => {
    this.props?.onCursorChange &&
      this.props?.onCursorChange();
  }

  private _updateAnnotations() {
    const { editor } = (this.editor.current || {}) as any;
    if ( !editor ) {
      console.error('Waiting for editor referance');
      window.setTimeout(this._updateAnnotations, 1000 );
      return;
    }
    // debugger;
    const session = editor.getSession();
    const n = session.doc.$lines.length;
    const annotations = (this.props.annotations || []).map ( (x: any) => ({
      ...x,
      row: Math.max( 0, Math.min( x.row, n - 1 ) )
    }) );
    session.setAnnotations(annotations);
  }
 
  render() {
    return (
      <div className='flex-row'>
        <div style={{display: 'flex', flex: '0 0 100%', flexDirection: 'column' }}>
          <AceEditor
            ref={this.editor}
            mode="mysql"
            theme="tomorrow_night_eighties"
            onChange={this.onChange}
            onCursorChange={this.onCursorChange}
            value={this.state.value}
            width={'100%'}
            height={'300px'}
            name="mysql-editor"
            editorProps={{ $blockScrolling: true }}
          />
          <Button intent={'primary'} style={{minWidth: '100px', marginLeft: 'auto'}} onClick={this.props.onExecute}>Run</Button>
        </div>
      </div>
    );
  }
}

/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />

import * as React from 'react';

declare const require: any;

export interface Props {
    value: string;
    language: string;
    onChange?: (newValue: string) => any;
}

export class MonacoEditor extends React.Component<Props, {}> {
    refs: {
        [ name: string ]: Element;
        editor: HTMLDivElement
    };
    editor: monaco.editor.IStandaloneCodeEditor;
    _previousSize: number[];

    public render(): JSX.Element {
        return (
            <div className="monaco-editor" ref="editor" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}></div>
        );
    }

    public get value(): string {
        return this.editor.getValue();
    }

    public componentDidMount() {
        // Monaco requires the AMD module loader to be present on the page. It is not yet
        // compatible with ES6 imports. Once that happens, we can get rid of this.
        // See https://github.com/Microsoft/monaco-editor/issues/18
        (window as any)["require"](["vs/editor/editor.main"], () => {
            this.editor = monaco.editor.create(this.refs.editor, {
                value: this.props.value,
                language: this.props.language,
                lineNumbers: true,
                fontSize: 11
            });
            this.editor.onDidChangeModelContent((event) => {
                if(this.props.onChange) {
                    this.props.onChange(this.editor.getValue());
                }
            });
            this.forceUpdate();
        });
    }

    public componentDidUpdate(prevProps: Props) {
        if(!this.editor) return;
        let newSize = [ this.refs.editor.getBoundingClientRect().width, this.refs.editor.getBoundingClientRect().height ];
        if(!this._previousSize || this._previousSize[0] != newSize[0] || this._previousSize[1] != newSize[1]) {
            this.editor.layout();
            this._previousSize = newSize;
        }

        if(prevProps.value !== this.props.value && this.editor) {
            this.editor.setValue(this.props.value);
        }
        if(prevProps.language !== this.props.language) {
            throw new Error('<MonacoEditor> language cannot be changed.');
        }
    }
}
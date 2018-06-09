import * as monaco from 'monaco-editor';
import * as React from 'react';
import * as d3 from "d3";

export interface Props {
    value: string;
    language: string;
    onChange?: (newValue: string) => any;
}

export class MonacoEditor extends React.Component<Props, {}> {
    refs: {
        [name: string]: Element;
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
        this.editor = monaco.editor.create(this.refs.editor, {
            value: this.props.value,
            language: this.props.language,
            lineNumbers: "on",
            fontSize: 11,
            minimap: { enabled: false }
        });
        this.editor.onDidChangeModelContent((event) => {
            if (this.props.onChange) {
                this.props.onChange(this.editor.getValue());
            }
        });
        d3.text("stardust-bundle.d.ts").then((content) => {
            monaco.languages.typescript.javascriptDefaults.addExtraLib(content, "stardust-bundle.d.ts");
            monaco.languages.typescript.javascriptDefaults.addExtraLib(`
                    declare module Stardust {
                        import main = require('stardust-bundle/stardust');
                        export = main;
                    }
                `, "Stardust.d.ts");
        });
        this.forceUpdate();
    }

    public componentDidUpdate(prevProps: Props) {
        if (!this.editor) return;
        let newSize = [this.refs.editor.getBoundingClientRect().width, this.refs.editor.getBoundingClientRect().height];
        if (!this._previousSize || this._previousSize[0] != newSize[0] || this._previousSize[1] != newSize[1]) {
            this.editor.layout();
            this._previousSize = newSize;
        }

        if (prevProps.value !== this.props.value && this.editor) {
            let editorValue = this.editor.getValue();
            if (editorValue != this.props.value) {
                this.editor.setValue(this.props.value);
            }
        }
        if (prevProps.language !== this.props.language) {
            throw new Error('<MonacoEditor> language cannot be changed.');
        }
    }
}
import React, { Component } from "react";
import { render } from "react-dom";
import AceEditor from "react-ace";

const languages = [
    "html",
    "handlebars"
];
const themes = [
    "monokai",
    "xcode",
    "textmate",
    "solarized_dark"
];

languages.forEach(lang => {
    require(`ace-builds/src-noconflict/mode-${lang}`);
    require(`ace-builds/src-noconflict/snippets/${lang}`);
});

themes.forEach(theme => require(`ace-builds/src-noconflict/theme-${theme}`));
/*eslint-disable no-alert, no-console */
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-min-noconflict/ext-language_tools";

const defaultValue = `function onLoad(editor) {
    console.log("i've loaded");
}`;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: defaultValue,
            placeholder: "editor",
            theme: "monokai",
            mode: "handlebars",
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            fontSize: 16,
            showGutter: true,
            showPrintMargin: true,
            highlightActiveLine: true,
            enableSnippets: false,
            showLineNumbers: true
        };
        this.setPlaceholder = this.setPlaceholder.bind(this);
        this.setTheme = this.setTheme.bind(this);
        this.setMode = this.setMode.bind(this);
        this.onChange = this.onChange.bind(this);
        this.setFontSize = this.setFontSize.bind(this);
        this.setBoolean = this.setBoolean.bind(this);
    }
    onLoad() {
        console.log("i've loaded");
    }
    onChange(newValue) {
        console.log("change", newValue);
        this.setState({
            value: newValue
        });
    }
    onSelectionChange(newValue, event) {
        console.log("select-change", newValue);
        console.log("select-change-event", event);
    }
    onCursorChange(newValue, event) {
        console.log("cursor-change", newValue);
        console.log("cursor-change-event", event);
    }
    onValidate(annotations) {
        console.log("onValidate", annotations);
    }
    setPlaceholder(e) {
        this.setState({
            placeholder: e.target.value
        });
    }
    setTheme(e) {
        this.setState({
            theme: e.target.value
        });
    }
    setMode(e) {
        this.setState({
            mode: e.target.value
        });
    }
    setBoolean(name, value) {
        this.setState({
            [name]: value
        });
    }
    setFontSize(e) {
        this.setState({
            fontSize: parseInt(e.target.value, 10)
        });
    }
    render() {
        return (
            <div className="editor" id="template-editor">
                <h2>Editor</h2>
                <AceEditor
                    placeholder={this.state.placeholder}
                    mode={this.state.mode}
                    theme={this.state.theme}
                    name="template-editor"
                    onLoad={this.onLoad}
                    onChange={this.onChange}
                    onSelectionChange={this.onSelectionChange}
                    onCursorChange={this.onCursorChange}
                    onValidate={this.onValidate}
                    value={this.state.value}
                    fontSize={this.state.fontSize}
                    showPrintMargin={this.state.showPrintMargin}
                    showGutter={this.state.showGutter}
                    highlightActiveLine={this.state.highlightActiveLine}
                    setOptions={{
                        useWorker: false,
                        enableBasicAutocompletion: this.state
                            .enableBasicAutocompletion,
                        enableLiveAutocompletion: this.state
                            .enableLiveAutocompletion,
                        enableSnippets: this.state.enableSnippets,
                        showLineNumbers: this.state.showLineNumbers,
                        tabSize: 2
                    }}
                />
            </div>
        );
    }
}

render(<App />, document.getElementById("example"));

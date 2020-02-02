import React from 'react';
import { render } from 'react-dom';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';
const languages = ['html', 'handlebars', 'json'];
languages.forEach(lang => {
    require(`ace-builds/src-noconflict/mode-${lang}`);
    require(`ace-builds/src-noconflict/snippets/${lang}`);
});
import styles from './style/templateScreen.less';
console.log(styles);

const defaultValue = {
    template: `Hi {{name}},\nThis is a sample template.\nPaste your template here.`,
    json: `{\n\t"name": "wilspi"\n}`,
    html: ``
};

class TemplateScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            valueTemplate: defaultValue.template,
            valueJson: defaultValue.json,
            valueHtml: '',
            theme: 'monokai',
            fontSize: 16,
            width: 'auto',
            height: '400px'
        };
        this.getTemplateOutput = this.getTemplateOutput.bind(this); //TODO: Why
        this.renderTemplate = this.renderTemplate.bind(this);
        this.onTemplateChange = this.onTemplateChange.bind(this);
        this.onJsonChange = this.onJsonChange.bind(this);
    }

    getTemplateOutput() {
        console.log('render template is called');
        console.log(this.state.valueTemplate);
        console.log(this.state.valueJson);
        console.log(styles);
        return this.state.valueTemplate;
    }

    renderTemplate() {
        this.setState({ valueHtml: this.getTemplateOutput() });
    }

    onTemplateChange(newValue, event) {
        console.log("change", newValue);
        console.log("event", event);
        this.setState({ valueTemplate: newValue });
    }
    onJsonChange(newValue, event) {
        console.log("change", newValue);
        console.log("event", event);
        this.setState({ valueJson: newValue });
    }

    render() {
        return (
            <div className={styles.teScreen}>
                <div className={styles.teHeading}>
                    <h1>Template Editor</h1>
                </div>
                <div className={styles.teScreenTable}>
                    <div className={styles.teInputCol}>
                        <div className={styles.teTemplateEditor}>
                            <AceEditor
                                name="template-editor"
                                placeholder="Write your template file here..."
                                theme={this.state.theme}
                                mode="handlebars"
                                fontSize={this.state.fontSize}
                                height={this.state.height}
                                width={this.state.width}
                                value={this.state.valueTemplate}
                                onChange={this.onTemplateChange}
                            />
                        </div>
                        <div className={styles.teJsonEditor}>
                            <AceEditor
                                name="json-editor"
                                placeholder="Enter your json vslues here..."
                                theme={this.state.theme}
                                mode="json"
                                fontSize={this.state.fontSize}
                                height={this.state.height}
                                width={this.state.width}
                                value={this.state.valueJson}
                                onChange={this.onJsonChange}
                            />
                        </div>
                    </div>
                    <div className={styles.teOutputCol}>
                        <div className={styles.teHtmlEditor}>
                            <AceEditor
                                name="html-editor"
                                placeholder='Press "Render" to see the output here!'
                                theme={this.state.theme}
                                mode="html"
                                readOnly="true"
                                fontSize={this.state.fontSize}
                                height={this.state.height}
                                width={this.state.width}
                                value={this.state.valueHtml}
                                highlightActiveLine="false"
                            />
                        </div>
                        <button
                            className={styles.teRenderButton}
                            onClick={this.renderTemplate}
                        >
                        Render
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

render(<TemplateScreen />, document.getElementById('te-app'));

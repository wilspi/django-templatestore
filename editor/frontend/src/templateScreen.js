import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import AceEditor from 'react-ace-builds';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';
const languages = ['html', 'handlebars', 'json'];
languages.forEach(lang => {
    require(`ace-builds/src-noconflict/mode-${lang}`);
    require(`ace-builds/src-noconflict/snippets/${lang}`);
});
import styles from './style/templateScreen.less';

const defaultValue = {
    template: `Hi {{name}},\nThis is a sample template.\nPaste your template here.`,
    context: `{\n\t"name": "wilspi"\n}`,
    output: ``
};

class TemplateScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            valueTemplate: defaultValue.template,
            valueContext: defaultValue.context,
            valueOutput: '',
            theme: 'monokai',
            fontSize: 16,
            width: 'auto',
            height: '400px'
        };
        this.getTemplateOutput = this.getTemplateOutput.bind(this); //TODO: Why
        this.renderTemplate = this.renderTemplate.bind(this);
        this.onTemplateChange = this.onTemplateChange.bind(this);
        this.onContextChange = this.onContextChange.bind(this);
    }

    getTemplateOutput() {
        console.log('# calling render api');

        axios
            .get('./api/v1/render', {
                params: {
                    template: this.state.valueTemplate, //TODO: base64encode
                    context: this.state.valueContext,
                    handler: 'jinja2',
                    output: 'text'
                }
            })
            .then(response => {
                console.log(response);
                this.setState({ valueOutput: response.data.rendered_template });
            })
            .catch(function(error) {
                console.log(error);
            })
            .then(function() {
                // always executed
            });
        return this.state.valueTemplate;
    }

    renderTemplate() {
        const templateOutput = this.getTemplateOutput();
        console.log(templateOutput);
    }

    onTemplateChange(newValue, event) {
        this.setState({ valueTemplate: newValue, valueOutput: `` });
    }
    onContextChange(newValue, event) {
        this.setState({ valueContext: newValue, valueOutput: `` });
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
                        <div className={styles.teContextEditor}>
                            <AceEditor
                                name="context-editor"
                                placeholder="Enter your template values here..."
                                theme={this.state.theme}
                                mode="json"
                                fontSize={this.state.fontSize}
                                height={this.state.height}
                                width={this.state.width}
                                value={this.state.valueContext}
                                onChange={this.onContextChange}
                            />
                        </div>
                    </div>
                    <div className={styles.teOutputCol}>
                        <div className={styles.teOutputEditor}>
                            <AceEditor
                                name="output-editor"
                                placeholder='Press "Render" to see the output here!'
                                theme="github"
                                mode="html"
                                readOnly="true"
                                fontSize={this.state.fontSize}
                                height={this.state.height}
                                width={this.state.width}
                                value={this.state.valueOutput}
                                highlightActiveLine="false"
                            />
                        </div>
                        <div className={styles.teFourthQuad}>
                            <button
                                className={styles.teRenderButton}
                                onClick={this.renderTemplate}
                            >
                            Render
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

render(<TemplateScreen />, document.getElementById('te-app'));

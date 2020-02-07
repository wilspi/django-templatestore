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
//ace.config.setModuleUrl(
//    "ace/snippets/handlebars",
//    require("file-loader!ace-builds/src-noconflict/snippets/handlebars.js")
//);
import 'react-ace-builds/webpack-resolver-min';

//import 'ace-builds/src-noconflict/theme-monokai';
//import 'ace-builds/src-min-noconflict/ext-searchbox';
//import 'ace-builds/src-min-noconflict/ext-language_tools';
//const languages = ['html', 'handlebars', 'json'];
//languages.forEach(lang => {
//    require(`ace-builds/src-noconflict/mode-${lang}`);
//    require(`ace-builds/src-noconflict/snippets/${lang}`);
//});

//// https://github.com/ajaxorg/ace/wiki/Building-Ace-with-the-r.js-optimizer
//var config = require('ace-builds/src-noconflict/config');
//config.set("packaged", true);
//var path = "js/modules/ace/build/src-min";
//config.set("basePath", path);
//config.set("workerPath", path);
//config.set("modePath", path);
//config.set("themePath", path);

import styles from './style/templateScreen.less';
//console.log(styles);

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
        //        console.log(this.state.valueTemplate);
        //        console.log(this.state.valueJson);
        //        console.log(styles);

        axios
            .get('./api/v1/render', {
                params: {
                    template: this.state.valueTemplate, //TODO: base64encode
                    json: this.state.valueJson,
                    output: 'text'
                }
            })
            .then(response => {
                //why failing when we write function(), this is not accessible
                console.log(response);
                //                console.log(response.data);
                this.setState({ valueHtml: response.data.rendered_template });
                //                return response.data.rendered_template;
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
    //        this.setState({ valueHtml: templateOutput });
    }

    onTemplateChange(newValue, event) {
    //        console.log("change", newValue);
    //        console.log("event", event);
        this.setState({ valueTemplate: newValue });
    }
    onJsonChange(newValue, event) {
    //        console.log("change", newValue);
    //        console.log("event", event);
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
                                theme="github"
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

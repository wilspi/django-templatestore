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
            width: 'auto'
        };
        this.getTemplateOutput = this.getTemplateOutput.bind(this); //TODO: Why
    }

    getTemplateOutput() {
        console.log('render template is called');
        return 'this is the output';
    }

    renderTemplate() {}

    render() {
        return (
            <div>
                <div id="te-heading">
                    <h1>Template Editor</h1>
                </div>
                <div>
                    <div className="te-editor">
                        <AceEditor
                            name="template-editor"
                            placeholder="Write your template file here..."
                            theme={this.state.theme}
                            mode="handlebars"
                            fontSize={this.state.fontSize}
                            height="800px"
                            width={this.state.width}
                            value={this.state.valueTemplate}
                        />
                    </div>
                    <div className="te-editor">
                        <AceEditor
                            name="json-editor"
                            placeholder="Enter your json vslues here..."
                            theme={this.state.theme}
                            mode="json"
                            fontSize={this.state.fontSize}
                            height="400px"
                            width={this.state.width}
                            value={this.state.valueJson}
                        />
                    </div>
                    <div className="te-editor">
                        <AceEditor
                            name="html-editor"
                            placeholder='Press "Render" to see the output here!'
                            theme={this.state.theme}
                            mode="html"
                            readOnly="true"
                            fontSize={this.state.fontSize}
                            height="800px"
                            width={this.state.width}
                            value={this.state.valueHtml}
                            highlightActiveLine="false"
                        />
                    </div>
//                    <div className="te-editor">
//                        <iframe width="100%" height="254">
//                            <html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>
//                        </iframe>
//                    </div>
                    <button >Render</button>
                </div>
            </div>
        );
    }
}

render(<TemplateScreen />, document.getElementById('te-app'));

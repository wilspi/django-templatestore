import React from 'react';
import { Link } from 'react-router-dom';
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
            height: '400px',
            outputHeight: '800px',
            templateName: "",
            templateVersion: "",
            attributes: [],
            attr: {},
            default: false,
            versionList: [],
            updateOrNot: false
        };
        this.getTemplateOutput = this.getTemplateOutput.bind(this); //TODO: Why
        this.renderTemplate = this.renderTemplate.bind(this);
        this.onTemplateChange = this.onTemplateChange.bind(this);
        this.onContextChange = this.onContextChange.bind(this);
        this.loadData(this.props.match.params.name, this.props.match.params.version);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.loadData(nextProps.match.params.name, nextProps.match.params.version);
        }
    }

    handleChange(e) {
        //        this.setState({
        //            templateVersion: e.target.value
        //        });
        this.loadData(this.state.templateName, e.target.value);
    }

    loadData(templateName, templateVersion) {
        axios.get(`/template-editor/api/v1/template/${templateName}/${templateVersion}`).then(response => {
            let attributesList = [];
            let temp = {};
            for (let key in response.data.attributes) {
                temp[key] = response.data.attributes[key];
                attributesList.push(temp);
                temp = {};
            }
            this.setState({
                default: response.data.default,
                attributes: attributesList,
                attr: response.data.attributes,
                valueTemplate: response.data.data,
                valueContext: JSON.stringify(response.data.sample_context_data),
                templateVersion: response.data.version,
                templateName: response.data.name,
                valueOutput: ''
            });
        });
        axios.get(`/template-editor/api/v1/template/${templateName}`).then(response => {
            this.setState({
                versionList: response.data
            });
        });
    }

    getTemplateOutput() {
        axios
            .get('/template-editor/api/v1/render', {
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

    setDefaultVersion(templateName, templateVersion) {
        axios.post(`/template-editor/api/v1/template/${templateName}/${templateVersion}`, {
            default: true
        }).then(response => {
            this.loadData(this.state.templateName, this.state.templateVersion);
            console.log(response);
        }).catch(function(error) {
            console.log(error);
        });
    }

    renderTemplate() {
        const templateOutput = this.getTemplateOutput();
        console.log(templateOutput);
    }

    saveTemplate() {
        axios.post("/template-editor/api/v1/template", {
            name: this.state.templateName,
            data: this.state.valueTemplate,
            sample_context_data: JSON.parse(this.state.valueContext),
            attributes: this.state.attr
        }).then(response => {
            let versions = this.state.versionList;
            let temp = {};
            temp['name'] = this.state.templateName;
            temp['version'] = response.data.version;
            temp['default'] = false;
            var today = new Date();
            let month = today.getMonth() + 1;
            month = '' + month;
            if (month.length < 2) {
                month = '0' + month;
            }
            let date = '' + today.getDate();
            if (date.length < 2) {
                date = '0' + date;
            }
            temp['created_on'] = today.getFullYear() + '-' + month + '-' + date;
            versions.push(temp);
            temp = {};
            this.setState({
                versionList: versions
            });
            this.loadData(this.state.templateName, this.state.templateVersion);
            console.log(response);
        }).catch(function(error) {
            console.log(error);
        });
    }

    addAttributes() {
        let key = document.getElementById('attribute').value;
        let value = document.getElementById('value').value;
        if (key && value) {
            let attribute = this.state.attr;
            let attributesList = this.state.attributes;
            attribute[key] = value;
            let temp = {};
            temp[key] = value;
            let flag = 0;
            for (let i = 0; i < attributesList.length; i++) {
                for (let j in attributesList[i]) {
                    if (key === j) {
                        flag = 1;
                        attributesList[i][j] = value;
                    }
                }
            }
            if (flag === 0) {
                attributesList.push(temp);
            }
            document.getElementById('attribute').value = '';
            document.getElementById('value').value = '';
            this.setState({
                attr: attribute,
                updateOrNot: true,
                attributes: attributesList
            });
        }
    }

    updateAttributes() {
        axios.put(`/template-editor/api/v1/template/${this.state.templateName}`, {
            attributes: this.state.attr
        }).then(response => {
            this.setState({
                updateOrNot: false
            });
            this.loadData(this.state.templateName, this.state.templateVersion);
            console.log(response);
        }).catch(function(error) {
            console.log(error);
        });
    }

    onTemplateChange(newValue, event) {
        this.setState({ valueTemplate: newValue, valueOutput: `` });
    }

    onContextChange(newValue, event) {
        this.setState({ valueContext: newValue, valueOutput: `` });
    }

    render() {
        let sno = 1;
        let attributes = this.state.attributes.map((attribute) => {
            let rows = [];
            for (let key in attribute) {
                if (key !== "attribute1" && key !== "attribute2") {
                    rows.push(<td align = "center">{sno}</td>);
                    rows.push(<td align = "center">{key}</td>);
                    rows.push(<td align = "center">{attribute[key]}</td>);
                    sno = sno + 1;
                }
            }
            return (
                <tr>
                    {rows}
                </tr>
            );
        });
        let templateName = this.state.templateName;
        let templateVersion = this.state.templateVersion;
        let button = <button className={styles.teButtons} onClick={this.setDefaultVersion.bind(this, templateName, templateVersion)}> Set as Default </button>;

        if (this.state.default === true) {
            button = <button className={styles.teTheButtons}> Defaulted </button>;
        }
        let chooseVersion = this.state.versionList.map((versions) => {
            return (<option> {versions.version} </option>);
        });
        let versions = this.state.versionList.map((versions) => {
            let rows = [];
            let defaultButton = <button className={styles.teButtons} type="button" onClick={this.setDefaultVersion.bind(this, versions.name, versions.version)}> Set As Default </button>;
            if (versions.default === true) {
                defaultButton = <button className={styles.teTheButtons} type="button"> Defaulted </button>;
            }
            let OpenOrNot = <button className={styles.teButtons} type="button"> Open </button>;
            if (this.state.templateName === versions.name && this.state.templateVersion === versions.version) {
                OpenOrNot = <button className={styles.teTheButtons} type="button"> Opened </button>;
            }
            rows.push(<td align="center">{versions.version}</td>);
            rows.push(<td align="center">{versions.created_on}</td>);
            rows.push(
                <td align="center">
                    <Link to={`/template-editor/${versions.name}/${versions.version}`}>
                        {OpenOrNot}
                    </Link>
                </td>);
            rows.push(<td>{ defaultButton }</td>);
            return (
                <tr>
                    {rows}
                </tr>
            );
        });

        let DisabledOrEnabledRenderButton = <button className={styles.teButtons} onClick={this.renderTemplate}> Render </button>;
        let DisabledOrEnabledSaveButton = <button className={styles.teButtons} onClick={this.saveTemplate.bind(this)}> Save </button>;
        if (!this.state.valueTemplate || !this.state.valueContext) {
            DisabledOrEnabledSaveButton = <button className={styles.teButtons} onClick={this.saveTemplate.bind(this)} disabled="true"> Save </button>;
            DisabledOrEnabledRenderButton = <button className={styles.teButtons} onClick={this.renderTemplate} disabled="true"> Render </button>;
        }

        let updateButton = <button className={styles.teButtons} onClick={this.updateAttributes.bind(this)}>Update</button>;
        if (!this.state.updateOrNot) {
            updateButton = <button className={styles.teTheButtons} onClick={this.updateAttributes.bind(this)} disabled="true">Updated</button>;
        }

        return (
            <div className={styles.teScreen}>


                {/* Heading */}


                <div className={styles.teHeading}>
                    <h1> Template Editor </h1>
                </div>


                {/* Template Name and Version*/}

                <div className={styles.teTextFields}>
                    <label className={styles.teLabel} align="right">
                        Template__Name   :
                    </label>
                    <input readOnly type="text" id="tname" name="tname" className={styles.teInputField} value={this.state.templateName}/>
                    <br />
                    <label className={styles.teLabel}>
                        Template_Version :
                    </label>
                    <select id="type" className={styles.teButtons} value={this.state.templateVersion} onChange={this.handleChange.bind(this)}>
                        { chooseVersion }
                    </select>
                    <br />
                </div>


                {/* Template Screens */}

                <div className={styles.teScreenTable}>


                    {/* Input Screen */}


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


                        {/* Choice Field and Render Button */}


                        <div>
                            <label id="type" className={styles.teLabel}>
                                Choose a type :
                            </label>
                            <select id="type" className={styles.teButtons}>
                                <option value="text"> Text </option>
                                <option value="html"> HTML </option>
                                <option value="pdf"> PDF </option>
                            </select>
                            { DisabledOrEnabledRenderButton }
                        </div>
                    </div>


                    {/* Output Screen */}


                    <div className={styles.teOutputCol}>
                        <div className={styles.teOutputEditor}>
                            <AceEditor
                                name="output-editor"
                                placeholder='Press "Render" to see the output here!'
                                theme="github"
                                mode="html"
                                readOnly="true"
                                fontSize={this.state.fontSize}
                                height={this.state.outputHeight}
                                width={this.state.width}
                                value={this.state.valueOutput}
                                highlightActiveLine="false"
                            />
                        </div>
                        <br />


                        {/* Save and SetAsDefault Buttons */}


                        <div>
                            { DisabledOrEnabledSaveButton }
                            { button }
                        </div>
                    </div>
                </div>


                {/* Attributes */}


                <div>
                    <div className={styles.teHeading}>
                        <h3> Attributes </h3>
                    </div>
                    <div align="left">
                        <table className={styles.teTables}>
                            <thead>
                                <tr className={styles.teHeading}>
                                    <th> SNo. </th>
                                    <th> ATTRIBUTES </th>
                                    <th> VALUE </th>
                                </tr>
                            </thead>
                            <tbody>
                                {attributes}
                            </tbody>
                        </table>
                    </div>
                    <div align="center">
                        <div align="center">
                            <label className={styles.teLabel}>
                                Attribute   :
                            </label>
                            <input className={styles.teInputField} type="text" name="attribute" id="attribute" />
                            <br />
                            <label className={styles.teLabel}>
                                Value   :
                            </label>
                            <input className={styles.teInputField} type="text" name="value" id="value" />
                            <br />
                        </div>
                        <div align="center">
                            <button className={styles.teButtons} onClick={this.addAttributes.bind(this)}>Add</button>
                            { updateButton }
                        </div>
                    </div>
                </div>


                {/* Version Table */}

                <div className={styles.teHeading}>
                    <h3> Versions </h3>
                </div>
                <div align="left">
                    <table className={styles.teTables}>
                        <thead>
                            <tr className={styles.teHeading}>
                                <th> VERSIONS </th>
                                <th> CREATED_ON </th>
                                <th>  </th>
                                <th>  </th>
                            </tr>
                        </thead>
                        <tbody>
                            {versions}
                        </tbody>
                    </table>
                </div>


                {/* BACK Button*/}


                <br />
                <br />
                <div align="center" className={styles.teHeading}>
                    <Link to={"/template-editor/"}>
                        <button className={styles.teButtons} type="button"> Back </button>
                    </Link>
                </div>

                {/* Others */}


            </div>
        );
    }
}
export default TemplateScreen;

import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import styles from './../style/templateScreen.less';
import SearchBox from './../components/searchBox.js';
import Highlight from './../components/highlight.js';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
const languages = ['html', 'handlebars', 'json'];
languages.forEach(lang => {
    require(`ace-builds/src-noconflict/mode-${lang}`);
    require(`ace-builds/src-noconflict/snippets/${lang}`);
});

class TemplateScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templateData: {
                name: this.props.match.params.name,
                version: this.props.match.params.version
            },
            versions: [{ version: this.props.match.params.version }],
            subTemplatesData: {}
        };
        this.aceconfig = {
            theme: 'monokai',
            fontSize: 16,
            width: 'auto',
            height: '700px'
        };
        this.getTableRowsJSX = this.getTableRowsJSX.bind(this);
        this.openTemplateVersion = this.openTemplateVersion.bind(this);
        this.setDefaultVersion = this.setDefaultVersion.bind(this);
        this.getDateInSimpleFormat = this.getDateInSimpleFormat.bind(this);
        this.getRenderedTemplate = this.getRenderedTemplate.bind(this);
        this.onTemplateChange = this.onTemplateChange.bind(this);
        this.onContextChange = this.onContextChange.bind(this);
        this.onAttributesChange = this.onAttributesChange.bind(this);
        this.displayEditors = this.displayEditors.bind(this);
        this.createTemplate = this.createTemplate.bind(this);
    }
    componentDidMount() {
        if (this.state.templateData.name && this.state.templateData.name) {
            axios
                .get(
                    '/templatestore/api/v1/template/' +
                    this.state.templateData.name +
                    '/' +
                    this.state.templateData.version
                )
                .then(response => {
                    console.log(response.data);
                    this.setState({
                        subTemplatesData: response.data.sub_templates.reduce(
                            (result, k) => {
                                result[k.sub_type] = {
                                    data: k.data,
                                    subType: k.sub_type,
                                    renderMode: k.render_mode,
                                    output: ''
                                };
                                return result;
                            },
                            {}
                        ),
                        templateData: {
                            name: this.props.match.params.name,
                            version: this.props.match.params.version,
                            default: response.data.default
                        },
                        contextData: response.data.sample_context_data,
                        attributes: response.data.attributes,
                        type: response.data.type
                    });
                })
                .catch(error => {
                    console.log(error);
                    if (error.response.status === 400) {
                        this.props.history.push('/templatestore/404');
                    }
                });

            axios
                .get(
                    '/templatestore/api/v1/template/' +
                    this.state.templateData.name +
                    '/versions'
                )
                .then(response => {
                    this.setState({
                        versions: response.data.map(t => ({
                            version: t.version,
                            default: t.default,
                            created_on: this.getDateInSimpleFormat(t.created_on)
                        }))
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    getDateInSimpleFormat(datestr) {
        let d = new Date(datestr);
        return d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
    }

    openTemplateVersion(version) {
        this.props.history.push(
            '/templatestore/t/' + this.state.templateData.name + '/' + version
        );
    }
    setDefaultVersion(version) {
        axios
            .post(
                '/templatestore/api/v1/template/' +
                    this.state.templateData.name +
                    '/' +
                    version,
                {
                    default: true
                }
            )
            .then(response => {
                this.props.history.push(
                    '/templatestore/t/' +
                        response.data.name +
                        '/' +
                        response.data.version
                );
            })
            .catch(error => {
                console.log(error);
            });
    }

    onSearchTextChange(searchValue) {
        this.setState({
            searchText: searchValue
        });
    }

    getTableRowsJSX() {
        let tableRows = Object.values(this.state.versions).map(k => (
            <tr>
                <td>
                    <Highlight search={this.state.searchText}>
                        {k.version}
                    </Highlight>
                </td>
                <td>
                    <Highlight search={this.state.searchText}>
                        {k.created_on}
                    </Highlight>
                </td>
                <td>
                    <button
                        type="button"
                        onClick={() => this.openTemplateVersion(k.version)}
                    >
                        Open
                    </button>
                </td>
                <td>
                    <button
                        type="button"
                        onClick={() => this.setDefaultVersion(k.version)}
                    >
                        Set Default Version
                    </button>
                </td>
            </tr>
        ));
        return tableRows;
    }

    getRenderedTemplate(subType, templateData, contextData, renderMode) {
        axios
            .get('/templatestore/api/v1/render', {
                params: {
                    template: templateData,
                    context: contextData,
                    handler: 'jinja2',
                    output: renderMode
                }
            })
            .then(response => {
                this.setState({
                    subTemplatesData: Object.keys(
                        this.state.subTemplatesData
                    ).reduce((result, k) => {
                        result[k] = this.state.subTemplatesData[k];
                        result[k].output =
                            k === subType ?
                                response.data.rendered_template :
                                this.state.subTemplatesData[k].output;
                        return result;
                    }, {})
                });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    onTemplateChange(subType, templateData) {
        this.setState({
            subTemplatesData: Object.keys(this.state.subTemplatesData).reduce(
                (result, k) => {
                    result[k] = this.state.subTemplatesData[k];
                    result[k].data =
                        k === subType ?
                            templateData :
                            this.state.subTemplatesData[k].data;
                    return result;
                },
                {}
            )
        });
    }

    onContextChange(newValue) {
        this.setState({
            contextData: newValue
        });
    }

    onAttributesChange(newValue) {
        this.setState({
            attributes: newValue
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

    displayEditors(type) {
        if (type === "email") {
            let a = { subject: { data: "", subType: "subject", renderMode: "text", output: "" },
                textpart: { data: "", subType: "textpart", renderMode: "text", output: "" },
                htmlpart: { data: "", subType: "htmlpart", renderMode: "html", output: "" }
            };
            this.setState({
                subTemplatesData: a
            });
        } else if (type === "sms") {
            let a = { textpart: { data: "", subType: "textpart", renderMode: "text", output: "" } };
            this.setState({
                subTemplatesData: a
            });
        } else {
            this.setState({
                subTemplatesData: {}
            });
        }
        this.setState({
            type: type
        });
    }

    createTemplate(name, type, contextData, attributes) {
        let subTemplates = [];
        Object.keys(this.state.subTemplatesData).map(t => {
            let subTemplate = {
                sub_type: this.state.subTemplatesData[t].subType,
                data: this.state.subTemplatesData[t].data
            };
            subTemplates.push(subTemplate);
        });
        let data = {
            name: name,
            type: type,
            sub_template: subTemplates,
            sample_context_data: JSON.parse(contextData),
            attributes: JSON.parse(attributes)
        };
        axios
            .post('/templatestore/api/v1/template', data).then(response => {
                this.props.history.push(
                    '/templatestore/t/' +
                        response.data.name +
                        '/' +
                        response.data.version
                );
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        let chooseVersion = this.state.versions.map(versions => {
            return (
                <option value={versions.version}> {versions.version} </option>
            );
        });
        let tableHeaders = ['version', 'created_on', ' - ', ' - '].map(k => (
            <th>{k}</th>
        ));
        let templateName = <input type="text" id="tmp_name"/>;
        if (this.state.templateData.name) {
            templateName = <input readOnly type="text" value={this.state.templateData.name} />;
        }
        let templateHeader = "Create New Template";
        if (this.state.templateData.name) {
            templateHeader = this.state.templateData.name;
        }

        let editors = Object.keys(this.state.subTemplatesData).map(t => {
            let outputView =
                this.state.subTemplatesData[t].renderMode === 'html' ? (
                    <iframe
                        height={this.aceconfig.height}
                        width={this.aceconfig.width}
                        srcDoc={this.state.subTemplatesData[t].output}
                    />
                ) : (
                    <AceEditor
                        name="output-editor"
                        placeholder='Press "Render" to see the output here!'
                        theme="github"
                        mode="html"
                        readOnly="true"
                        fontSize={this.aceconfig.fontSize}
                        height={this.aceconfig.height}
                        width={this.aceconfig.width}
                        value={this.state.subTemplatesData[t].output}
                        highlightActiveLine="false"
                    />
                );
            return (
                <div className={styles.teRowBlock}>
                    <div>
                        <h3>{t}</h3>
                    </div>
                    <div className={styles.teSubTemplateBlock}>
                        <div className={styles.teTemplateEditor}>
                            <AceEditor
                                name="template-editor"
                                placeholder="Write your template file here..."
                                theme={this.aceconfig.theme}
                                mode="handlebars"
                                fontSize={this.aceconfig.fontSize}
                                height={this.aceconfig.height}
                                width={this.aceconfig.width}
                                value={this.state.subTemplatesData[t].data}
                                onChange={n => {
                                    this.onTemplateChange(t, n);
                                }}
                            />
                        </div>
                        <div className={styles.teOutputEditor}>
                            {outputView}
                        </div>
                    </div>
                    <div>
                        <label className={styles.teLabel}>
                            Choose a type :
                        </label>
                        <select readOnly className={styles.teButtons} value={this.state.subTemplatesData[t].renderMode}>
                            <option value="text"> Text </option>
                            <option value="html"> HTML </option>
                        </select>
                        <button
                            className={styles.teButtons}
                            onClick={() => {
                                this.getRenderedTemplate(
                                    t,
                                    this.state.subTemplatesData[t].data,
                                    this.state.contextData,
                                    this.state.subTemplatesData[t].renderMode
                                );
                            }}
                        >
                            Render
                        </button>
                    </div>
                </div>
            );
        });
        //        editors.push(
        //            <div className={styles.teRowBlock}>
        //                <div className={styles.teContextEditor}>
        //                    <AceEditor
        //                        name="context-editor"
        //                        placeholder="Enter your template values here..."
        //                        theme={this.aceconfig.theme}
        //                        mode="json"
        //                        fontSize={this.aceconfig.fontSize}
        //                        height={this.aceconfig.height}
        //                        width={this.aceconfig.width}
        //                        value={this.state.contextData}
        //                        /*onChange={this.onContextChange*/
        //                    />
        //                </div>
        //            </div>
        //        );

        return (
            <div>
                <div>
                    <div>
                        <h1>{templateHeader}</h1>
                    </div>
                    <div>
                        <label>Name : </label>
                        {templateName}
                        <br />
                        {
                            this.state.templateData.name && this.state.templateData.version ?
                                <div>
                                    <label>Version : </label>
                                    <select id="type" className={styles.teButtons} value={this.state.templateData.version}
                                        onChange={e => this.openTemplateVersion(e.target.value)} > {chooseVersion} </select>
                                    { this.state.templateData.default ?
                                        'default' :
                                        'not_default'
                                    }
                                </div> : ""
                        }
                        <br />
                    </div>
                </div>
                <div>
                    {
                        this.state.templateData.name && this.state.templateData.version ? "" :
                            <div>
                                <label> Type : </label>
                                <select className={styles.teButtons} onChange={e => this.displayEditors(e.target.value)}>
                                    <option value="none"> None </option>
                                    <option value="email"> Email </option>
                                    <option value="sms"> Sms </option>
                                </select>
                            </div>
                    }
                </div>
                <div className={styles.teScreenTable}>{editors}</div>
                <div>
                    {
                        !this.state.templateData.name && !this.state.templateData.version && this.state.type ?
                            <div className={styles.teRowBlock}>
                                <div className={styles.teSubTemplateBlock}>
                                    <div className={styles.teTemplateEditor}>
                                        <div>
                                            <h3>Sample Context Data</h3>
                                        </div>
                                        <AceEditor
                                            name="template-editor"
                                            placeholder="Write sample_context_data here..."
                                            theme={this.aceconfig.theme}
                                            mode="handlebars"
                                            fontSize={this.aceconfig.fontSize}
                                            height={this.aceconfig.height}
                                            width={this.aceconfig.width}
                                            value={this.state.contextData}
                                            onChange={n => {
                                                this.onContextChange(n);
                                            }}
                                        />
                                    </div>
                                    <div className={styles.teOutputEditor}>
                                        <div>
                                            <h3> Attributes </h3>
                                        </div>
                                        <AceEditor
                                            name="template-editor"
                                            placeholder="Write attributes here..."
                                            theme={this.aceconfig.theme}
                                            mode="handlebars"
                                            fontSize={this.aceconfig.fontSize}
                                            height={this.aceconfig.height}
                                            width={this.aceconfig.width}
                                            value={this.state.attributes}
                                            onChange={n => {
                                                this.onAttributesChange(n);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div> : ""
                    }
                </div>
                <div>
                    {this.state.templateData.name && this.state.templateData.version ?
                        <SearchBox onChange={this.onSearchTextChange.bind(this)} /> : "" }
                </div>
                <div>
                    {
                        this.state.templateData.name && this.state.templateData.version ?
                            <table className={'table table-striped table-responsive-md btn-table ' + styles.tsTable}>
                                <thead>
                                    <tr>{tableHeaders}</tr>
                                </thead>
                                <tbody>
                                    {this.getTableRowsJSX()}
                                </tbody>
                            </table> : ""
                    }
                </div>
                <div>
                    {
                        this.state.templateData.name && this.state.templateData.version ? "" :
                            <button
                                className={styles.teButtons}
                                onClick={() => {
                                    this.createTemplate(
                                        document.getElementById('tmp_name').value,
                                        this.state.type,
                                        this.state.contextData,
                                        this.state.attributes
                                    );
                                }}
                            >
                                Create
                            </button>
                    }
                </div>
            </div>
        );
    }
}

export default withRouter(TemplateScreen);

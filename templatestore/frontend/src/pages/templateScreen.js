import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { encode, decode, backendSettings } from './../utils.js';
import styles from './../style/templateScreen.less';
import SearchBox from './../components/searchBox/index';
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
            height: '400px'
        };
        this.getTableRowsJSX = this.getTableRowsJSX.bind(this);
        this.openTemplateVersion = this.openTemplateVersion.bind(this);
        this.setDefaultVersion = this.setDefaultVersion.bind(this);
        this.getDateInSimpleFormat = this.getDateInSimpleFormat.bind(this);
        this.getRenderedTemplate = this.getRenderedTemplate.bind(this);
        this.onTemplateChange = this.onTemplateChange.bind(this);
    }
    componentDidMount() {
        axios
            .get(
                backendSettings.TE_BASEPATH +
                    '/api/v1/template/' +
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
                                data: decode(k.data),
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
                    this.props.history.push(
                        backendSettings.TE_BASEPATH + '/404'
                    );
                }
            });

        axios
            .get(
                backendSettings.TE_BASEPATH +
                    '/api/v1/template/' +
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

    getDateInSimpleFormat(datestr) {
        let d = new Date(datestr);
        return d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
    }

    openTemplateVersion(version) {
        this.props.history.push(
            backendSettings.TE_BASEPATH +
                '/t/' +
                this.state.templateData.name +
                '/' +
                version
        );
    }
    setDefaultVersion(version) {
        axios
            .post(
                backendSettings.TE_BASEPATH +
                    '/api/v1/template/' +
                    this.state.templateData.name +
                    '/' +
                    version,
                {
                    default: true
                }
            )
            .then(response => {
                this.props.history.push(
                    backendSettings.TE_BASEPATH +
                        '/t/' +
                        response.data.name +
                        '/' +
                        response.data.version
                );
            })
            .catch(error => {
                console.log(error);
            });
    }

    onTextChange(searchValue) {
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
            .get(backendSettings.TE_BASEPATH + '/api/v1/render', {
                params: {
                    template: encode(templateData),
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
                                decode(response.data.rendered_template) :
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

    getTemplateOutput() {
        axios
            .get('/template-editor/api/v1/render', {
                params: {
                    template: encode(this.state.valueTemplate), //TODO: base64encode
                    context: this.state.valueContext,
                    handler: 'jinja2',
                    output: 'text'
                }
            })
            .then(response => {
                console.log(response);
                this.setState({
                    valueOutput: decode(response.data.rendered_template)
                });
            })
            .catch(function(error) {
                console.log(error);
            })
            .then(function() {
                // always executed
            });
        return this.state.valueTemplate;
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
                    <div className={styles.teVersionWrapper}>
                        <label className={styles.teLabel}>
                            Choose a type :
                        </label>
                        <select
                            readOnly
                            className={styles.teButtons}
                            value={this.state.subTemplatesData[t].renderMode}
                        >
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
            <div className="container ">
                <div className={styles.teDetailPage}>
                    <div>
                        <h1>{this.state.templateData.name}</h1>
                    </div>
                    <div>
                        <input
                            readOnly
                            type="text"
                            value={this.state.templateData.name}
                        />
                        <br />
                        <div className={styles.teVersionWrapper}>
                            <label>Version : </label>
                            <select
                                id="type"
                                className={styles.teButtons}
                                value={this.state.templateData.version}
                                onChange={e =>
                                    this.openTemplateVersion(e.target.value)
                                }
                            >
                                {chooseVersion}
                            </select>
                            <div className={styles.teDefaultLabel}>{this.state.templateData.default ? 'default' : 'not_default'}</div>
                            <br />
                        </div>
                    </div>
                </div>
                <div className={styles.teScreenTable}>{editors}</div>
                <div>
                    <SearchBox onChange={this.onTextChange.bind(this)} />
                </div>
                <div className={styles.teTableWrapper}>
                    <table
                        className={
                            'table table-striped table-responsive-md btn-table ' +
                            styles.tsTable
                        }
                    >
                        <thead>
                            <tr>{tableHeaders}</tr>
                        </thead>
                        <tbody>{this.getTableRowsJSX()}</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default withRouter(TemplateScreen);

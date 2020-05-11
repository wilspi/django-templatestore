import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import {
    encode,
    decode,
    backendSettings,
    getDateInSimpleFormat
} from './../utils.js';
import styles from './../style/templateScreen.less';
import SearchBox from './../components/searchBox';
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
            searchText: '',
            versions: [{ version: this.props.match.params.version }],
            subTemplatesData: {},
            editable: this.props.editable
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
        this.getRenderedTemplate = this.getRenderedTemplate.bind(this);
        this.onTemplateChange = this.onTemplateChange.bind(this);
        this.onContextChange = this.onContextChange.bind(this);
        this.onAttributesChange = this.onAttributesChange.bind(this);
        this.getTypesConfig = this.getTypesConfig.bind(this);
        this.postTemplate = this.postTemplate.bind(this);
    }
    componentDidMount() {
        if (!this.state.editable) {
            axios
                .get(
                    backendSettings.TE_BASEPATH +
                        '/api/v1/template/' +
                        this.state.templateData.name +
                        '/' +
                        this.state.templateData.version
                )
                .then(response => {
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
                            created_on: getDateInSimpleFormat(t.created_on)
                        }))
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            this.getTypesConfig('email');
        }
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

    onSearchTextChange(searchValue) {
        this.setState({
            searchText: searchValue
        });
    }

    getTableRowsJSX() {
        let filteredVersionList = this.state.versions.reduce(
            (result, version) => {
                if (
                    Object.keys(version).reduce((res, t) => {
                        res =
                            res ||
                            version[t]
                                .toString()
                                .indexOf(this.state.searchText) !== -1;
                        return res;
                    }, false)
                ) {
                    result.push(version);
                }
                return result;
            },
            []
        );
        let tableRows = Object.values(filteredVersionList).map(k => (
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
                    {k.version === this.state.templateData.version ? (
                        <button type="button" disabled>
                            {' '}
                            Opened{' '}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => this.openTemplateVersion(k.version)}
                        >
                            {' '}
                            Open{' '}
                        </button>
                    )}
                </td>
                <td>
                    {k.default ? (
                        <button type="button" disabled>
                            {' '}
                            Defaulted{' '}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => this.setDefaultVersion(k.version)}
                        >
                            Set Default Version
                        </button>
                    )}
                </td>
            </tr>
        ));
        return tableRows;
    }

    getRenderedTemplate(subType, templateData, contextData, renderMode) {
        let data = {
            template: encode(templateData),
            context: contextData,
            handler: 'jinja2',
            output: renderMode
        };
        axios
            .post(backendSettings.TE_BASEPATH + '/api/v1/render', data)
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
            .get(backendSettings.TE_BASEPATH + '/api/v1/render', {
                params: {
                    template: encode(this.state.valueTemplate),
                    context: this.state.valueContext,
                    handler: 'jinja2',
                    output: 'text' // get renderMode
                }
            })
            .then(response => {
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

    getTypesConfig(type) {
        axios
            .get(backendSettings.TE_BASEPATH + '/api/v1/config')
            .then(response => {
                this.setState({
                    subTemplatesData: response.data[type].sub_type.reduce(
                        (result, k) => {
                            result[k.type] = {
                                subType: k.type,
                                renderMode: k.render_mode,
                                data: '',
                                output: ''
                            };
                            return result;
                        },
                        {}
                    )
                });
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    postTemplate(name, type, contextData, attributes) {
        let subTemplates = [];
        Object.keys(this.state.subTemplatesData).map(t => {
            let subTemplate = {
                sub_type: this.state.subTemplatesData[t].subType,
                data: encode(this.state.subTemplatesData[t].data)
            };
            subTemplates.push(subTemplate);
        });
        let data = {
            name: name,
            type: type,
            sub_templates: subTemplates,
            sample_context_data: contextData,
            attributes: attributes
        };
        axios
            .post(backendSettings.TE_BASEPATH + '/api/v1/template', data)
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
            let inputView = (
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
            );
            return (
                <div className={styles.teRowBlock}>
                    <div>
                        <h3>{t}</h3>
                    </div>
                    <div className={styles.teSubTemplateBlock}>
                        <div className={styles.teTemplateEditor}>
                            {inputView}
                        </div>
                        <div className={styles.teOutputEditor}>
                            {outputView}
                        </div>
                    </div>
                    <div className={styles.teVersionWrapper}>
                        <label className={styles.teLabel}>Render Mode :</label>
                        <select
                            readOnly
                            className={styles.teButtons}
                            value={this.state.subTemplatesData[t].renderMode}
                        >
                            <option value="text" disabled>
                                {' '}
                                Text{' '}
                            </option>
                            <option value="html" disabled>
                                {' '}
                                HTML{' '}
                            </option>
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
        return (
            <div className="container ">
                <div className={styles.teDetailPage}>
                    <div>
                        <h1>
                            {this.state.editable ?
                                'Create New Template' :
                                this.state.templateData.name}
                        </h1>
                    </div>
                    <div>
                        {this.state.editable ? (
                            <input
                                type="text"
                                id="tmp_name"
                                placeholder="Add template name"
                            />
                        ) : (
                            <input
                                readOnly
                                type="text"
                                value={this.state.templateData.name}
                            />
                        )}
                        <br />
                        <div className={styles.teVersionWrapper}>
                            <label>Version : </label>
                            {!this.state.editable ? (
                                <select
                                    id="type"
                                    className={styles.teButtons}
                                    value={this.state.templateData.version}
                                    onChange={e =>
                                        this.openTemplateVersion(e.target.value)
                                    }
                                >
                                    {' '}
                                    {chooseVersion}{' '}
                                </select>
                            ) : (
                                <select
                                    id="type"
                                    className={styles.teButtons}
                                    value={0.1}
                                />
                            )}
                            {!this.state.editable &&
                            this.state.templateData.default ?
                                'default' :
                                'not_default'}
                        </div>

                        <br />
                    </div>
                </div>
                <div>
                    {this.state.editable ? (
                        <div>
                            <label> Type : </label>
                            <select
                                className={styles.teButtons}
                                onChange={e =>
                                    this.getTypesConfig(e.target.value)
                                }
                            >
                                <option value="email" selected>
                                    {' '}
                                    Email{' '}
                                </option>
                                <option value="sms"> Sms </option>
                            </select>
                        </div>
                    ) : (
                        ''
                    )}
                </div>
                <div className={styles.teScreenTable}>{editors}</div>
                <div>
                    {
                        <div className={styles.teRowBlock}>
                            <div className={styles.teSubTemplateBlock}>
                                <div className={styles.teContextEditor}>
                                    <div>
                                        <h3>Sample Context Data</h3>
                                    </div>
                                    <AceEditor
                                        name="template-editor"
                                        placeholder="Write sample_context_data here..."
                                        theme={this.aceconfig.theme}
                                        mode="json"
                                        fontSize={this.aceconfig.fontSize}
                                        height={this.aceconfig.height}
                                        width={this.aceconfig.width}
                                        value={JSON.stringify(
                                            this.state.contextData
                                        )}
                                        onChange={n => {
                                            this.onContextChange(JSON.parse(n));
                                        }}
                                    />
                                </div>
                                <div className={styles.teContextEditor}>
                                    <div>
                                        <h3> Attributes </h3>
                                    </div>
                                    <AceEditor
                                        name="template-editor"
                                        placeholder="Write attributes here..."
                                        theme={this.aceconfig.theme}
                                        mode="json"
                                        fontSize={this.aceconfig.fontSize}
                                        height={this.aceconfig.height}
                                        width={this.aceconfig.width}
                                        value={JSON.stringify(
                                            this.state.attributes
                                        )}
                                        onChange={n => {
                                            this.onAttributesChange(
                                                JSON.parse(n)
                                            );
                                        }}
                                        readOnly={!this.state.editable}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <div>
                    {this.state.editable ? (
                        ''
                    ) : (
                        <SearchBox
                            onChange={this.onSearchTextChange.bind(this)}
                        />
                    )}
                </div>
                <div className={styles.teTableWrapper}>
                    {this.state.editable ? (
                        ''
                    ) : (
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
                    )}
                </div>
                <div>
                    {this.state.editable ? (
                        <button
                            className={styles.teButtons}
                            onClick={() => {
                                this.postTemplate(
                                    document.getElementById('tmp_name').value,
                                    this.state.type,
                                    this.state.contextData,
                                    this.state.attributes
                                );
                            }}
                        >
                            Create
                        </button>
                    ) : (
                        ''
                    )}
                </div>
            </div>
        );
    }
}

export default withRouter(TemplateScreen);

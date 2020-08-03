import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import {
    encode,
    decode,
    backendSettings,
    getDateInSimpleFormat
} from './../utils.js';
import PropTypes from 'prop-types';
import styles from './../style/templateScreen.less';
import SearchBox from './../components/searchBox/index';
import Highlight from './../components/highlight.js';
import 'ace-builds';
import 'ace-builds/webpack-resolver';
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
            config: {},
            contextData: '',
            attributes: '{}',
            version_alias: '',
            editable: this.props.editable
        };
        this.aceconfig = {
            theme: 'monokai',
            fontSize: 16,
            width: '100%',
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
        this.saveTemplate = this.saveTemplate.bind(this);
        this.setMandatoryAttributes = this.setMandatoryAttributes.bind(this);
        this.onVersionAliasChange = this.onVersionAliasChange.bind(this);
        this.getAttributes = this.getAttributes.bind(this);
        this.buildOptions = this.buildOptions.bind(this);
        this.addNewAttribute = this.addNewAttribute.bind(this);
        this.updateAttributes = this.updateAttributes.bind(this);
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
                        contextData: JSON.stringify(
                            response.data.sample_context_data,
                            null,
                            2
                        ),
                        attributes: JSON.stringify(
                            response.data.attributes
                        ),
                        type: response.data.type,
                        version_alias: response.data.version_alias
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
                            created_on: getDateInSimpleFormat(t.created_on),
                            version_alias: t.version_alias ? t.version_alias : '-',
                            created_by: t.created_by ? t.created_by.toString() : '-'
                        }))
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        }

        axios
            .get(backendSettings.TE_BASEPATH + '/api/v1/config')
            .then(response => {
                if (this.state.editable) {
                    this.setState({
                        contextData: JSON.stringify({ name: 'abc' }, null, 2),
                        config: response.data
                    });
                    let defaultType = Object.keys(response.data)[0];
                    this.getTypesConfig(response.data, defaultType);
                } else {
                    this.setState({
                        config: response.data
                    });
                }
            })
            .catch(function(error) {
                console.log(error);
            });
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
                                .toLowerCase()
                                .indexOf(this.state.searchText.toLowerCase()) !== -1;
                        return res;
                    }, false)
                ) {
                    result.push(version);
                }
                return result;
            },
            []
        );
        let tableRows = Object.values(filteredVersionList).map((k, index) => (
            <tr key={index}>
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
                    <Highlight search={this.state.searchText}>
                        {k.version_alias}
                    </Highlight>
                </td>
                <td>
                    <Highlight search={this.state.searchText}>
                        {k.created_by}
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
            context: JSON.parse(contextData),
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
        if (renderMode === 'html') {
            this.setState({
                previewSubType: subType
            });
        }
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

    onContextChange(newValue, event) {
        this.setState({
            contextData: newValue
        });
    }

    onAttributesChange(attributeKey, newValue, keyChange = false) {
        let currentAttributes = JSON.parse(this.state.attributes);
        let newAttributes = {};
        if (keyChange) {
            newAttributes = Object.keys(currentAttributes).reduce(
                (result, attribute) => {
                    if (attribute === attributeKey) {
                        result[newValue] = currentAttributes[attributeKey];
                    } else {
                        result[attribute] = currentAttributes[attribute];
                    }
                    return result;
                },
                {}
            );
        } else {
            newAttributes = currentAttributes;
            newAttributes[attributeKey] = newValue;
        }
        this.setState({
            attributes: JSON.stringify(newAttributes)
        });
    }

    onVersionAliasChange(newValue, event) {
        this.setState({
            version_alias: newValue
        });
    }

    setMandatoryAttributes(type) {
        let mandatoryAttributes = {
            ...backendSettings.TE_TEMPLATE_ATTRIBUTES,
            ...this.state.config[type]["attributes"]
        };
        let newAttributes = Object.keys(mandatoryAttributes).reduce(
            (result, attribute) => {
                result[attribute] = '';
                return result;
            },
            {}
        );
        this.setState({
            attributes: JSON.stringify(newAttributes)
        });
    }

    getTypesConfig(config, type) {
        this.setState({
            subTemplatesData: config[type].sub_type.reduce(
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
            ),
            type: type
        });
        this.setMandatoryAttributes(type);
    }

    saveTemplate(data) {
        axios
            .post(
                backendSettings.TE_BASEPATH + '/api/v1/template',
                data
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
            sample_context_data: JSON.parse(contextData),
            attributes: JSON.parse(attributes),
            version_alias: this.state.version_alias
        };
        if (this.state.editable) {
            axios
                .get(
                    backendSettings.TE_BASEPATH +
                        '/api/v1/template/' +
                        name +
                        '/versions'
                )
                .then(response => {
                    console.log('Template with this name already exists'); //Add Alert here
                })
                .catch(error => {
                    this.saveTemplate(data);
                });
        } else {
            this.saveTemplate(data);
        }
    }

    buildOptions(allowedValues) {
        var arr = [];
        arr.push(<option value="" disabled selected> Choose Here </option>);

        arr.push(
            allowedValues.map(t => {
                return (<option value={t}>{t}</option>);
            })
        );
        return arr;
    }

    getAttributes() {
        let attributes = [];
        let mandatoryAttributes = {};

        if (this.state.type && Object.keys(this.state.config).length) {
            mandatoryAttributes = {
                ...backendSettings.TE_TEMPLATE_ATTRIBUTES,
                ...this.state.config[this.state.type]["attributes"]
            };
        }

        let allAttributes = JSON.parse(JSON.stringify(mandatoryAttributes));

        Object.keys(JSON.parse(this.state.attributes)).map(t => {
            allAttributes[t] = allAttributes[t] || JSON.parse(this.state.attributes)[t];
        });

        Object.keys(allAttributes).map((t, index) => {
            attributes.push(
                <div className={styles.teAttributesRow}>
                    <div className={styles.teAttributesCell}>
                        {
                            mandatoryAttributes.hasOwnProperty(t) ? (
                                <div className={styles.teLabel}>
                                    {t}
                                </div>
                            ) : (
                                <input
                                    value={t}
                                    onChange={e =>
                                        this.onAttributesChange(t, e.target.value, true)
                                    }
                                />
                            )
                        }
                    </div>
                    <div className={styles.teAttributesCell}>
                        {
                            allAttributes[t].hasOwnProperty("allowed_values") ? (
                                <select
                                    value={
                                        JSON.parse(this.state.attributes)[t] ? JSON.parse(this.state.attributes)[t] : ""
                                    }
                                    onChange={e =>
                                        this.onAttributesChange(t, e.target.value)
                                    }
                                >
                                    {
                                        this.buildOptions(allAttributes[t]["allowed_values"])
                                    }
                                </select>
                            ) : (
                                <input
                                    value={
                                        JSON.parse(this.state.attributes)[t] ? JSON.parse(this.state.attributes)[t] : ""
                                    }
                                    onChange={
                                        e => this.onAttributesChange(t, e.target.value)
                                    }
                                />
                            )
                        }
                    </div>
                </div>
            );
        });
        return attributes;
    }

    addNewAttribute() {
        let key = document.getElementById("newAttributeKey").value;
        let value = document.getElementById("newAttributeValue").value;
        document.getElementById("newAttributeKey").value = "";
        document.getElementById("newAttributeValue").value = "";

        let mandatoryAttributes = backendSettings.TE_TEMPLATE_ATTRIBUTES;

        if (this.state.type && Object.keys(this.state.config).length) {
            mandatoryAttributes = {
                ...backendSettings.TE_TEMPLATE_ATTRIBUTES,
                ...this.state.config[this.state.type]["attributes"]
            };
        }

        if (key && !mandatoryAttributes.hasOwnProperty(key)) {
            let newAttributes = JSON.parse(this.state.attributes);
            newAttributes[key] = value;
            this.setState({
                attributes: JSON.stringify(newAttributes)
            });
        }
    }

    updateAttributes() {
        let data = {
            attributes: JSON.parse(this.state.attributes)
        };
        axios
            .patch(
                backendSettings.TE_BASEPATH + '/api/v1/template/' + this.state.templateData.name + '/attributes',
                data
            )
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        let chooseVersion = this.state.versions.map(versions => {
            return (
                <option value={versions.version} key={versions.version}> {versions.version} </option>
            );
        });

        // Todo : Add comment section after getting data from backend as it will not display the column underneath the comment
        // let tableHeaders = ['version', 'created_on', ' - ', ' - ', 'comment'].map(k => (
        //     <th>{k}</th>
        // ));
        let tableHeaders = ['version', 'created_on', 'version_alias', 'created_by', ' - ', ' - '].map((k, index) => (
            <th key={index}>{k}</th>
        ));

        let editors = Object.keys(this.state.subTemplatesData).map(
            (t, index) => {
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
                            readOnly
                            fontSize={this.aceconfig.fontSize}
                            height={this.aceconfig.height}
                            width={this.aceconfig.width}
                            value={this.state.subTemplatesData[t].output}
                            highlightActiveLine={false}
                            setOptions={{ useWorker: false }}
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
                        setOptions={{ useWorker: false }}
                    />
                );
                return (
                    <div className={styles.teRowBlock} key={index}>
                        <div className={styles.teCard + ' card'}>
                            <div
                                className="card-header"
                                role="tab"
                                id={`Heading${index}`}
                            >
                                <a
                                    data-toggle="collapse"
                                    data-parent="#accordionEx"
                                    href={`#collapse${index}`}
                                    aria-expanded="true"
                                    aria-controls={`collapse${index}`}
                                >
                                    <h5 className="mb-0">
                                        {t}{' '}
                                        <i className="fas fa-angle-down rotate-icon" />
                                    </h5>
                                </a>
                            </div>
                            <div
                                id={`collapse${index}`}
                                className="collapse"
                                role="tabpanel"
                                aria-labelledby={`Heading${index}`}
                                data-parent="#accordionEx"
                            >
                                <div className="card-body">
                                    <div className={styles.teSubTemplateBlock}>
                                        <div
                                            className={styles.teTemplateEditor}
                                        >
                                            {inputView}
                                        </div>
                                        <div className={styles.teOutputEditor}>
                                            {outputView}
                                        </div>
                                    </div>

                                    <div className={styles.teVersionWrapper}>
                                        <button
                                            className={styles.teButtons}
                                            onClick={() => {
                                                this.getRenderedTemplate(
                                                    t,
                                                    this.state.subTemplatesData[
                                                        t
                                                    ].data,
                                                    this.state.contextData,
                                                    this.state.subTemplatesData[
                                                        t
                                                    ].renderMode
                                                );
                                            }}
                                        >
                                            Render
                                        </button>
                                        {this.state.subTemplatesData[t]
                                            .renderMode === 'html' ? (
                                                <button
                                                    className={
                                                        styles.tePreviewButton
                                                    }
                                                    data-toggle="modal"
                                                    data-target="#myModal"
                                                    onClick={() => {
                                                        this.getRenderedTemplate(
                                                            t,
                                                            this.state
                                                                .subTemplatesData[t]
                                                                .data,
                                                            this.state.contextData,
                                                            this.state
                                                                .subTemplatesData[t]
                                                                .renderMode
                                                        );
                                                    }}
                                                >
                                                Preview
                                                </button>
                                            ) : (
                                                ''
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        );

        let templateTypes = Object.keys(this.state.config).map(t => {
            return <option value={t} key={t}> {t} </option>;
        });

        return (
            <div className="container ">
                <div className={styles.teDetailPage}>
                    <div className={styles.teTemplateHeader}>
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
                            ''
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
                                    readOnly
                                >
                                    <option disabled>0.1</option>
                                </select>
                            )}
                            <label>Default : </label>
                            {!this.state.editable &&
                            this.state.templateData.default ? (
                                    <i
                                        className="fa fa-check-circle"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <i
                                        className="fa fa-times-circle"
                                        aria-hidden="true"
                                    />
                                )}
                        </div>
                    </div>
                </div>
                <div className={styles.teVersionWrapper}>
                    {this.state.editable ? (
                        <div>
                            <label> Type : </label>
                            <select
                                className={styles.teButtons}
                                onChange={e =>
                                    this.getTypesConfig(this.state.config, e.target.value)
                                }
                            >
                                {templateTypes}
                            </select>
                        </div>
                    ) : (
                        ''
                    )}
                </div>
                <div className={styles.teMarginTop20}>
                    <label>Sub Templates : </label>
                </div>
                <div
                    className={styles.teAccordian + ' accordion md-accordion'}
                    id="accordionEx"
                    role="tablist"
                    aria-multiselectable="true"
                >
                    <div className={styles.teScreenTable}>{editors}</div>
                </div>
                <div className={styles.teMarginTop20}>
                    <label>Sample Context Data : </label>
                </div>
                <div
                    className={styles.teAccordian + ' accordion md-accordion'}
                    id="accordionEx"
                    role="tablist"
                    aria-multiselectable="true"
                >
                    <div>
                        {
                            <div className={styles.teCard + ' card'}>
                                <div
                                    className="card-header"
                                    role="tab"
                                    id="headingOne1"
                                >
                                    <a
                                        data-toggle="collapse"
                                        data-parent="#accordionEx"
                                        href="#collapseOne1"
                                        aria-expanded="true"
                                        aria-controls="collapseOne1"
                                    >
                                        <h5 className="mb-0">
                                            Sample Context Data{' '}
                                            <i className="fas fa-angle-down rotate-icon" />
                                        </h5>
                                    </a>
                                </div>
                                <div
                                    id="collapseOne1"
                                    className="collapse"
                                    role="tabpanel"
                                    aria-labelledby="headingOne1"
                                    data-parent="#accordionEx"
                                >
                                    <div className="card-body">
                                        <AceEditor
                                            name="template-editor"
                                            placeholder="Write sample_context_data here..."
                                            theme={this.aceconfig.theme}
                                            mode="json"
                                            fontSize={this.aceconfig.fontSize}
                                            height={this.aceconfig.height}
                                            width={this.aceconfig.width}
                                            value={this.state.contextData}
                                            onChange={this.onContextChange}
                                            setOptions={{ useWorker: false }}
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <br />
                <div className={styles.teSaveContainer}>
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
                        <div className={styles.teVersionAliasWrapper}>
                            <input
                                type="text"
                                id="version_alias"
                                className={styles.teVersionAlias}
                                value={this.state.version_alias}
                                placeholder="version_alias"
                                onChange={e => this.onVersionAliasChange(e.target.value)}
                            />
                            <button
                                className={styles.teButtons}
                                onClick={() => {
                                    if (window.confirm('Are you sure ?')) { // eslint-disable-line no-alert
                                        this.postTemplate(
                                            this.state.templateData.name,
                                            this.state.type,
                                            this.state.contextData,
                                            this.state.attributes
                                        );
                                    }
                                }}
                            >
                                Save
                            </button>
                        </div>
                    )}
                </div>
                <br />
                <div className={styles.teMarginTop20}>
                    <label>Attributes : </label>
                </div>
                <div
                    className={styles.teAccordian + ' accordion md-accordion'}
                    id="accordionEx"
                    role="tablist"
                    aria-multiselectable="true"
                >
                    <div>
                        {
                            <div className={styles.teCard + ' card'}>
                                <div
                                    className="card-header"
                                    role="tab"
                                    id="headingTwo2"
                                >
                                    <a
                                        data-toggle="collapse"
                                        data-parent="#accordionEx"
                                        href="#collapseTwo2"
                                        aria-expanded="true"
                                        aria-controls="collapseTwo2"
                                    >
                                        <h5 className="mb-0">
                                            Attributes{' '}
                                            <i className="fas fa-angle-down rotate-icon" />
                                        </h5>
                                    </a>
                                </div>
                                <div
                                    id="collapseTwo2"
                                    className="collapse"
                                    role="tabpanel"
                                    aria-labelledby="headingTwo2"
                                    data-parent="#accordionEx"
                                >
                                    <div className="card-body">
                                        <div className={styles.teAttributesWrapper}>
                                            {this.getAttributes()}
                                            <div className={styles.teAddNewAttributes}>
                                                <button
                                                    className={styles.teAddNewAttributeButton}
                                                    onClick={this.addNewAttribute}
                                                >
                                                    +
                                                </button>
                                                <input
                                                    id="newAttributeKey"
                                                    placeholder="New Attribute Key"
                                                />
                                                <input
                                                    id="newAttributeValue"
                                                    placeholder="New Attribute Value"
                                                />
                                            </div>
                                            <div>
                                                {
                                                    !this.state.editable ? (
                                                        <button
                                                            className={styles.teUpdateButton}
                                                            onClick={this.updateAttributes}
                                                        >
                                                        Update
                                                        </button>
                                                    ) : (
                                                        ''
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                {this.state.editable ? (
                    ''
                ) : (
                    <div>
                        <div className={styles.teMarginTop20}>
                            <label>Versions : </label>
                        </div>
                        <div className={styles.teVersionTable}>
                            <div className={styles.teSearchWrapper}>
                                <SearchBox
                                    onChange={this.onSearchTextChange.bind(
                                        this
                                    )}
                                />
                            </div>
                            <div className={styles.teTableWrapper}>
                                <table
                                    className={
                                        'table table-striped table-bordered' +
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
                    </div>
                )}
                <div className="modal fade" id="myModal">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            {/* <div className="modal-header" style={{ height: '5vh' }}>
                                <button type="button" className="close" data-dismiss="modal" style={{ padding: '10px' }}>×</button>
                            </div> */}
                            <div
                                className="modal-body"
                                style={{ height: '90vh', padding: '0' }}
                            >
                                {this.state.previewSubType &&
                                this.state.subTemplatesData.hasOwnProperty(
                                    this.state.previewSubType
                                ) ? (
                                        <iframe
                                            height="100%"
                                            width="100%"
                                            srcDoc={
                                                this.state.subTemplatesData[
                                                    this.state.previewSubType
                                                ].output
                                            }
                                        />
                                    ) : (
                                        ''
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

TemplateScreen.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            name: PropTypes.string,
            version: PropTypes.string
        })
    }),
    history: PropTypes.shape({
        push: PropTypes.func
    }),
    editable: PropTypes.bool
};

export default withRouter(TemplateScreen);

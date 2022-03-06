import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { generateNameOfUrl, validateURL } from '../utils.js';
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
import AlertModal from './../components/alertModal/alertModal';
import 'ace-builds';
import 'ace-builds/webpack-resolver';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import TinyUrlComponent from '../components/TinyUrlComponent.js';
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
            alertMessage: '',
            attributes: '{}',
            version_alias: '',
            tinyUrlObj: [],
            urlKeyList: [],
            items: [{ urlKey: "", expiry: "" }],
            visited: {},
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
        this.showAlerts = this.showAlerts.bind(this);
        this.getAttributes = this.getAttributes.bind(this);
        this.getAttributeOptions = this.getAttributeOptions.bind(this);
        this.addNewAttribute = this.addNewAttribute.bind(this);
        this.updateAttributes = this.updateAttributes.bind(this);
        this.deleteAttribute = this.deleteAttribute.bind(this);
        this.scan = this.scan.bind(this);
        this.updateUrlKeyList = this.updateUrlKeyList.bind(this);
        this.populateItems = this.populateItems.bind(this);
        this.updateItems = this.updateItems.bind(this);
        this.updateVisited = this.updateVisited.bind(this);
        this.setTinyUrlObj = this.setTinyUrlObj.bind(this);
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
                    this.updateUrlKeyList();
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
                this.updateUrlKeyList();
            })
            .catch(function(error) {
                console.log(error);
            });
        this.setTinyUrlObj();
    }

    populateItems(tinyUrlObj) {
        if (!tinyUrlObj) return;
        let itemsCopy = [...this.state.items];
        let visitedCopy = { ...this.state.visited };
        tinyUrlObj.forEach(obj => {
            visitedCopy[obj.urlKey] = 1;
            itemsCopy.splice(itemsCopy.length - 1, 0, {
                urlKey: obj.urlKey,
                expiry: obj.expiry });
        });
        this.setState({
            items: itemsCopy,
            visited: visitedCopy
        });
    }

    updateItems(itemsCopy) {
        this.setState({
            items: itemsCopy
        });
    }

    updateVisited(visitedCopy) {
        this.setState({
            visited: visitedCopy
        });
    }

    scan(parent, obj, result) {
        if (obj instanceof Object) {
            const keys = Object.keys(obj);
            keys.forEach((key, index) => {
                parent.push(key);
                this.scan(parent, obj[key], result);
                parent.pop();
            });
        } else if (validateURL(obj)) {
            let name = generateNameOfUrl(parent);
            result.push(name);
        }
        return;
    }

    setTinyUrlObj() {
        if (!this.state.templateData.name || !this.state.templateData.version) return;
        let url = backendSettings.TE_BASEPATH +
        '/api/v1/tiny_url/' +
        this.state.templateData.name +
        '/' +
        this.state.templateData.version;
        axios
            .get(
                url
            ).then((response) => {
                this.setState({
                    tinyUrlObj: response.data ? response.data : []
                });
                this.populateItems(this.state.tinyUrlObj);
            }).catch(err => {this.showAlerts(err.response.data);});
    }

    updateUrlKeyList() {
        if (this.state.contextData !== "") {
            let result = [];
            this.scan([], JSON.parse(this.state.contextData), result);
            this.setState({
                urlKeyList: result
            });
        }
    }

    openTemplateVersion(version) {
        window.open(
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
        try {
            try {
                contextData = JSON.parse(contextData);
            } catch (error) {
                throw new Error("sample_context_data must be a valid JSON");
            }
            let data = {
                template: encode(templateData),
                context: contextData,
                handler: 'jinja2',
                output: renderMode,
                tinyUrlArray: this.state.urlKeyList
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
                    this.showAlerts(error.response.data.message);
                });
            if (renderMode === 'html') {
                this.setState({
                    previewSubType: subType
                });
            }
        } catch (error) {
            this.showAlerts(error.message);
        }
    }

    getRenderedTemplatePdf(subType, templateData, contextData, renderMode) {
        try {
            try {
                contextData = JSON.parse(contextData);
            } catch (error) {
                throw new Error("sample_context_data must be a valid JSON");
            }
            let data = {
                template: encode(templateData),
                context: contextData,
                handler: 'jinja2',
                output: renderMode
            };
            axios
                .post(backendSettings.TE_BASEPATH + '/render_pdf', data, {
                    responseType: "blob"
                })
                .then((response) => {
                    //Create a Blob from the PDF Stream
                    const file = new Blob([response.data], { type: "application/pdf" });
                    //Build a URL from the file
                    const fileURL = URL.createObjectURL(file);
                    //Open the URL on new Window
                    const pdfWindow = window.open();
                    pdfWindow.location.href = fileURL;
                })
                .catch(function(error) {
                    console.log(error);
                    this.showAlerts(error.response.data.message);
                });
            if (renderMode === 'html') {
                this.setState({
                    previewSubType: subType
                });
            }
        } catch (error) {
            this.showAlerts(error.message);
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
        this.updateUrlKeyList();
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
            newAttributes = { ...currentAttributes, [attributeKey]: newValue };
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
                this.showAlerts(error.response.data.message);
            });
    }

    postTemplate(name, type, contextData, attributes) {
        try {
            var re = new RegExp("^[a-zA-Z]+[a-zA-Z0-9_]*$");
            if (!re.test(name)) {
                throw new Error("Validation: `" + name + "` is not a valid template name");
            }

            let subTemplates = [];
            Object.keys(this.state.subTemplatesData).map(t => {
                let subTemplate = {
                    sub_type: this.state.subTemplatesData[t].subType,
                    data: encode(this.state.subTemplatesData[t].data)
                };
                subTemplates.push(subTemplate);
            });

            try {
                contextData = JSON.parse(contextData);
            } catch (error) {
                throw new Error("sample_context_data must be a valid JSON");
            }

            try {
                attributes = JSON.parse(attributes);
            } catch (error) {
                throw new Error("Attributes must be a valid JSON");
            }

            let data = {
                name: name,
                type: type,
                sub_templates: subTemplates,
                sample_context_data: contextData,
                version_alias: this.state.version_alias,
                tiny_url: this.state.items
            };

            if (this.state.editable) {
                data["attributes"] = attributes;
                axios
                    .get(
                        backendSettings.TE_BASEPATH +
                        '/api/v1/template/' +
                        name +
                        '/versions'
                    )
                    .then(response => {
                        this.showAlerts("Template with this name already exists");
                    })
                    .catch(error => {
                        this.saveTemplate(data);
                    });
            } else {
                this.saveTemplate(data);
            }
        } catch (error) {
            this.showAlerts(error.message);
        }
    }

    showAlerts(errorMessage = '') {
        this.setState({
            alertMessage: errorMessage
        });
    }

    getAttributeOptions(allowedValues) {
        var options = [];
        options.push(<option value="" disabled selected> Choose Here </option>);

        options.push(
            allowedValues.map(t => {
                return (<option value={t}>{t}</option>);
            })
        );
        return options;
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
                                        this.getAttributeOptions(allAttributes[t]["allowed_values"])
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
                        {
                            mandatoryAttributes.hasOwnProperty(t) ? (
                                ''
                            ) : (
                                <span
                                    className={styles.teDeleteAttribute}
                                    onClick={() => this.deleteAttribute(t)}
                                >
                                    &times;
                                </span>
                            )
                        }
                    </div>
                </div>
            );
        });
        return attributes;
    }

    addNewAttribute() {
        try {
            let key = document.getElementById("newAttributeKey").value;
            let value = document.getElementById("newAttributeValue").value;

            if (!key) {
                throw new Error("Please enter a non empty attribute key");
            }

            if (JSON.parse(this.state.attributes).hasOwnProperty(key)) {
                throw new Error("Attribute `" + key + "` already exists");
            }

            document.getElementById("newAttributeKey").value = "";
            document.getElementById("newAttributeValue").value = "";

            let newAttributes = { ...JSON.parse(this.state.attributes), [key]: value };

            this.setState({
                attributes: JSON.stringify(newAttributes)
            });
        } catch (error) {
            this.showAlerts(error.message);
        }
    }

    updateAttributes() {
        try {
            if (JSON.parse(this.state.attributes).hasOwnProperty("")) {
                throw new Error("Attributes can not have empty key");
            }

            let data = {
                attributes: JSON.parse(this.state.attributes)
            };

            axios
                .patch(
                    backendSettings.TE_BASEPATH + '/api/v1/template/' + this.state.templateData.name + '/attributes',
                    data
                )
                .then(response => {
                    this.showAlerts("Attributes updated successfully !");
                })
                .catch(error => {
                    this.showAlerts(error.response.data.message);
                });
        } catch (error) {
            this.showAlerts(error.message);
        }
    }

    deleteAttribute(attributeKey) {
        let newAttributes = Object.keys(JSON.parse(this.state.attributes)).reduce((object, key) => {
            if (key !== attributeKey) {
                object[key] = JSON.parse(this.state.attributes)[key];
            }
            return object;
        }, {});
        this.setState({
            attributes: JSON.stringify(newAttributes)
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
                                        {this.state.subTemplatesData[t]
                                            .renderMode === 'html' ? (
                                                <button
                                                    className={styles.teButtons}
                                                    onClick={() => {
                                                        this.getRenderedTemplatePdf(
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
                                                Render PDF
                                                </button>
                                            ) : (
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
                                            )}
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
                                                Preview HTML
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
                    <div className={styles.teScreenTable}>
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
                                for (let i = 0; i < this.state.items.length; i++) {
                                    if (this.state.items[i].urlKey === "" || this.state.items[i].expiry === "") {
                                        this.showAlerts("Can't leave url/expiry of tinyUrl blank. Please select or delete blank fields.");
                                        return;
                                    }
                                }
                                this.postTemplate(
                                    document.getElementById('tmp_name').value,
                                    this.state.type,
                                    this.state.contextData,
                                    this.state.attributes,
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
                                            this.state.attributes,
                                            this.state.tinyUrlObj
                                        );
                                    }
                                }}
                            >
                                Save
                            </button>
                        </div>
                    )}
                </div>
                <br/>
                <div className={styles.teMarginTop20}>
                    <label>Attributes : </label>
                </div>
                <div
                    className={styles.teAccordian + ' accordion md-accordion'}
                    id="accordionEx"
                    role="tablist"
                    aria-multiselectable="true"
                >
                    <div className={styles.teScreenTable}>
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
                                                <input
                                                    className={styles.teNewAttributeInput}
                                                    id="newAttributeKey"
                                                    placeholder="New Attribute Key"
                                                />
                                                <input
                                                    className={styles.teNewAttributeInput}
                                                    id="newAttributeValue"
                                                    placeholder="New Attribute Value"
                                                />
                                            </div>
                                            <div>
                                                <button
                                                    className={styles.teAddNewAttributeButton}
                                                    onClick={this.addNewAttribute}
                                                >
                                                    +
                                                </button>
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
                <div>
                    <TinyUrlComponent items={this.state.items} visited={this.state.visited} updateItems={this.updateItems} updateVisited={this.updateVisited} urlKeyList={this.state.urlKeyList} templateName={this.state.templateData.name} templateVersion={this.state.templateData.version} tinyUrlObj={this.state.tinyUrlObj} showAlerts={this.showAlerts}/>
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
                <AlertModal
                    errorMessage={this.state.alertMessage}
                    onClose={(e) =>
                        this.showAlerts()
                    }
                />
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

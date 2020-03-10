import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import styles from './../style/templateScreen.less';
import SearchBox from './../components/searchBox.js';
import Highlight from './../components/highlight.js';

class TemplateScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templateData: {
                name: this.props.match.params.name,
                version: this.props.match.params.version
            },
            versions: [{ version: this.props.match.params.version }]
        };
        this.getTableRowsJSX = this.getTableRowsJSX.bind(this);
        this.openTemplateVersion = this.openTemplateVersion.bind(this);
        this.setDefaultVersion = this.setDefaultVersion.bind(this);
        this.getDateInSimpleFormat = this.getDateInSimpleFormat.bind(this);
    }
    componentDidMount() {
        axios
            .get(
                '/templatestore/api/v1/template/' +
                    this.state.templateData.name +
                    '/' +
                    this.state.templateData.version
            )
            .then(response => {
                this.setState({
                    subTemplatesData: response.data.sub_templates.reduce(
                        (result, k) => {
                            result[k.sub_type] = k;
                            return result;
                        },
                        {}
                    ),
                    templateData: {
                        name: this.props.match.params.name,
                        version: this.props.match.params.version,
                        default: response.data.default
                    }
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

    render() {
        let chooseVersion = this.state.versions.map(versions => {
            return (
                <option value={versions.version}> {versions.version} </option>
            );
        });
        let tableHeaders = ['version', 'created_on', ' - ', ' - '].map(k => (
            <th>{k}</th>
        ));
        return (
            <div>
                <div>
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
                        {this.state.templateData.default ?
                            'default' :
                            'not_default'}
                        <br />
                    </div>
                </div>
                <div>
                    <SearchBox onChange={this.onSearchTextChange.bind(this)} />
                </div>
                <div>
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

                <div />
            </div>
        );
    }
}

export default withRouter(TemplateScreen);

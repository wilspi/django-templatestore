import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import styles from './../style/home.less';
import { backendSettings } from './../utils.js';
import SearchBox from './../components/searchBox.js';
import Highlight from './../components/highlight.js';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templatesData: [],
            searchText: ''
        };
        this.tableHeaderList = [
            'template_name',
            'default_version',
            ...this.props.fixedAttributeKeys
        ];
        this.getTableRowsJSX = this.getTableRowsJSX.bind(this);
        this.openTemplateScreenPage = this.openTemplateScreenPage.bind(this);
    }

    componentDidMount() {
        console.log("Enter componentdidmount");
        axios.get('./api/v1/templates').then(response => {
            console.log("Request sent and got response");
            this.setState({
                templatesData: response.data.map(t => ({
                    ...{
                        template_name: t.name,
                        default_version: t.default ? t.version : '-'
                    },
                    ...this.tableHeaderList.slice(2).reduce((result, k) => {
                        result[k] = t.attributes[k];
                        return result;
                    }, {})
                }))
            });
            console.log("Response: ", response);
            console.log("exit response");
        })
            .catch(error => {
                console.log("Got this error", error);
                if (error.response.status === 400) {
                    this.props.history.push('/templatestore/404');
                }
            });
        console.log("Exit componentdidmount");
    }

    openTemplateScreenPage(name, version) {
        console.log("Opening the name and version page", name, version);
        this.props.history.push(
            backendSettings.TE_BASEPATH +
                '/t/' +
                name +
                '/' +
                (version === '-' ? '0.1' : version)
        );
        console.log("Opened that name and version page");
    }

    getTableRowsJSX() {
        console.log("Now adding rows to table");
        console.log("Data that we have", this.state.templatesData);
        let tableRows = [];
        let filteredTemplates = this.state.templatesData.reduce(
            (result, template) => {
                if (
                    Object.keys(template).reduce((res, t) => {
                        res =
                            res ||
                            (typeof template[t] !== 'undefined' &&
                                template[t]
                                    .toLowerCase()
                                    .indexOf(
                                        this.state.searchText.toLowerCase()
                                    ) !== -1);
                        return res;
                    }, false)
                ) {
                    result.push(template);
                }
                return result;
            },
            []
        );
        console.log("Filtered Templates", filteredTemplates);
        console.log("Trying to add rows now");
        for (let i = 0; i < filteredTemplates.length; i++) {
            let columnData = Object.values(filteredTemplates[i]).map(k => (
                <td>
                    <Highlight search={this.state.searchText}>
                        {k !== '' ? k : '-'}
                    </Highlight>
                </td>
            ));
            tableRows.push(
                <tr>
                    {columnData}
                    <td>
                        <button
                            type="button"
                            onClick={() =>
                                this.openTemplateScreenPage(
                                    this.state.templatesData[i][
                                        'template_name'
                                    ],
                                    this.state.templatesData[i][
                                        'default_version'
                                    ] === '-' ?
                                        this.state.templatesData[i][
                                            'default_version'
                                        ] :
                                        '0.1'
                                )
                            }
                        >
                            Open
                        </button>
                    </td>
                </tr>
            );
        }
        console.log("added rows successfully");
        return tableRows;
    }

    onSearchTextChange(searchValue) {
        console.log("searching text", searchValue);
        this.setState({
            searchText: searchValue
        });
    }

    render() {
        console.log("Renderinh");
        var tableHeaders = [...this.tableHeaderList, ...[' - ']].map(k => (
            <th>{k}</th>
        ));
        console.log("Headers of table rendered");
        console.log("Now going to add rows by callingh add rows method");
        return (
            <div className={styles.tsPage}>
                <div>
                    <h1>Template Store</h1>
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
            </div>
        );
        console.log("called the method to add rows");
    }
}

export default withRouter(Home);

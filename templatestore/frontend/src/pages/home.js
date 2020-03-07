import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import styles from './../style/home.less';
import SearchBox from './../components/searchBox.js';

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
        axios.get('./api/v1/templates').then(response => {
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
        });
    }

    openTemplateScreenPage(name, version) {
        this.props.history.push('/templatestore/t/' + name + '/' + version);
    }

    getTableRowsJSX() {
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
                    .indexOf(this.state.searchText.toLowerCase()) !== -1);
                        return res;
                    }, false)
                ) {
                    result.push(template);
                }
                return result;
            },
            []
        );

        for (let i = 0; i < filteredTemplates.length; i++) {
            let columnData = Object.values(filteredTemplates[i]).map(k => (
                <td>{k !== '' ? k : '-'}</td>
            ));
            tableRows.push(
                <tr>
                    {columnData}
                    <td>
                        <button
                            type="button"
                            onClick={() =>
                                this.openTemplateScreenPage(
                                    this.state.templatesData[i]['template_name'],
                                    this.state.templatesData[i]['default_version'] === '-' ?
                                        this.state.templatesData[i]['default_version'] :
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
        return tableRows;
    }

    onSearchTextChange(searchValue) {
        this.setState({
            searchText: searchValue
        });
    }

    render() {
        var tableHeaders = [...this.tableHeaderList, ...[' - ']].map(k => (
            <th>{k}</th>
        ));
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
    }
}

export default withRouter(Home);

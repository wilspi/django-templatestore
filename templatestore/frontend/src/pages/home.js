import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import styles from './../style/home.less';
import { backendSettings, getDateInSimpleFormat } from './../utils.js';
import SearchBox from './../components/searchBox/index';
import Highlight from './../components/highlight.js';
import PropTypes from 'prop-types';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templatesData: [],
            searchText: ''
        };
        this.tableHeaderList = [
            'template_name',
            'type',
            'default_version',
            'created_on',
            'updated_on',
            ...this.props.fixedAttributeKeys
        ];
        this.getTableRowsJSX = this.getTableRowsJSX.bind(this);
        this.openTemplateScreenPage = this.openTemplateScreenPage.bind(this);
        this.openNewTemplatePage = this.openNewTemplatePage.bind(this);
    }

    componentDidMount() {
        axios.get('./api/v1/templates').then(response => {
            this.setState({
                templatesData: response.data.map(t => ({
                    ...{
                        template_name: t.name,
                        type: t.type,
                        default_version: t.default ? t.version : '-',
                        created_on: getDateInSimpleFormat(t.created_on),
                        updated_on: getDateInSimpleFormat(t.modified_on)
                    },
                    ...this.tableHeaderList.slice(5).reduce((result, k) => {
                        result[k] = t.attributes[k];
                        return result;
                    }, {})
                }))
            });
        });
    }

    openTemplateScreenPage(name, version) {
        this.props.history.push(
            backendSettings.TE_BASEPATH +
                '/t/' +
                name +
                '/' +
                (version === '-' ? '0.1' : version)
        );
    }

    openNewTemplatePage() {
        this.props.history.push(backendSettings.TE_BASEPATH + '/a/add');
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
                                    filteredTemplates[i]['template_name'],
                                    filteredTemplates[i]['default_version'] ===
                                        '-' ?
                                        '0.1' :
                                        filteredTemplates[i][
                                            'default_version'
                                        ]
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
            <div className={styles.tsPage + ' container'}>
                <div>
                    <h1>Template Store</h1>
                </div>
                <div className="d-flex justify-content-between">
                    <SearchBox onChange={this.onSearchTextChange.bind(this)} />
                    <div className={styles.tsAddTemplateBtn}>
                        <button
                            type="button"
                            onClick={() => this.openNewTemplatePage()}
                        >
                            Add New Template
                        </button>
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <table
                        className={
                            'table table-striped table-bordered mb-0' +
                            styles.tsTable
                        }
                    >
                        <thead>
                            <tr>{tableHeaders}</tr>
                        </thead>
                        <tbody className={styles.tableBody}>
                            {this.getTableRowsJSX()}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

Home.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func
    }),
    fixedAttributeKeys: PropTypes.arrayOf(PropTypes.string)
};

export default withRouter(Home);

import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import styles from './../style/home.less';
import { backendSettings, getDateInSimpleFormat } from './../utils.js';
import SearchBox from './../components/searchBox/index';
import Highlight from './../components/highlight.js';
import PropTypes from 'prop-types';
import Type from './../components/Filter/filterByType';
import Lob from './../components/Filter/filterByLob';
import Journey from './../components/Filter/filterByJourney';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templatesData: [],
            searchText: '',
            filterType: '',
            filterLob: '',
            showFilter: false,
            filterJourney: ''
        };
        this.tableHeaderList = [
            'template_name',
            'type',
            'default_version',
            'updated_on',
            ...this.props.fixedAttributeKeys
        ];
        this.getTableRowsJSX = this.getTableRowsJSX.bind(this);
        this.openTemplateScreenPage = this.openTemplateScreenPage.bind(this);
        this.openNewTemplatePage = this.openNewTemplatePage.bind(this);
    }

    componentDidMount() {
        axios.get('./api/v2/templates').then(response => {
            this.setState({
                templatesData: response.data.map(t => ({
                    ...{
                        template_name: t.name,
                        type: t.type,
                        default_version: t.default ? t.version : '-',
                        updated_on: getDateInSimpleFormat(t.modified_on)
                    },
                    ...this.tableHeaderList.slice(4).reduce((result, k) => {
                        result[k] = t.attributes[k];
                        return result;
                    }, {})
                }))
            });
        });
    }

    openTemplateScreenPage(name, version) {
        window.open(backendSettings.TE_BASEPATH +
            '/t/' +
            name +
            '/' +
            (version === '-' ? '0.1' : version), "_blank");
    }

    openNewTemplatePage() {
        this.props.history.push(backendSettings.TE_BASEPATH + '/a/add');
    }

    getTableRowsJSX() {
        let tableRows = [];
        let filteredTemplates = this.state.templatesData.reduce(
            (result, template) => {
                if (!template.journey || template.journey === "" || !template.lob || template.lob === "") {
                    return result;
                }
                if (
                    Object.keys(template).reduce((res, t) => {
                        res =
                            res ||
                            (typeof template[t] !== 'undefined' &&
                                template[t]
                                    .toLowerCase()
                                    .indexOf(
                                        this.state.searchText.toLowerCase()
                                    ) !== -1 && template.type.toLowerCase().indexOf(this.state.filterType.toLowerCase()) !== -1 &&
                                     template.lob.toLowerCase().indexOf(this.state.filterLob.toLowerCase()) !== -1 &&
                                     template.journey.toLowerCase().indexOf(this.state.filterJourney.toLowerCase()) !== -1);
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
            let columnData = Object.values(filteredTemplates[i]).map((k, index) => (
                <td key={index}>
                    <Highlight search={this.state.searchText}>
                        {k !== '' ? k : '-'}
                    </Highlight>
                </td>
            ));
            tableRows.push(
                <tr key={i}>
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

    handleDropdownChangeType(e) {
        this.setState({ filterType: e });
    }

    handleDropdownChangeLob(e) {
        this.setState({ filterLob: e });
    }

    handleDropdownChangeJourney(e) {
        this.setState({ filterJourney: e });
    }

    _showMessage() {
        this.setState({
            showFilter: !this.state.showFilter,
            filterJourney: '',
            filterLob: '',
            filterType: ''
        });
    }

    render() {
        var tableHeaders = [...this.tableHeaderList, ...[' - ']].map((k, index) => (
            <th key={index}>{k}</th>
        ));
        return (
            <div className={styles.tsPage + ' container'}>
                <div>
                    <h1>Template Store</h1>
                </div>
                <div className="d-flex justify-content-between mb-4">
                    <SearchBox onChange={this.onSearchTextChange.bind(this)} />
                </div>
                <div className={styles.subcontainer}>
                    <div className ={styles.left}> <h4> More Actions : </h4>
                        <div className={styles.tsAddTemplateBtn}>
                            <button
                                type="button"
                                onClick={() => this.openNewTemplatePage()}
                            >
                                Add New Template
                            </button>
                        </div>
                        <br />
                        <button onClick={this._showMessage.bind(this)} className={styles.tsAddFilterBtn}>Add/Remove Filter</button>
                    </div>

                    <div className ={styles.right}> <h4> Filter Templates : </h4>
                        <div>
                            { this.state.showFilter && <Type onChange={this.handleDropdownChangeType.bind(this)} /> }
                            { this.state.showFilter && <Lob onChange={this.handleDropdownChangeLob.bind(this)} /> }
                            { this.state.showFilter && <Journey onChange={this.handleDropdownChangeJourney.bind(this)} /> }
                        </div>
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

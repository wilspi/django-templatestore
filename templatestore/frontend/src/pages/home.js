import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import styles from './../style/home.less';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templatesData: []
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
        for (let i = 0; i < this.state.templatesData.length; i++) {
            let columnData = Object.values(this.state.templatesData[i]).map(k => (
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

    render() {
        var tableHeaders = [...this.tableHeaderList, ...[' - ']].map(k => (<th>{k}</th>));
        return (
            <div className={styles.tsPage}>
                <div>
                    <h1>Template Store</h1>
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

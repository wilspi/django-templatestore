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
            let templatesData = [];
            for (let i = 0; i < response.data.length; i++) {
                let templateData = {};
                templateData['template_name'] = response.data[i]['name'];
                templateData['default_version'] = response.data[i]['default'] ?
                    response.data[i]['version'] :
                    '-';
                for (let j = 2; j < this.tableHeaderList.length; j++) {
                    templateData[this.tableHeaderList[j]] =
            response.data[i]['attributes'][this.tableHeaderList[j]];
                }
                templatesData.push(templateData);
            }

            this.setState({
                templatesData: templatesData
            });
        });
    }

    openTemplateScreenPage(name, version) {
        this.props.history.push('/templatestore/t/' + name + '/' + version);
    }

    getTableRowsJSX() {
        let tableRows = [];
        for (let i = 0; i < this.state.templatesData.length; i++) {
            let columnData = [];
            for (var key in this.state.templatesData[i]) {
                columnData.push(
                    <td>
                        {this.state.templatesData[i][key] !== '' ?
                            this.state.templatesData[i][key] :
                            '-'}
                    </td>
                );
            }
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
        var tableHeaders = [];
        for (var i = 0; i < this.tableHeaderList.length; i++) {
            tableHeaders.push(<th key={i}>{this.tableHeaderList[i]}</th>);
        }
        tableHeaders.push(<th />);

        return (
            <div className={styles.tsPage}>
                <div>
                    <h1>Template Store</h1>
                </div>
                <div>
                    <table className={"table table-striped table-responsive-md btn-table " + styles.tsTable}>
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

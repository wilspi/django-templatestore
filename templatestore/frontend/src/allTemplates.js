import React from 'react';
import axios from 'axios';
import styles from './style/templateScreen.less';
import { Link } from 'react-router-dom';

class AllTemplates extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            templates: [],
            columns: [],
            sortedColumn: {},
            sortedOrder: true //ascending order
        };
    }

    componentDidMount() {
        axios.get('./api/v1/template').then((response) => {
            let template = [];
            let cols = {};
            let column = ['name', 'version'];
            let temp = {};
            for (let i = 0; i < response.data.length; i++) {
                for (let key in response.data[i]) {
                    if (key !== "attributes") {
                        temp[key] = response.data[i][key];
                    } else {
                        for (let key2 in response.data[i][key]) {
                            if (key2 !== "attribute1" && key2 !== "attribute2") {
                                temp[key2] = response.data[i][key][key2];
                                cols[key2] = 1;
                            }
                        }
                    }
                }
                template.push(temp);
                temp = {};
            }
            for (let key in cols) {
                column.push(key);
                for (let i = 0; i < template.length; i++) {
                    if (!(key in template[i])) {
                        template[i][key] = " ";
                    }
                }
            }
            this.setState({
                templates: template,
                columns: column
            });
        });
    }

    compareBy(key) {
        if (!(key in this.state.sortedColumn)) {
            let col = {};
            col[key] = 1;
            this.setState({
                sortedOrder: true,
                sortedColumn: col
            });
            this.setState({
                sortedOrder: !this.state.sortedOrder
            });
            return function(a, b) {
                if (a[key] < b[key]) return -1;
                if (a[key] > b[key]) return 1;
                return 0;
            };
        }
        if (this.state.sortedOrder === true) {
            this.setState({
                sortedOrder: !this.state.sortedOrder
            });
            return function(a, b) {
                if (a[key] < b[key]) return -1;
                if (a[key] > b[key]) return 1;
                return 0;
            };
        } else {
            this.setState({
                sortedOrder: !this.state.sortedOrder
            });
            return function(a, b) {
                if (a[key] > b[key]) return -1;
                if (a[key] < b[key]) return 1;
                return 0;
            };
        }
    }

    sortBy(key) {
        let arrayCopy = [...this.state.templates];
        arrayCopy.sort(this.compareBy(key));
        this.setState({
            templates: arrayCopy
        });
    }

    generateHeader() {
        let header = [];
        for (let i = 0; i < this.state.columns.length; i++) {
            let m = this.state.columns[i];
            header.push(<th onClick={() => this.sortBy(m)}> {this.state.columns[i].toUpperCase()} </th>);
        }
        header.push(<th> Actions </th>);
        return header;
    }

    render() {
        let templates = this.state.templates.map((template) => {
            let rows = [];
            for (let i = 0; i < this.state.columns.length; i++) {
                rows.push(<td align="center"> {template[this.state.columns[i]]} </td>);
            }
            rows.push(
                <Link to={`/template-editor/${template.name}/${template.version}`}>
                    <td align="center"><button className={styles.teSmallButtons} type="button"> Open </button></td>
                </Link>
            );
            return (
                <tr>
                    {rows}
                </tr>
            );
        });
        return (
            <div>
                <header className={styles.teHeading}>
                    <h1 align="center" fontSize="80px"><u>Template Store</u></h1>
                </header>
                <br />
                <br />
                <table className={styles.teTables}>
                    <thead>
                        <tr className={styles.teHeading}>
                            {this.generateHeader()}
                        </tr>
                    </thead>
                    <tbody>
                        {templates}
                    </tbody>
                </table>
                <br />
                <br />
                <div align="center">
                    <Link to={`/template-editor/addNewTemplate`}>
                        <button className={styles.teButtons} type="button"> Add New Template </button>
                    </Link>
                </div>
            </div>

        );
    }
}
export default AllTemplates;

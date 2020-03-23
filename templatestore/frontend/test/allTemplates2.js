import React from 'react';
import axios from 'axios';
import styles from './style/templateScreen.less';
import { Link } from 'react-router-dom';

const escapeRegExp = (str = '') => (
    str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
);

const Highlight = ({ search = '', children = '' }) => {
    const patt = new RegExp(`(${escapeRegExp(search)})`, 'i');
    const parts = String(children).split(patt);

    if (search) {
        return parts.map((part, index) => (
            patt.test(part) ? <mark key={index}>{part}</mark> : part
        ));
    } else {
        return children;
    }
};

class AllTemplates extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            templates: [],
            columns: [],
            sortedColumn: {},
            sortedOrder: true, //ascending order
            search: ''
        };
    }

    componentDidMount() {
        axios.get('./api/v1/templates').then((response) => {
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

    updateSearch(event) {
        //console.log(event.target.value);
        this.setState({ search: event.target.value });
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
        let filteredTemplates = this.state.templates.filter((template) => {
            for (let i = 0; i < this.state.columns.length; i++) {
                if (template[this.state.columns[i]].toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1) {
                    return template;
                }
            }
        });

        let templates = filteredTemplates.map((template) => {
            let rows = [];
            for (let i = 0; i < this.state.columns.length; i++) {
                rows.push(<td align="center"> <Highlight search={this.state.search}>{template[this.state.columns[i]]}</Highlight></td>);
            }
            rows.push(
                <Link to={`/templatestore/${template.name}/${template.version}`}>
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
                <div>
                    <p> Search </p>
                    <input className={styles.teInputField} type="text" value={this.state.search} onChange={this.updateSearch.bind(this)} />
                </div>
                <br/>
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
                    <Link to={`/templatestore/addNewTemplate`}>
                        <button className={styles.teButtons} type="button"> Add New Template </button>
                    </Link>
                </div>
            </div>

        );
    }
}
export default AllTemplates;

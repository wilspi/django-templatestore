import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import styles from './../style/templateScreen.less';

class TemplateScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            templateData: {
                name: this.props.match.params.name,
                version: this.props.match.params.version
            },
            versions: [
                {
                    version: "0.5"
                }
            ]

        };
    }
    componentDidMount() {
        axios.get('/templatestore/api/v1/template/' + this.state.templateData.name + '/' + this.state.templateData.version)
            .then(response => {
                console.log(response);
                this.setState({
                    subTemplatesData: response.data.sub_templates.reduce((result, k) => {
                        result[k.sub_type] = k;
                        return result;
                    }, {})
                });
            })
            .catch(error => {
                console.log(error);
                if (error.response.status === 400) {
                    this.props.history.push('/templatestore/404');
                }
            });
    }
    fetchAndUpdateTemplateVersion(e) {
    //        this.setState({
    //            templateVersion: e.target.value
    //        });
        this.loadData(this.state.templateName, e.target.value);
    }
    render() {
        console.log(this.state);
        let chooseVersion = this.state.versions.map(versions => {
            return <option> {versions.version} </option>;
        });
        return (
            <div>
                <div>
                    <h1>template screen : {this.state.templateData.name} :{' '}
                        {this.state.templateData.version}
                    </h1>
                </div>
                <div>
                    <label align="right">
            template_name :
                    </label>
                    <input
                        readOnly
                        type="text"
                        value={this.state.templateData.name}
                    />
                    <br />
                    <label>template_version :</label>
                    <select
                        id="type"
                        className={styles.teButtons}
                        value={this.state.templateData.version}
                        onChange={e => (this.fetchAndUpdateTemplateVersion(this.state.templateData.name))}
                    >
                        {chooseVersion}
                    </select>
                    <br />
                </div>
            </div>
        );
    }
}

export default withRouter(TemplateScreen);

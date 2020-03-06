import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';

class TemplateScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.template_name = this.props.match.params.name;
        this.template_version = this.props.match.params.version;
    }
    componentDidMount() {
        axios
            .get(
                './api/v1/template/' + this.template_name + '/' + this.template_version
            )
            .then(response => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
                if (error.response.status === 400) {
                    this.props.history.push('/templatestore/404');
                }
            });
    }
    render() {
        return (
            <div>
                <h1>
          template screen : {this.props.match.params.name} :{' '}
                    {this.props.match.params.version}
                </h1>
            </div>
        );
    }
}

export default withRouter(TemplateScreen);

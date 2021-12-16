import React, { Component } from "react";
import styles from './filter.less';

class Type extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectValue: ""
        };

        this.handleDropdownChange = this.handleDropdownChange.bind(this);
    }

    handleDropdownChange(e) {
        this.props.onChange(e.target.value);
        this.setState({ selectValue: e.target.value });
    }

    render() {
        return (
            <div>
                <div>
                    <select id="dropdown" className={styles.filter} onChange={this.handleDropdownChange}>
                        <option value="">Choose Type</option>
                        <option value="Email">Email</option>
                        <option value="Sms">Sms</option>
                        <option value="Policy_doc">Policy_doc</option>
                        <option value="Whatsapp">Whatsapp</option>
                        <option value="html_page">HTML Page</option>
                        <option value="push_notification">Push Notification</option>
                    </select>
                </div>
            </div>
        );
    }
}
export default Type;

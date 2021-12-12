import React, { Component } from "react";
import styles from './filter.less';

class Journey extends Component {
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
                        <option value="">Choose Journey</option>
                        <option value="Policy">Policy</option>
                        <option value="Claim">Claim</option>
                        <option value="IVR">IVR</option>
                        <option value="Purchase">Purchase</option>
                        <option value="Pre Inspection">Pre Inspection</option>
                        <option value="CX 360">CX 360</option>
                        <option value="Reporting">Reporting</option>
                    </select>
                </div>

                {/* <div>Selected value is : {this.state.selectValue}</div> */}
            </div>
        );
    }
}
export default Journey;

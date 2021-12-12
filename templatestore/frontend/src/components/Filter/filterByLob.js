import React, { Component } from "react";
import styles from './filter.less';

class Lob extends Component {
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
                        <option value="">Choose Lob</option>
                        <option value="Auto">Auto</option>
                        <option value="Health">Health</option>
                        <option value="Partnerships">Partnerships</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Visit">Visit</option>
                        <option value="Central">Central</option>
                        <option value="Acko Drive">Acko Drive</option>
                    </select>
                </div>

                {/* <div>Selected value is : {this.state.selectValue}</div> */}
            </div>
        );
    }
}
export default Lob;

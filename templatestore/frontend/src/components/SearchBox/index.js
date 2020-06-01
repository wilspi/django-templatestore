import React from 'react';
import PropTypes from 'prop-types';
import styles from './searchBox.less';

class SearchBox extends React.Component {
    constructor(props) {
        super(props);
    }

    onChange(event) {
        this.props.onChange(event.target.value);
    }

    render() {
        return (
            <input
                type="text"
                className={styles.searchBox}
                onChange={this.onChange.bind(this)}
                placeholder="search"
            />
        );
    }
}

SearchBox.propTypes = {
    onChange: PropTypes.func
};

export default SearchBox;

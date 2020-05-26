import React from 'react';
import PropTypes from 'prop-types';

class SearchBox extends React.Component {
    constructor(props) {
        super(props);
    }

    onChange(event) {
        this.props.onChange(event.target.value);
    }

    render() {
        return <input type="text" onChange={this.onChange.bind(this)} />;
    }
}
SearchBox.propTypes = {
    onChange: PropTypes.func
};

export default SearchBox;

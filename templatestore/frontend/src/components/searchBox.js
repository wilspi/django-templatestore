import React from 'react';

class SearchBox extends React.Component {
    constructor(props) {
        super(props);
    }

    onChange(event) {
        this.props.onChange(event.target.value);
    }

    render() {
        return <input type="text" onChange={this.onChange.bind(this)} placeholder="Search" />;
    }
}

export default SearchBox;

import { useHistory } from 'react-router-dom';
import React from 'react';

function OpenButton(title, link) {
    let history = useHistory();

    function handleClick() {
        history.push(link);
    }

    return (
        <button type="button" onClick={handleClick}>
            {title}
        </button>
    );
}

export default OpenButton;

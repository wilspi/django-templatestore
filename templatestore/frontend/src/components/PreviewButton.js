// eslint-disable
import React, { useState } from 'react';

export default function PreviewButton(props) {
    const [visibility, setVisibility] = useState([true]);
    return (<>
        {visibility &&
         <button onClick={() => {
             let val = props.preview;
             if (val) {
                 setVisibility(val);
             }
         }}>Preview</button>
        }
    </>);
}

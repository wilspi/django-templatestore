import React from 'react';
import styles from '../style/templateScreen.less';
export default function Dropdowncomp(props) {
    return (
        <div className={styles.teAttributesRow}>
            <div className={styles.teAttributesCell}>
                <select
                    name="urlKey"
                    value={props.urlKey}
                    placeholder="Choose a value"
                    onChange={(e) => props.handleChange(e, props.id)}
                >
                    <option value="" disabled>Choose URL</option>
                    {props.listOfUrls.map((urlopt) => (
                        <option value={urlopt} disabled={props.urlKey !== urlopt && urlopt in props.visited} >{urlopt}</option>
                    ))}
                </select>
            </div>
            <div className={styles.teAttributesCell}>
                <select
                    name="expiry"
                    value={props.expiry}
                    placeholder="Choose a value"
                    onChange={(e) => props.handleChange(e, props.id)}
                >
                    <option value="" disabled>Choose Expiry</option>
                    <option value="1,0,0">1 Day</option>
                    <option value="3,0,0">3 Day</option>
                    <option value="7,0,0">1 Week</option>
                    <option value="0,1,0">1 Month</option>
                    <option value="0,6,0">6 Months</option>
                    <option value="0,0,1">1 Year</option>
                </select>
                <span
                    className={styles.teDeleteAttribute}
                    onClick={(e) => props.removeDropdown(e, props.id)}
                >
                    &times;
                </span>
            </div>
        </div>
    );
}

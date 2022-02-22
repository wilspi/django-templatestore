import React from 'react';
import styles from '../style/templateScreen.less';

export default function TinyUrlDropdownComponent(props) {
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
                    {props.urlKeyList.map((urlKey) => (
                        <option value={urlKey} disabled={props.urlKey !== urlKey && props.visited[urlKey] === 1} >{urlKey}</option>
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
                    <option value="1">1 Day</option>
                    <option value="3">3 Day</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 days</option>
                    <option value="182">182 Days</option>
                    <option value="365">365 Days</option>
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

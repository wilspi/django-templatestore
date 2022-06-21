import React, { useState } from 'react';
import styles from '../style/WhatsAppEditor.less';
export default function CTAButton({
    button,
    handleChange,
    deleteButton,
    changeCTAButtonType
}) {
    const [ctaType, setCtaTypa] = useState(button.type);
    if (ctaType === 'phone_number') {
        return (
            <div
                className={`ui segment url_button ${styles.ctab_container}`}
                style={{
                    padding: '.5rem',
                    boxShadow: 'none',
                    backgroundColor: '#f8fafb',
                    border: '1px solid #dadde1',
                    borderRadius: '10px !important'
                }}
            >
                <span
                    className={styles.teDeleteAttribute}
                    onClick={e => deleteButton(button.id)}
                >
                    &times;
                </span>
                <div
                    className="ui segment"
                    style={{ padding: '0', border: 'none', boxShadow: 'none' }}
                >
                    <table
                        className="ui celled padded table"
                        style={{
                            fontFamily: 'Roboto, sans-serif',
                            border: 'none'
                        }}
                    >
                        <tbody>
                            <tr>
                                <td
                                    style={{
                                        paddingBottom: '.5rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    Type Of Action
                                </td>
                                <td
                                    style={{
                                        padding: '0 0 1rem 1rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    <select
                                        value={ctaType}
                                        className="ui dropdown call_to_action_type_dropdown"
                                        onChange={e => {
                                            setCtaTypa(e.target.value);
                                            changeCTAButtonType(
                                                button.id,
                                                ctaType
                                            );
                                        }}
                                    >
                                        <option value="phone_number">
                                            Call Phone Number
                                        </option>
                                        <option value="url">
                                            Visit Website
                                        </option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    style={{
                                        paddingBottom: '.5rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    Button Text
                                </td>
                                <td
                                    style={{
                                        padding: '0 1rem 1rem 1rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    <input
                                        type="text"
                                        maxLength="25"
                                        className="phone_number_button_text call_to_action_button_text"
                                        value={button.text}
                                        onChange={e =>
                                            handleChange(
                                                button.id,
                                                'text',
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td
                                    style={{
                                        paddingBottom: '.5rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    Phone Number
                                </td>
                                <td
                                    style={{
                                        padding: '0 1rem 1rem 1rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                    colSpan="4"
                                >
                                    <input
                                        type="text"
                                        placeholder="With Country Code"
                                        className="phone_number_textbox"
                                        value={button.phone_number}
                                        maxLength="13"
                                        onChange={e =>
                                            handleChange(
                                                button.id,
                                                'phone_number',
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    } else {
        return (
            <div
                className={`ui segment url_button ${styles.ctab_container}`}
                style={{
                    padding: '.5rem',
                    boxShadow: 'none',
                    backgroundColor: '#f8fafb',
                    border: '1px solid #dadde1',
                    borderRadius: '10px !important'
                }}
            >
                <span
                    className={styles.teDeleteAttribute}
                    onClick={e => deleteButton(button.id)}
                >
                    &times;
                </span>
                <div
                    className="ui segment"
                    style={{ padding: '0', border: 'none', boxShadow: 'none' }}
                >
                    <table
                        className="ui celled padded table"
                        style={{
                            fontFamily: 'Roboto, sans-serif',
                            border: 'none'
                        }}
                    >
                        <tbody>
                            <tr>
                                <td
                                    style={{
                                        paddingBottom: '.5rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    Type Of Action
                                </td>
                                <td
                                    style={{
                                        padding: '0 1rem 1rem 1rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    <select
                                        value={ctaType}
                                        className="ui dropdown call_to_action_type_dropdown"
                                        onChange={e => {
                                            setCtaTypa(e.target.value);
                                            changeCTAButtonType(
                                                button.id,
                                                ctaType
                                            );
                                        }}
                                    >
                                        <option value="phone_number">
                                            Call Phone Number
                                        </option>
                                        <option value="url">
                                            Visit Website
                                        </option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    style={{
                                        paddingBottom: '.5rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    Button Text
                                </td>
                                <td
                                    style={{
                                        padding: '0 1rem 1rem 1rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    <input
                                        type="text"
                                        maxLength="25"
                                        className="url_button_text call_to_action_button_text"
                                        value={button.text}
                                        onChange={e =>
                                            handleChange(
                                                button.id,
                                                'text',
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td
                                    style={{
                                        paddingBottom: '.5rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    URL Type
                                </td>
                                <td
                                    style={{
                                        padding: '0 1rem 1rem 1rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    <select
                                        id="url_type_dropdown"
                                        className="ui dropdown"
                                        value={button.urlType}
                                        onChange={e =>
                                            handleChange(
                                                button.id,
                                                'urlType',
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="STATIC">Static</option>
                                        <option value="DYNAMIC">Dynamic</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    style={{
                                        paddingBottom: '.5rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                >
                                    Website URL
                                    <i
                                        style={{
                                            color: '#444950',
                                            float: 'right'
                                        }}
                                        className="info circle icon"
                                        data-content="Adding a variable creates a personalized link for the customer to view their info. Only one variable will be added to the end of a URL. {{1}} will be added automatically to the url, no need to explicitly define it here."
                                    />
                                </td>
                                <td
                                    style={{
                                        padding: '0 1rem 1rem 1rem',
                                        backgroundColor: '#f8fafb',
                                        border: 'none'
                                    }}
                                    colSpan="3"
                                >
                                    <input
                                        id="website_url"
                                        type="text"
                                        value={button.url}
                                        onChange={e =>
                                            handleChange(
                                                button.id,
                                                'url',
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

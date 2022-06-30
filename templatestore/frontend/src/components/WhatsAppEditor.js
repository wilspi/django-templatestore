import styles from '../style/WhatsAppEditor.less';
import React, { useEffect, useState } from 'react';
import { uuid } from '../utils';
import CTAButton from './CTAButton';
import QuickReplyButton from './QuickReplyButton';
import { IoMdCall } from 'react-icons/io';
import { BsGlobe } from 'react-icons/bs';
function WhatsAppEditor(props) {
    const [header, setHeader] = useState(
        props.subTemplatesData.header?.data != null ?
            props.subTemplatesData.header?.data :
            ''
    );
    const [body, setBody] = useState(props.subTemplatesData.textpart.data);
    const [footer, setFooter] = useState(
        props.subTemplatesData.footer?.data != null ?
            props.subTemplatesData.footer?.data :
            ''
    );
    const [buttonList, setButtonList] = useState(
        props.editable ?
            { buttons: [] } :
            props.subTemplatesData.button == null ?
                { buttons: [] } :
                JSON.parse(props.subTemplatesData.button.data)
    );
    const [buttonCnt, setButtonCnt] = useState(0);
    const [buttonType, setButtonType] = useState(
        props.editable ?
            '' :
            props.subTemplatesData.button == null ?
                '' :
                props.subTemplatesData.button.renderMode
    );
    const [ctaTypeDropdownOptions, setCtaTypeDropdownOptions] = useState([{ text: "Call Phone Number", value: "phone_number", disabled: false }, { text: "Visit Website", value: "url", disabled: false }]);
    useEffect(() => {
        if (buttonType == 'cta') {
            setButtonCnt(2);
        } else {
            setButtonCnt(3);
        }
    }, [buttonType]);
    useEffect(() => {
        buttonList.buttons.forEach(button => {
            if (button.type == 'phone_number') {
                setCtaTypeDropdownOptions((prev) => {
                    prev[0].disabled = true;
                    return prev;
                });
            } else if (button.type == 'url') {
                setCtaTypeDropdownOptions((prev) => {
                    prev[1].disabled = true;
                    return prev;
                });
            }
        });
    }, [buttonList]);
    function handleChange(e) {
        let subType;
        if (e.target.name == 'header') {
            subType = 'header';
            setHeader(e.target.value);
        } else if (e.target.name == 'body') {
            subType = 'textpart';
            setBody(e.target.value);
        } else {
            subType = 'footer';
            setFooter(e.target.value);
        }
        props.onTemplateChange(subType, e.target.value);
    }

    function handleQuickReplyButtonChange(e, id) {
        let buttonListCopy = { ...buttonList };
        buttonListCopy.buttons = buttonList.buttons.map((button, index) => {
            if (button.reply.id == id) {
                return {
                    ...button,
                    reply: {
                        id: id,
                        title: e.target.value
                    }
                };
            }
            return button;
        });
        setButtonList(buttonListCopy);
        props.onTemplateChange('button', JSON.stringify(buttonListCopy));
    }

    function handleCTAButtonChange(id, field, value) {
        let buttonListCopy = { ...buttonList };
        buttonListCopy.buttons = buttonList.buttons.map((button, index) => {
            if (button.id == id) {
                return {
                    ...button,
                    [field]: value
                };
            }
            return button;
        });
        setButtonList(buttonListCopy);
        props.onTemplateChange('button', JSON.stringify(buttonListCopy));
    }

    function setButton(e) {
        let buttonType;
        switch (e.target.value) {
        case 'cta':
            buttonType = 'cta';
            break;
        case 'quick_reply':
            buttonType = 'quick_reply';
            break;
        }
        setButtonType(buttonType);
        setButtonCnt(buttonType == 'cta' ? 2 : 3);
        props.setButton(buttonType);
        props.onAttributesChange('button_type', buttonType);
    }

    function AddQuickReplyButton() {
        let buttonListCopy = {
            buttons: [
                ...buttonList.buttons,
                {
                    type: 'reply',
                    reply: {
                        id: uuid(),
                        title: ''
                    }
                }
            ]
        };
        setButtonList(buttonListCopy);
        props.onTemplateChange('button', JSON.stringify(buttonListCopy));
    }

    function AddCtaButton() {
        let newButton;
        if (ctaTypeDropdownOptions[0].disabled == false) {
            newButton = {
                id: uuid(),
                type: 'phone_number',
                text: '',
                phone_number: ''
            };
            setCtaTypeDropdownOptions(prev => {
                prev[0].disabled = true;
                return prev;
            });
        } else {
            newButton = {
                id: uuid(),
                type: 'url',
                text: '',
                urlType: 'STATIC',
                url: ''
            };
            setCtaTypeDropdownOptions(prev => {
                prev[1].disabled = true;
                return prev;
            });
        }
        let buttonListCopy = {
            buttons: [
                ...buttonList.buttons,
                newButton
            ]
        };
        setButtonList(buttonListCopy);
        props.onTemplateChange('button', JSON.stringify(buttonListCopy));
    }

    function deleteQuickReplyButton(id) {
        let buttonListCopy = { ...buttonList };
        buttonListCopy.buttons = buttonList.buttons.filter(button => {
            return button.reply.id != id;
        });
        setButtonList(buttonListCopy);
        props.onTemplateChange('button', JSON.stringify(buttonListCopy));
    }

    function deleteCTAButton(id) {
        let buttonListCopy = { ...buttonList };
        buttonListCopy.buttons = buttonListCopy.buttons.filter(button => {
            if (button.id == id) {
                setCtaTypeDropdownOptions(prev => {
                    let index = button.type == 'phone_number' ? 0 : 1;
                    prev[index].disabled = false;
                    return prev;
                });
                return false;
            }
            return true;
        });
        setButtonList(buttonListCopy);
        props.onTemplateChange('button', JSON.stringify(buttonListCopy));
    }

    function changeCTAButtonType(id, oldCTAType) {
        let buttonListCopy = { ...buttonList };
        buttonListCopy.buttons = buttonList.buttons.map((button, index) => {
            if (button.id == id) {
                if (oldCTAType == 'phone_number') {
                    setCtaTypeDropdownOptions(prev => {
                        prev[0].disabled = false;
                        prev[1].disabled = true;
                        return prev;
                    });
                    return {
                        id: id,
                        type: 'url',
                        text: '',
                        urlType: 'STATIC',
                        url: ''
                    };
                } else {
                    setCtaTypeDropdownOptions(prev => {
                        prev[0].disabled = true;
                        prev[1].disabled = false;
                        return prev;
                    });
                    return {
                        id: id,
                        type: 'phone_number',
                        text: '',
                        phone_number: ''
                    };
                }
            }
            return button;
        });
        setButtonList(buttonListCopy);
        props.onTemplateChange('button', JSON.stringify(buttonListCopy));
    }

    return (
        <div className={styles.WAeditor}>
            <div className={styles.WAeditor_inputs}>
                {props.subTemplatesData.header != null && (
                    <div>
                        <div>
                            Header{' '}
                            <span
                                className={`${styles.optional} ${styles.label}`}
                            >
                                Optional
                            </span>
                        </div>
                        <input
                            type="text"
                            name="header"
                            value={header}
                            onChange={handleChange}
                            style={{ marginBottom: '0px' }}
                            className={styles.WAinput}
                        />
                        {props.waMode == 'one_way' && <p style={{ fontSize: '12px' }}>
                            Header doesn't support variables in one-way mode.
                        </p>}
                    </div>
                )}
                <div>
                    <div>Body</div>
                    <textarea
                        name="body"
                        value={body}
                        onChange={handleChange}
                        rows="5"
                    />
                </div>
                {props.subTemplatesData.footer != null && (
                    <div>
                        <div>
                            Footer{' '}
                            <span
                                className={`${styles.optional} ${styles.label}`}
                            >
                                Optional
                            </span>
                        </div>
                        <input
                            type="text"
                            name="footer"
                            value={footer}
                            onChange={handleChange}
                            style={{ marginBottom: '0px' }}
                            className={styles.WAinput}
                        />
                        {props.waMode == 'one_way' && <p style={{ fontSize: '12px' }}>
                            Footer doesn't supports variables in one-way mode.
                        </p>}
                    </div>
                )}
                {buttonList.buttons.length != 0 &&
                    buttonList.buttons.map((button, index) => {
                        if (button.type == 'reply') {
                            return (
                                <QuickReplyButton
                                    key={button.reply.id}
                                    button={button}
                                    handleChange={handleQuickReplyButtonChange}
                                    deleteButton={deleteQuickReplyButton}
                                />
                            );
                        } else {
                            return (
                                <CTAButton
                                    key={button.id}
                                    button={button}
                                    ctaTypeDropdownOptions={ctaTypeDropdownOptions}
                                    handleChange={handleCTAButtonChange}
                                    deleteButton={deleteCTAButton}
                                    changeCTAButtonType={changeCTAButtonType}
                                />
                            );
                        }
                    })}
                {props.subTemplatesData.button != null && buttonType == '' && (
                    <div>
                        <div>Button to Add :</div>
                        <select
                            className={`${styles.teButtons} ${styles.WAselect}`}
                            onChange={setButton}
                            value={buttonType}
                        >
                            <option value="" disabled>
                                Choose
                            </option>
                            {props.availableButtons.map((item, index) => {
                                if (item != 'menu') {
                                    return <option value={item}>{item}</option>;
                                }
                            })}
                        </select>
                    </div>
                )}
                {buttonType != '' && buttonCnt - buttonList.buttons.length > 0 && (
                    <div>
                        <button
                            className={styles.waButton}
                            onClick={
                                buttonType == 'cta' ?
                                    AddCtaButton :
                                    AddQuickReplyButton
                            }
                        >
                            Add Button
                        </button>
                    </div>
                )}
            </div>
            <div className={styles.whatsapp_message_container}>
                <div className={styles.whatsapp_preview_header}>
                    <h3 style={{ color: '#4A4A4A', fontSize: '14px' }}>
                        Preview
                    </h3>
                </div>
                <div
                    className={`${styles.whatsapp_message_inner_container} ${styles.whatsapp_message__button_activated}`}
                >
                    <div
                        className={`${styles.whatsapp_message} ${styles.received}`}
                    >
                        <div
                            className={styles.text_header}
                            style={{ padding: '6px 7px 5px 5px' }}
                        >
                            {props.subTemplatesData.header != null &&
                                props.subTemplatesData.header.output}
                        </div>
                        <div
                            className={styles.header}
                            style={{ backgroundImage: 'none', display: 'none' }}
                        />
                        <div className={styles.body}>
                            <pre
                                style={{ whiteSpace: 'pre-wrap' }}
                                className={styles.template_content_pre}
                            >
                                {props.subTemplatesData.textpart.output}
                            </pre>
                            <div
                                className={styles.footer}
                                style={{ padding: '7px 4px 0px 2px' }}
                            >
                                {props.subTemplatesData.footer != null &&
                                    props.subTemplatesData.footer.output}
                            </div>
                            <div className={styles.metadata}>
                                <span className={styles.time}>5:14 PM</span>
                            </div>
                        </div>
                    </div>

                    {buttonList.buttons.map((button, index) => {
                        if (button.type == 'reply') {
                            return (
                                <div
                                    className={styles.quick_reply_buttons}
                                    style={{ marginLeft: '.5em' }}
                                >
                                    <div className={styles.quick_reply_button}>
                                        {button.reply.title}
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div className={styles.call_to_action_buttons}>
                                    <div
                                        className={styles.call_to_action_button}
                                        style={{
                                            direction: 'ltr',
                                            unicodeBidi: 'normal'
                                        }}
                                    >
                                        {button.type == 'phone_number' ? (
                                            <i className={styles.icon}>
                                                <IoMdCall />
                                            </i>
                                        ) : (
                                            <i className={styles.icon}>
                                                <BsGlobe />
                                            </i>
                                        )}
                                        {button.text}
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
}

export default WhatsAppEditor;

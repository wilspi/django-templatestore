import styles from '../style/WhatsAppEditor.less';
import { useEffect, useState } from 'react';
import { uuid } from '../utils';
function WhatsAppEditor(props) {
    const [header, setHeader] = useState(
        typeof props.subTemplatesData.header?.data != 'undefined'
            ? props.subTemplatesData.header?.data
            : ''
    );
    const [body, setBody] = useState(props.subTemplatesData.textpart.data);
    const [footer, setFooter] = useState(
        props.subTemplatesData.footer?.data != 'undefined'
            ? props.subTemplatesData.footer?.data
            : ''
    );
    const [buttonList, setButtonList] = useState(
        props.editable
            ? []
            : typeof props.subTemplatesData.button == 'undefined'
            ? []
            : JSON.parse(props.subTemplatesData.button.data)
    );
    const [buttonCnt, setButtonCnt] = useState(props.buttonCnt);
    const [selectedButton, setSelectedButton] = useState(
        props.editable
            ? ''
            : typeof props.subTemplatesData.button == 'undefined'
            ? ''
            : props.subTemplatesData.button.renderMode
    );
    const [buttonType, setButtonType] = useState('');
    useEffect(() => {
        setButtonList([]);
        setSelectedButton('');
        setButtonCnt(props.buttonCnt);
    }, [props.buttonCnt]);
    
    function handleChange(e, id = -1) {
        let subType;
        if (e.target.name == 'header') {
            subType = 'header';
            setHeader(e.target.value);
        } else if (e.target.name == 'body') {
            subType = 'textpart';
            setBody(e.target.value);
        } else if (e.target.name == 'footer') {
            subType = 'footer';
            setFooter(e.target.value);
        } else {
            subType = 'button';
            let buttonListCopy = buttonList.map((button, index) => {
                if (button.reply.id == id) {
                    return {
                        ...button,
                        reply: {
                            id: id,
                            title: e.target.value,
                        },
                    };
                }
                return button;
            });
            setButtonList(buttonListCopy);
            props.onTemplateChange(subType, JSON.stringify(buttonListCopy));
        }
        if (subType != 'button') {
            props.onTemplateChange(subType, e.target.value);
        }
    }

    function setButton(e) {
        let buttonType;
        switch (e.target.value) {
            case 'cta':
                buttonType = 'unknown';
                break;
            case 'quick_reply':
                buttonType = 'reply';
                break;
            case 'menu':
                buttonType = 'send';
                break;
        }
        setSelectedButton(e.target.value);
        setButtonType(buttonType);
        props.setButton(e.target.value);
    }

    function AddButton() {
        setButtonList([
            ...buttonList,
            {
                type: buttonType,
                reply: {
                    id: uuid(),
                    title: '',
                },
            },
        ]);
        setButtonCnt(prev => prev - 1);
    }

    function DeleteButton(id) {
        let buttonListCopy = buttonList.filter(button => {
            return button.reply.id != id;
        });
        setButtonList(buttonListCopy);
        setButtonCnt(prev => prev + 1);
    }

    return (
        <div className={styles.WAeditor}>
            <div className={styles.WAeditor_inputs}>
                <div>
                    <div>Header</div>
                    <input
                        type="text"
                        name="header"
                        value={header}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <div>Body</div>
                    <textarea
                        name="body"
                        value={body}
                        onChange={handleChange}
                        rows="5"
                    />
                </div>
                <div>
                    <div>Footer</div>
                    <input
                        type="text"
                        name="footer"
                        value={footer}
                        onChange={handleChange}
                    />
                </div>
                {buttonList.length != 0 &&
                    buttonList.map((button, index) => {
                        return (
                            <div>
                                <input
                                    type="text"
                                    key={button.reply.id}
                                    value={button.reply.title}
                                    className="WAinputs"
                                    onChange={e =>
                                        handleChange(e, button.reply.id)
                                    }
                                />
                                <button
                                    onClick={e => DeleteButton(button.reply.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    })}
                {typeof props.subTemplatesData.button != 'undefined' && selectedButton == '' && (
                    <div>
                        <label>Button to Add :</label>
                        <select
                            className={styles.teButtons}
                            onChange={setButton}
                            value={selectedButton}
                        >
                            <option value="" disabled>
                                Choose
                            </option>
                            {props.availableButtons.map((item, index) => {
                                return <option value={item}>{item}</option>;
                            })}
                        </select>
                    </div>
                )}
                {selectedButton != '' && buttonCnt != 0 && (
                    <div>
                        <button onClick={AddButton}>Add Button</button>
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
                            className="text-header"
                            style={{ padding: '6px 7px 5px 5px' }}
                        >
                            { props.subTemplatesData.header.output}
                        </div>
                        <div
                            class="header"
                            style={{ backgroundImage: 'none', display: 'none' }}
                        ></div>
                        <div class="body">
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
                                {props.subTemplatesData.footer.output}
                            </div>
                            <div class="metadata">
                                <span class="time">5:14 PM</span>
                            </div>
                        </div>
                    </div>
                    {buttonList.length != 0 && (
                        <div
                            className={styles.quick_reply_buttons}
                            style={{ marginLeft: '.5em' }}
                        >
                            {buttonList.map((button, index) => {
                                return (
                                    <div className={styles.quick_reply_button}>
                                        {button.reply.title}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WhatsAppEditor;

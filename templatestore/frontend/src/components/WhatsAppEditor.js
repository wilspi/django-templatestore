import styles from '../style/WhatsAppEditor.less';
import { useEffect, useState } from 'react';
function WhatsAppEditor(props) {
    const [header, setHeader] = useState(props.subTemplatesData.header.data);
    const [body, setBody] = useState(props.subTemplatesData.textpart.data);
    const [footer, setFooter] = useState(props.subTemplatesData.footer.data);
    const [buttonList, setButtonList] = useState([]);
    const [buttonCnt, setButtonCnt] = useState(0);
    const [buttonId, setButtonId] = useState(0);
    const [selectedButton, setSelectedButton] = useState('');
    useEffect(() => {
        setButtonCnt(props.buttonCnt);
    }, [props.buttonCnt]);
    function handleChange(e, index = -1) {
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
            let buttonListCopy = [...buttonList];
            buttonListCopy[index].text = e.target.value;
            setButtonList(buttonListCopy);
        }
        props.onTemplateChange(subType, e.target.value);
    }
    function setButton(e){
        setSelectedButton(e.target.value);
        props.setButton(e.target.value);
    }
    function AddButton() {
        setButtonList([...buttonList, { text: '', id: buttonId }]);
        setButtonId(prev => prev + 1);
        setButtonCnt(prev => prev - 1);
    }
    function DeleteButton(index) {
        let buttonListCopy = [...buttonList];
        buttonListCopy.splice(index, 1);
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
                    <input
                        type="text"
                        name="body"
                        value={body}
                        onChange={handleChange}
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
                                    key={button.id}
                                    value={button.text}
                                    className="WAinputs"
                                    onChange={e => handleChange(e, index)}
                                />
                                <button onClick={e => DeleteButton(index)}>
                                    Delete
                                </button>
                            </div>
                        );
                    })}
                {selectedButton == '' && (
                    <div>
                        <label>Button to Add :</label>
                        <select
                            className={styles.teButtons}
                            onChange={setButton}
                            value={selectedButton}
                            
                        >
                            <option value='' disabled>Choose</option>
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
                            {header}
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
                                {body}
                            </pre>
                            <div
                                className={styles.footer}
                                style={{ padding: '7px 4px 0px 2px' }}
                            >
                                {footer}
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
                                        {button.text}
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

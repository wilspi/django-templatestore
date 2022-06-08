import styles from '../style/WhatsAppEditor.less';
import { useState } from 'react';
function WhatsAppEditor() {
    const [header, setHeader] = useState('');
    const [body, setBody] = useState('');
    const [footer, setFooter] = useState('');
    const [buttonList, setButtonList] = useState([]);
    const [buttonCnt, setButtonCnt] = useState(0);
    function handleChange(e) {
        if (e.target.name == 'header') {
            setHeader(e.target.value);
        } else if (e.target.name == 'body') {
            setBody(e.target.value);
        } else {
            setFooter(e.target.value);
        }
    }
    function handleButtonChange(e, index) {
        console.log(e.target.value);
        let buttonListCopy = [...buttonList];
        buttonListCopy[index].text = e.target.value;
        setButtonList(buttonListCopy);
    }
    function AddButton() {
        setButtonList([...buttonList, { text: '', id: buttonCnt + 1 }]);
        setButtonCnt(prev => prev + 1);
    }
    function DeleteButton(index) {
        let buttonListCopy = [...buttonList];
        buttonListCopy.splice(index, 1);
        setButtonList(buttonListCopy);
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
                                    onChange={e => handleButtonChange(e, index)}
                                />
                                <button onClick={e => DeleteButton(index)}>
                                    Delete
                                </button>
                            </div>
                        );
                    })}
                {buttonList.length < 3 && (
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

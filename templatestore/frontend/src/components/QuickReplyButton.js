import React from 'react';
import styles from '../style/WhatsAppEditor.less';
export default function QuickReplyButton({ button, handleChange, deleteButton }) {
    return (
        <div>
            <input
                type="text"
                value={button.reply.title}
                className="WAinputs"
                onChange={e => handleChange(e, button.reply.id)}
            />
            <span
                className={styles.teDeleteAttribute}
                onClick={e => deleteButton(button.reply.id)}
            >
                &times;
            </span>
        </div>
    );
}

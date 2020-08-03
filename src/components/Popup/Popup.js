import React from 'react';
import './Popup.css';

export default function Popup(props) {
    return (
        <div id="popup-backdrop">
            <div id="popup">
                <div id="popup-text">
                    <p>{props.text}</p>
                </div>
                <div id="popup-close" onClick={() => props.handleClose()}>
                    <p>OKAY</p>
                </div>
            </div>
        </div>
    )
}

import React, { useState } from 'react';
import './Login.css';

export default function Login(props) {
    const [name, setName] = useState('');
    return (
        <div id="login">
            <div>
                <p id="login-announcement">ENTER A USERNAME TO BEGIN</p>
                <input type="text" name="name" placeholder="USERNAME" onChange={(evt) => setName(evt.target.value.toUpperCase().replace(/([^A-Z\s_\d]|\s(?=\s))/g,'').slice(0,10))} value={name} />
                <input type="button" onClick={() => name.length ? props.handleLogin(name) : null} value="SUBMIT" />
            </div>
        </div>
    )
}

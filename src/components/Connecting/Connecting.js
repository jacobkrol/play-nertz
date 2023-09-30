import React from 'react';
import './Connecting.css';
import Spinner from './Spinner';

export default function Connecting(props) {
    return (
        <div id="connecting">
            <h2>CONNECTING TO SERVER...</h2>
            <Spinner size={30} />
            <input className="outlined" type="button" value="CONTINUE OFFLINE" onClick={props.goOffline} />
        </div>
    )
}

import React from 'react';
import './Connecting.css';
import Spinner from './Spinner';

export default function Connecting() {
    return (
        <div id="connecting">
            <h2>CONNECTING TO SERVER...</h2>
            <Spinner size={30} />
        </div>
    )
}

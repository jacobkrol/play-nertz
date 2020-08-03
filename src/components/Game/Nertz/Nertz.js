import React from 'react';
import './Nertz.css';
import Card from '../Card';

export default function Nertz(props) {
    return (
        <fieldset id="nertz"><legend>Nertz</legend>
            <div id="nertz-container">
                <Card card={props.nertz[props.nertz.length-1]} handleClick={props.handleClick} />
                <p>({props.nertz.length})</p>
            </div>
        </fieldset>
    )
}

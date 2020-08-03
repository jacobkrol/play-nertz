import React from 'react';
import './Header.css';

export default function Header(props) {
    return (
        <div id="header">
            <h1>
                <span>Nertz</span>
                {props.gameId
                    ?<span>{props.gameId}</span>
                    : null
                }
                {props.name
                    ? <span>{props.name}</span>
                    : null
                }
            </h1>
        </div>
    )
}

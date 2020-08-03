import React from 'react';
import './LobbyUser.css';

export default function LobbyUser(props) {
    return (
        <div className="lobby-user">
            <p>{props.name}</p>
        </div>
    )
}

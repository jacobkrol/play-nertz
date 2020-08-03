import React, { useState } from 'react';
import './Lobby.css';
import LobbyUser from './LobbyUser';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function Lobby(props) {
    const [isReady, setIsReady] = useState(false);
    const handleReady = () => {
        props.handleReady(!isReady);
        setIsReady(!isReady);
    }

    return (
        <div id="lobby-container">
            <div id="lobby-announcement">
                <p>We're waiting to get started!</p>
            </div>
            <div id="lobby-user-container">
                {props.users.map((u,i) => <LobbyUser key={i} name={u} />)}
            </div>
            <div id="lobby-ready-container">
                <div id="lobby-ready-button" className={isReady ? "ready" : "unready"} onClick={() => handleReady()}>
                    <p>{isReady ? "CANCEL" : "READY"}</p>
                </div>
                <div id="lobby-ready-users">
                    {props.users.map((user,i) => user !== String("CPU "+Number(i+1))
                        ?   <div key={i} className="ready-user">
                                <>
                                    <p>{user}</p>
                                    {props.readyUsers.indexOf(user) !== -1 ? <FaCheckCircle className="ready" title="ready" /> : <FaTimesCircle className="unready" title="not ready" />}
                                </>
                            </div>
                        : null
                    )}
                </div>
            </div>
        </div>
    )
}

import React from 'react';
import './Stream.css';
import Card from '../Card';

export default function Stream(props) {
    return (
        <fieldset id="stream"><legend>Stream</legend>
            <div id="stream-container">
                <div id="stream-cards">
                {[...Array(props.streamPileSize)].map((a,i) =>
                    <Card key={i} card={props.stream[props.streamIndex+i]} handleClick={i === props.streamPileSize-1 ? props.handleClick : () => console.log("stream click")} />
                )}
                </div>
                <div id="next-stream" onClick={() => props.nextStream()}>
                    <p>NEXT</p>
                </div>
            </div>
        </fieldset>
    )
}

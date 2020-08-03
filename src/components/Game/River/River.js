import React from 'react';
import './River.css';
import Card from '../Card';

export default function River(props) {
    return (
        <fieldset id="river"><legend>River</legend>
            <div id="river-container">
                {[...Array(4)].map((a,r) =>
                    <div key={r} className="river-pile">
                        {props.river[r].map((card,i) =>
                            <Card key={i} card={card} handleClick={props.handleClick} />
                        )}
                    </div>
                )}
            </div>
        </fieldset>
    )
}

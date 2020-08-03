import React from 'react';
import './Lake.css';
import Card from '../Card';

export default function Lake(props) {
    return (
        <fieldset id="lake"><legend id="lake-add">Lake</legend>
            <div id="lake-container">
                <>
                {props.lake.map((pile,i) =>
                    <Card key={i} card={pile[pile.length-1].card} user={pile[pile.length-1].user.replace(/\s/g,'_')} handleClick={props.handleClick} />
                )}
                </>
                <div id="ace-out" onClick={() => props.handleClick('ace-out')}>
                    <p>ACE OUT</p>
                </div>
            </div>
        </fieldset>
    )
}

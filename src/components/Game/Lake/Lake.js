import React, { useEffect } from 'react';
import './Lake.css';
import Card from '../Card';

export default function Lake(props) {
    useEffect(() => {
        const height = document.getElementById("lake-container").scrollHeight;
        document.getElementById("lake-container").style.maxHeight = `${height}px`;
    }, [props.lake.length]);

    return (
        <fieldset id="lake"><legend id="lake-add">Lake</legend>
            <div id="lake-container">
                <>
                {props.lake.map((pile,i) =>
                    <Card key={i} card={pile[pile.length-1].card} user={pile[pile.length-1].user.replace(/\s/g,'_')} handleClick={props.handleClick} source="lake" />
                )}
                </>
                <div id="ace-out" onClick={() => props.handleClick('ace-out')}>
                    <p>ACE OUT</p>
                </div>
            </div>
        </fieldset>
    )
}

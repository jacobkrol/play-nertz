import React from 'react';
import './Card.css';
import { GiSpades, GiDiamonds, GiHearts, GiClubs } from 'react-icons/gi';

const getTextFromValue = (value) => {
    //convert Ace, Jack, Queen, King to letters
    switch(Number(value)) {
        case 0:
            return '';
        case 1:
            return 'A';
        case 11:
            return 'J';
        case 12:
            return 'Q';
        case 13:
            return 'K';
        default:
            return String(Number(value));
    }
}

export default function Card(props) {
    const value = props.card.slice(0,2);
    const suit = props.card.slice(2,3);
    const color = props.card.slice(3,4);
    const text = getTextFromValue(value);

    return (
        <div id={props.user ? props.card+"-"+props.user : props.card} className="card-box" onClick={() => props.user ? props.handleClick(props.card,props.user) : props.handleClick(props.card)}>
            <div className="card" style={{color: color === 'R' ? 'red' : color === 'B' ? 'black' : 'lime'}}>
                <p>{text}</p>
                {suit === 'H'
                    ? <GiHearts title="hearts"/>
                    : suit === 'D'
                        ? <GiDiamonds title="diamonds" />
                        : suit === 'S'
                            ? <GiSpades title="spades" />
                            : suit === 'C'
                                ? <GiClubs title="clubs" />
                                : <p></p>
                }
            </div>
        </div>
    )
}

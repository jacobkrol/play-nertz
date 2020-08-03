import React, { useState, useEffect } from 'react';
import './Game.css';
import Lake from './Lake';
import River from './River';
import Nertz from './Nertz';
import Stream from './Stream';
import { get_deck, solitaire_stack, lake_stack } from './logic.js';

export default function Game(props) {
    //define non-stateful variables
    const deck = get_deck();
    // let score = 0;

    //define stateful variables
    const [river, setRiver] = useState([ [deck[0]], [deck[1]], [deck[2]], [deck[3]] ]);
    const [nertz, setNertz] = useState(deck.slice(4,17)); // 4,17
    const [stream, setStream] = useState(deck.slice(17,53)); //17,53
    const [streamIndex, setStreamIndex] = useState(0);
    const [streamPileSize, setStreamPileSize] = useState(3);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    // const [isStalled, setIsStalled] = useState(false);
    const { updateScore, updateNertz } = props;

    useEffect(() => {
        updateScore(score);
    }, [updateScore,score]);
    useEffect(() => {
        updateNertz(nertz.length);
    }, [updateNertz,nertz]);

    const handleClick = (card, user='') => {
        if(card === 'ace-out' && (selected && selected.slice(0,2) === '01')) {
            //if ace selected and click on 'ace out'
            props.newLake([...props.lake, [{card:selected,user:props.name}]]);
            const result = removeOld(selected);
            autoRemove(result);
            unselect(selected);
            setScore(score+1);

        } else if(card === 'ace-out') {
            //if click on 'ace out' without an ace selected
            // *** INTENTIONALLY DO NOTHING ***

        } else if(card.slice(0,2) === '00' && selected) {
            //if click on blank with a selected card

            //save selected stack
            const selectedPile = [...river].filter(pile => pile.includes(selected));
            const selectedStack = selectedPile.length
                ? selectedPile[0].slice(selectedPile[0].indexOf(selected),selectedPile[0].length)
                : [selected];

            //remove old stack
            const r0 = [...river];
            const result = removeOld(selected);
            if(result[0] === 'river') {
                const r1 = result[1];
                const r2 = fillBlank(card.slice(2,3),selectedStack,r1);
                setRiver(r2);
            } else {
                const r1 = fillBlank(card.slice(2,3),selectedStack,r0);
                setRiver(r1);
                autoRemove(result);
            }
            unselect(selected);

        } else if(card.slice(0,2) === '00') {
            //if click on blank without selected card
            // *** INTENTIONALLY DO NOTHING ***

        } else if(selected === card) {
            //if click on same card
            unselect(card);

        } else if(selected && selected !== card) {
            //if click on different card than selected

            //check if new click is in lake
            props.lake.forEach((pile,i) => {
                if(pile[pile.length-1].card === card && pile[pile.length-1].user === user) {
                    //if you can stack them, stack them
                    if(lake_stack(card,selected)) {
                        let newLake = [...props.lake];
                        newLake[i].push({card:selected,user:props.name});
                        props.newLake(newLake);
                        const result = removeOld(selected);
                        autoRemove(result);
                        unselect(selected);
                        setScore(score+1);
                    }
                }
            });

            //check if new click is in river
            river.forEach((pile,i) => {
                if(pile[pile.length-1] === card) {
                    //if you can stack them, stack them
                    if(solitaire_stack(card,selected)) {
                        //save selected stack
                        const selectedPile = [...river].filter(pile => pile.includes(selected));
                        const selectedStack = selectedPile.length
                            ? selectedPile[0].slice(selectedPile[0].indexOf(selected),selectedPile[0].length)
                            : [selected];


                        //remove old stack
                        const result = removeOld(selected);
                        let newRiver = [...river];
                        if(result[0] === "river") {
                            newRiver = result[1];
                        } else {
                            autoRemove(result);
                        }

                        //push selected stack
                        selectedStack.forEach((c,j) => {
                            newRiver[i].push(c);
                        });
                        //update river and selected vars
                        setRiver(newRiver);
                        unselect(selected);
                    }
                }
            });

        } else {
            //in all else, see if exists outside lake
            let valid = false;
            river.forEach((pile, i) => {
                pile.forEach((c, j) => {
                    if(c===card) {
                        valid = true;
                    }
                });
            });
            if(nertz[nertz.length-1] === card) valid = true;
            if(stream[streamIndex+streamPileSize-1] === card) valid = true;

            if(valid) select(card);
        }
    }

    const select = (card) => {
        const c = document.getElementById(card);
        c.className += " selected";
        setSelected(card);
    }

    const unselect = (card) => {
        const c = document.getElementById(card);
        c.className = "card-box";
        setSelected(undefined);
    }

    const removeOld = (card) => {
        if(card === nertz[nertz.length-1]) {
            //if top of nertz pile
            const newNertz = [...nertz.slice(0,nertz.length-1)];
            return ["nertz",newNertz];
        } else if(card === stream[streamIndex+streamPileSize-1]) {
            //if top of stream pile
            const newStream = [
                ...stream.slice(0,streamIndex+streamPileSize-1),
                ...stream.slice(streamIndex+streamPileSize,stream.length)
            ];
            setStreamPileSize(streamPileSize-1);
            if(!streamPileSize) nextStream();
            return ["stream",newStream];
        } else {
            let newRiver = [...river];
            river.forEach((pile,i) => {
                pile.forEach((c,j) => {
                    if(c === card) {
                        newRiver[i] = [...pile.slice(0,j)];
                        if(!newRiver[i].length) {
                            newRiver[i] = ['00'+i+'X'];
                        }
                        // break;
                    }
                });
            });
            return ["river",newRiver];
        }
    }

    const autoRemove = (res) => {
        switch(res[0]) {
            case 'river':
                setRiver(res[1]);
                break;
            case 'nertz':
                setNertz(res[1]);
                break;
            case 'stream':
                setStream(res[1]);
                break;
            default:
                console.log("unrecognized removal location");
                break;
        }
    }

    const fillBlank = (pos,stack,r) => {
        let newR = [...r];
        newR[pos] = [];
        stack.forEach((c,i) => {
            newR[pos].push(c);
        });
        return newR;
    }

    const nextStream = () => {
        let newStreamIndex = streamIndex+Math.min(3,stream.length-streamIndex);
        if(newStreamIndex >= stream.length) newStreamIndex=0;
        setStreamIndex(newStreamIndex);
        const newStreamPileSize = Math.min(3,stream.length-newStreamIndex);
        setStreamPileSize(newStreamPileSize);
        if(selected) unselect(selected);
    }

    return (
        <div id="game">
            <div id="game-lake-row">
                <Lake lake={props.lake} handleClick={handleClick} />
            </div>
            <div id="game-player-row">
                <div id="game-player-row-1">
                    <River river={river} handleClick={handleClick} />
                </div>
                <div id="game-player-row-2" className="flex-row">
                    <Nertz nertz={nertz.length > 0 ? nertz : ['00XX']} handleClick={handleClick} />
                    <Stream stream={stream} handleClick={handleClick} streamIndex={streamIndex} streamPileSize={streamPileSize} nextStream={nextStream} />
                </div>
            </div>
        </div>
    )
}

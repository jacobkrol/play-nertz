import { useEffect, useRef } from 'react';
import {
    randint,
    get_deck,
    solitaire_stack,
    lake_stack
} from '../Game/logic.js';

export default function CPUGame(props) {
    const brainInterval = useRef(null);
    const deck = get_deck();
    const river = useRef([ [deck[0]], [deck[1]], [deck[2]], [deck[3]] ]);
    const nertz = useRef(deck.slice(4,17));
    const stream = useRef(deck.slice(17,53));
    const streamIndex = useRef(0);
    const streamPileSize = useRef(3);
    const score = useRef(0);
    const { difficulty } = props;

    const action = (pNertz=1) => {
        let action = false;
        if(Math.random() < pNertz/3) {
            switch(randint(2)) {
                case 0:
                    action = nertz_river();
                    break;
                case 1:
                    action = nertz_lake();
                    break;
                default:
                    break;
            }
        } else {
            switch(randint(4)) {
                case 0:
                    action = river_river();
                    break;
                case 1:
                    action = river_lake();
                    break;
                case 2:
                    action = stream_river();
                    if(!action || streamPileSize.current === 0) {
                        stream_update();
                    }
                    break;
                case 3:
                    action = stream_lake();
                    if(!action || streamPileSize.current === 0) {
                        stream_update();
                    }
                    break;
                default:
                    break;
        }

        }
    }
    //start and clear brain interval
    useEffect(() => {
        let delay = 1,
            pNertz = 1;
        switch(Number(difficulty)) {
            case 1:
                delay = 2000;
                pNertz = 0.4;
                break;
            case 2:
                delay = 1600;
                pNertz = 0.8;
                break;
            case 3:
                delay = 1000;
                pNertz = 1.0;
                break;
            default:
                console.log("invalid difficulty selected");
                break;
        }
        const offset = setTimeout(() => {
            brainInterval.current = setInterval(() => action(pNertz), delay);
        }, Math.random()*delay);


        return () =>  {
            clearInterval(brainInterval.current);
            clearTimeout(offset);
        }
    });

    const river_river = () => {
        let moves = [];
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                if(i===j) continue;
                for(let k=0; k<river.current[i].length; k++) {
                    if(solitaire_stack(
                        river.current[j][river.current[j].length-1],
                        river.current[i][k])) {
                            moves.push([i,j,k]);
                    }
                }
            }
        }
        if(moves.length) {
            let chosen = moves[randint(moves.length)];
            river.current[chosen[1]] = river.current[chosen[1]].concat(
                                       river.current[chosen[0]].slice(
                                       chosen[2],river.current[chosen[0]].length));
            river.current[chosen[0]] = [];
            fill_river();
            return true;
        }
        return false;
    }

    const river_lake = () => {
        for(let i=0; i<4; ++i) {
            //move aces to lake
            if(river.current[i][river.current[i].length-1].slice(0,2) === '01') {
                score.current = score.current + 1;
                props.updateCPUScore(props.id,score.current);
                let newLake = props.get_lake();
                newLake.push([{card:river.current[i].pop(),user:"*"+props.id}]);
                props.newLake(newLake);
                fill_river();
                return true;
            }

            //move lake stack-ables
            let newLake = props.get_lake();
            for(let pile of newLake) {
                if(lake_stack(pile[pile.length-1].card,
                    river.current[i][river.current[i].length-1])) {
                        score.current = score.current + 1;
                        props.updateCPUScore(props.id,score.current);
                        pile.push({card:river.current[i].pop(),user:"*"+props.id});
                        fill_river();
                        props.newLake(newLake);
                        return true;
                }

            }
        }
        return false;
    }

    const nertz_river = () => {
        for(let pile of river.current) {
            let bottom = pile[pile.length-1],
                top = nertz.current[nertz.current.length-1];
            if(solitaire_stack(bottom,top)) {
                pile.push(nertz.current.pop());
                console.log("nertz pop:",nertz.current.length,"id:",props.id);
                props.updateCPUNertz(props.id,nertz.current.length);
                return true;
            }
        }
        return false;
    }

    const nertz_lake = () => {
        //clear aces
        if(nertz.current[nertz.current.length-1].slice(0,2) === '01') {
            score.current = score.current + 1;
            props.updateCPUScore(props.id,score.current);
            let newLake = props.get_lake();
            newLake.push([{card:nertz.current.pop(),user:"*"+props.id}]);
            console.log("nertz pop:",nertz.current.length,"id:",props.id);
            props.updateCPUNertz(props.id,nertz.current.length);
            props.newLake(newLake);
            return true;
        }
        //idenfity other matches
        let newLake = props.get_lake();
        for(let pile of newLake) {
            let bottom = pile[pile.length-1].card,
                top = nertz.current[nertz.current.length-1];
            if(lake_stack(bottom,top)) {
                score.current = score.current + 1;
                props.updateCPUScore(props.id,score.current);
                pile.push({card:nertz.current.pop(),user:"*"+props.id});
                props.newLake(newLake);
                console.log("nertz pop:",nertz.current.length,"id:",props.id);
                props.updateCPUNertz(props.id,nertz.current.length);
                return true;
            }
        }
        return false;
    }

    const stream_river = () => {
        if(streamPileSize.current === 0) {
            stream_update();
        }

        const top = stream.current[streamIndex.current+streamPileSize.current-1];
        for(let pile of river.current) {
            if(solitaire_stack(pile[pile.length-1],top)) {
                pile.push(top);
                stream.current.splice(streamIndex.current+streamPileSize.current-1,1);
                streamPileSize.current = streamPileSize.current - 1;
                return true;
            }
        }

        return false;
    }

    const stream_lake = () => {
        if(streamPileSize.current === 0) {
            stream_update();
        }
        const top = stream.current[streamIndex.current+streamPileSize.current-1];
        if(top.slice(0,2) === '01') {
            score.current = score.current + 1;
            props.updateCPUScore(props.id,score.current);
            let newLake = props.get_lake();
            newLake.push([{card:top,user:"*"+props.id}]);
            props.newLake(newLake);
            stream.current.splice(streamIndex.current+streamPileSize.current-1,1);
            streamPileSize.current = streamPileSize.current - 1;
            return true;
        }
        let newLake = props.get_lake();
        for(let pile of newLake) {
            if(lake_stack(pile[pile.length-1].card,top)) {
                score.current = score.current + 1;
                props.updateCPUScore(props.id,score.current);
                pile.push({card:stream.current.splice(streamIndex.current+streamPileSize.current-1,1)[0],user:"*"+props.id});
                streamPileSize.current = streamPileSize.current - 1;
                return true;
            }
        }
        return false;
    }

    const fill_river = () => {
        for(let i=0; i<4; ++i) {
            if(river.current[i].length === 0) {
                river.current[i] = [nertz.current.pop()];
                console.log("nertz pop:",nertz.current.length,"id:",props.id);
                props.updateCPUNertz(props.id,nertz.current.length);
            }
        }
    }

    const stream_update = () => {
        //update stream index
        streamIndex.current += 3;
        if(streamIndex.current >= stream.current.length) {
            streamIndex.current = 0;
        }

        //update stream pile size
        streamPileSize.current = Math.min(3,stream.current.length-streamIndex.current);
    }

    return null;

}

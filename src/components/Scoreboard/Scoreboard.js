import React, { useState } from 'react';
import './Scoreboard.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function get_results(scoreUpdate) {
    //fill result array with all score data
    let res = [];
    Object.keys(scoreUpdate).forEach((user,i) => {
        //define values before appending for easier code comprehension
        const lake = scoreUpdate[user].lake;
        const nertz = scoreUpdate[user].nertz;
        const nertzPts = -2*Number(scoreUpdate[user].nertz);
        const score = Number(lake)-2*Number(nertz);
        const scoreText = score < 0 ? String(score) : "+"+String(score);
        //push player object to array
        res.push({
            name: user,
            lake: lake,
            nertz: nertz,
            nertzPts: nertzPts,
            score: score,
            scoreText: scoreText
        });
    });
    //organize game results by highest scores first
    let change;
    do {
        change = false;
        for(let i=0; i<res.length-1; i++) {
            const score1 = res[i].score,
                  score2 = res[i+1].score;
            if(score1 < score2) {
                //swap
                [ res[i], res[i+1] ]=[ res[i+1], res[i] ];
                //update change
                change = true;
            }
        }
    } while(change);
    //return results
    return res;
}

function get_leaderboard(scoreUpdate,scores) {
    //fill leaderboard array with all score data
    let lb = [];
    Object.keys(scoreUpdate).forEach((user,i) => {
        //define values before appending for easier code comprehension
        const name = user;
        const lake = Number(scoreUpdate[user].lake);
        const nertz = Number(scoreUpdate[user].nertz);
        const update = lake - 2*nertz;
        const prev = scores[user] - update;
        const total = scores[user];
        //push player object to array
        lb.push({
            name: name,
            prev: prev,
            update: update,
            total: total
        });
    });
    //organize loaderboard by highest scores first
    let change;
    do {
        change = false;
        for(let i=0; i<lb.length-1; i++) {
            const score1 = lb[i].total,
                  score2 = lb[i+1].total;
            if(score1 < score2) {
                //swap
                [ lb[i], lb[i+1] ]=[ lb[i+1], lb[i] ];
                //update change
                change = true;
            }
        }
    } while(change);
    //return leaderboard
    return lb;
}

export default function Scoreboard(props) {
    const [isReady, setIsReady] = useState(false);
    const handleReady = () => {
        props.handleReady(!isReady);
        setIsReady(!isReady);
    }
    const leaderboard = get_leaderboard(props.scoreUpdate,props.scores);
    const results = get_results(props.scoreUpdate);

    return (
        <div id="scoreboard">
            <div>
                <p className="scoreboard-title">SCOREBOARD</p>
            </div>
            <div>
                <p className="scoreboard-subtitle">GAME {props.gameCount} RESULTS</p>
                <table className="scoreboard-table">
                    <thead>
                        <tr>
                            <td>PLAYER</td>
                            <td>LAKE</td>
                            <td>(NERTZ)</td>
                            <td>TOTAL</td>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((user,i) =>
                            <tr key={i}>
                                <td>{user.name}</td>
                                <td>+{user.lake}</td>
                                <td>{user.nertzPts} ({user.nertz})</td>
                                <td>{user.scoreText}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div>
                <p className="scoreboard-subtitle">CURRENT LEADERBOARD</p>
                <table className="scoreboard-table">
                    <thead>
                        <tr>
                            <td>PLAYER</td>
                            <td>PREV</td>
                            <td>GAME {props.gameCount}</td>
                            <td>TOTAL</td>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((user,i) =>
                            <tr key={i}>
                                <td>{user.name}</td>
                                <td>{user.prev}</td>
                                <td>{user.update < 0 ? user.update : "+"+user.update}</td>
                                <td>{user.total}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div id="scoreboard-ready-container">
                <div id="scoreboard-ready-button" className={isReady ? "ready" : "unready"} onClick={() => handleReady()}>
                    <p>{isReady ? "CANCEL" : "READY"}</p>
                </div>
                {props.isOffline ? null : 
                    <div id="scoreboard-ready-users">
                        {Object.keys(props.scores).map((user,i) => user !== String("CPU "+Number(i+1))
                            ?   <div key={i} className="ready-user">
                                    <>
                                        <p>{user}</p>
                                        {props.readyUsers.indexOf(user) !== -1 ? <FaCheckCircle className="ready" title="ready" /> : <FaTimesCircle className="unready" title="not ready" />}
                                    </>
                                </div>
                            : null
                        )}
                    </div>
                }
            </div>
        </div>
    )
}

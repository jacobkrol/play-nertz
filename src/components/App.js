import React from 'react';
import { w3cwebsocket } from 'websocket';
import Header from './Header';
import Login from './Login';
import Lobby from './Lobby';
import Countdown from './Countdown';
import Game from './Game';
import CPUGame from './CPUGame';
import Join from './Join';
import Scoreboard from './Scoreboard';
import Popup from './Popup';
import Connecting from './Connecting';

const client = new w3cwebsocket('ws:192.168.0.8:8000');

class App extends React.Component {
    state = {
        isConnected: false,
        gameId: false, // false
        isLoggedIn: false, // false
        isRunning: false, // false
        isLocked: true, // true
        isReady: false,
        isHost: false,
        numCPUs: 0,
        CPUdiff: 1,
        readyUsers: [],
        countdown: undefined,
        popup: false,
        name: undefined,
        users: [],
        lake: [],
        lastLake: 0,
        lastNertz: 13,
        lastCPULake: [],
        lastCPUNertz: [],
        scores: {},
        scoreUpdate: {},
        gameCount: 0
    }
    componentDidMount() {
        client.onopen = () => {
            this.setState({isConnected: true});
            console.log("websocket client connected");
        };
        client.onmessage = (message) => {
            const msg = JSON.parse(message.data);
            // console.log("message received:",msg);

            switch(msg.type) {
                case 'lakeupdate':
                    this.setState({lake: msg.data});
                    break;
                case 'userlist':
                    //add any new users to the score matrix
                    let newScores0 = {...this.state.scores};
                    msg.data.forEach((user,i) => {
                        if(Object.keys(newScores0).indexOf(user) === -1) {
                            newScores0[user] = 0;
                        }
                    });
                    this.setState({users: msg.data, scores: {...newScores0}});
                    break;
                case 'loginstatus':
                    if(msg.data) {
                        this.setState({isLoggedIn: true, name: msg.data});
                    } else {
                        alert("That username is already taken. Please type another and join again.");
                    }
                    break;
                case 'gamestatus':
                    if(msg.data === "end") {
                        this.endGame();
                        client.send(JSON.stringify({
                            type: 'newscore',
                            gameId: this.state.gameId,
                            lake: this.state.lastLake,
                            nertz: this.state.lastNertz,
                            cpu: false
                        }));
                        if(this.state.isHost) {
                            for(let i=0; i<this.state.numCPUs; i++) {
                                client.send(JSON.stringify({
                                    type: 'newscore',
                                    gameId: this.state.gameId,
                                    lake: this.state.lastCPULake[i],
                                    nertz: this.state.lastCPUNertz[i],
                                    cpu: true,
                                    cpuId: String("*"+i)
                                }));
                            }
                        }
                        //send cpu scores if host
                        break;
                    }
                    if(msg.data > 0) {
                        if(!this.state.isRunning) {
                            this.setState({isRunning: true, countdown: Number(msg.data)});
                        } else {
                            this.setState({countdown: Number(msg.data)});
                        }
                    } else if(msg.data === 0) {
                        //new game -> reset variables
                        const blank0Arr = Array.from(Array(Number(this.state.numCPUs)), () => 0);
                        const blank13Arr = Array.from(Array(Number(this.state.numCPUs)), () => 13);
                        this.setState({
                            countdown: undefined,
                            isLocked: false,
                            lake: [],
                            lastLake: 0,
                            lastNertz: 13,
                            readyUsers: [],
                            lastCPULake: [...blank0Arr],
                            lastCPUNertz: [...blank13Arr]
                        });
                    }
                    break;
                case 'scoreupdate':
                    let newScores1 = {...this.state.scores};
                    Object.keys(msg.data).forEach((user, i) => {
                        newScores1[user] += Number(msg.data[user].lake)-2*Number(msg.data[user].nertz);
                    });
                    this.setState({scoreUpdate: msg.data, scores: {...newScores1}, gameCount: this.state.gameCount+1});
                    break;
                case 'readyupdate':
                    this.setState({readyUsers: msg.data});
                    break;
                case 'createupdate':
                    if(msg.data !== false) {
                        this.setState({gameId: msg.data, isHost: true}, () => {
                            console.log("created and joined game id",this.state.gameId);
                            const text = <><span>Your new game was created! Invite your friends to play along with Game Code: </span><span className='monospace'>{this.state.gameId}</span></>;
                            this.setState({popup: text});
                        });
                    } else {
                        alert("An error occurred while creating your game. Please try again.");
                    }
                    break;
                case 'joinupdate':
                    if(msg.data !== false) {
                        this.setState({gameId: msg.data}, () => {
                            console.log("joined game id",this.state.gameId);
                        });
                    } else {
                        alert("Sorry we couldn't add you to this game.");
                    }
                    break;
                default:
                    console.log("unrecognized type",msg.type);
                    break;
            }
        };
    }

    endGame = () => {
        const text = <><span>Nertz!</span><br /><br /><span>Click OKAY to view the results.</span></>;
        this.setState({isLocked: true, popup: text});
    }

    updateScore = (newValue) => {
        this.setState({lastLake: newValue});
    }

    updateNertz = (newValue) => {
        this.setState({lastNertz: newValue}, () => {
            if(this.state.lastNertz === 0) {
                this.endGame();
                client.send(JSON.stringify({
                    type: 'gamestatus',
                    gameId: this.state.gameId,
                    data: false
                }));
            }
        });
    }

    updateCPUScore = (id, newValue) => {
        let newCPULake = this.state.lastCPULake;
        newCPULake[id] = newValue;
        this.setState({lastCPULake: newCPULake});
    }

    updateCPUNertz = (id, newValue) => {
        let newCPUNertz = this.state.lastCPUNertz;
        newCPUNertz[id] = newValue;
        this.setState({lastCPUNertz: newCPUNertz}, () => {
            for(let cpu of this.state.lastCPUNertz) {
                if(cpu === 0) {
                    this.endGame();
                    client.send(JSON.stringify({
                        type: 'gamestatus',
                        gameId: this.state.gameId,
                        data: false
                    }));
                    break;
                }
            }
        });
    }

    handleJoin = (gameId) => {
        client.send(JSON.stringify({
            type: 'joingame',
            data: gameId
        }));
    }

    handleCreate = (numCPUs,diff) => {
        this.setState({numCPUs: numCPUs, CPUdiff: diff});
        client.send(JSON.stringify({
            type: 'newgame',
            numCPUs: numCPUs
        }));
    }

    handleLogin = (name) => {
        client.send(JSON.stringify({
            type: 'newuser',
            gameId: this.state.gameId,
            name: name
        }));
    }

    handleStart = () => {
        console.log("start!");
        client.send(JSON.stringify({
            type: 'gamestatus',
            gameId: this.state.gameId,
            data: true
        }));
        this.setState({isRunning: true, isLocked: true});
    }

    handleReady = (isReady) => {
        client.send(JSON.stringify({
            type: 'newready',
            gameId: this.state.gameId,
            data: isReady
        }));
    }

    newLake = (lake) => {
        client.send(JSON.stringify({
            type: 'newlake',
            gameId: this.state.gameId,
            data: [...lake]
        }));

    }

    render() {
        return (
            <>
                <Header name={this.state.name} gameId={this.state.gameId} />
                {this.state.isConnected
                    ? this.state.gameId
                        ? this.state.isLoggedIn
                            ? this.state.isRunning
                                ? this.state.isLocked
                                    ? this.state.countdown
                                        ? <Countdown text={this.state.countdown} shape={Number(this.state.countdown) ? 'circle' : 'square'} />
                                        : <Scoreboard scoreUpdate={this.state.scoreUpdate} scores={this.state.scores} handleReady={this.handleReady} readyUsers={this.state.readyUsers} gameCount={this.state.gameCount} />
                                    : <>
                                        <Game lake={this.state.lake} newLake={this.newLake} name={this.state.name} updateScore={this.updateScore} updateNertz={this.updateNertz} />
                                        {this.state.isHost
                                            ? [...Array(Number(this.state.numCPUs))].map((n,i) =>
                                                <CPUGame id={i} key={i} get_lake={() => [...this.state.lake]} newLake={this.newLake} updateCPUScore={this.updateCPUScore} updateCPUNertz={this.updateCPUNertz} difficulty={this.state.CPUdiff} />
                                              )
                                            : null
                                        }
                                      </>
                                : <Lobby handleReady={this.handleReady} users={this.state.users} readyUsers={this.state.readyUsers} />
                            : <Login handleLogin={this.handleLogin} />
                        : <Join handleJoin={this.handleJoin} handleCreate={this.handleCreate} throwPopup={(text) => this.setState({popup: text})} />
                    : <Connecting />
                }
                {this.state.popup
                    ? <Popup text={this.state.popup} handleClose={() => this.setState({popup: false})} />
                    : null
                }
            </>
        )
    }
}

export default App;

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
import "./App.css";

let client;
let noConnect = false;
try {
    client = new w3cwebsocket('ws:192.168.56.1:8000');
} catch(err) {
    console.error("Failed to connect to server:", err);
    noConnect = true;
}

class App extends React.Component {
    state = {
        isJoinedOffline: false,
        willBeOffline: false,
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
        countdownTimeout: [],
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

    configureClient = () => {
        client.onopen = () => {
            this.setState({ isConnected: true, willBeOffline: true });
        };
        client.onmessage = (message) => {
            const msg = JSON.parse(message.data);

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

    componentDidMount() {
        if(noConnect) {
            this.setState({ isConnected: true, willBeOffline: true });
            return;
        }

        if(client) {
            try {
                this.configureClient();
            } catch(err) {
                console.error("Failed to initialize server connection:",err);
            }
        }
    }

    goOffline = () => {
        this.setState({ isConnected: true, willBeOffline: true });
        noConnect = true;
        console.log("Zero dark thirty. Going dark");
    }

    endGame = () => {
        if(this.state.isJoinedOffline) {
            const text = <><span>Nertz!</span><br /><br /><span>Click OKAY to view the results.</span></>;
            let scoreUpdate = {};
            scoreUpdate[this.state.name] = {
                lake: this.state.lastLake,
                nertz: this.state.lastNertz
            };
            for(let i=0; i<this.state.numCPUs; i++) {
                const name = "CPU "+String(i);
                scoreUpdate[name] = {
                    lake: this.state.lastCPULake[i],
                    nertz: this.state.lastCPUNertz[i]
                };
            }
            let newScores1 = {...this.state.scores};
            Object.keys(scoreUpdate).forEach((user, i) => {
                newScores1[user] += Number(scoreUpdate[user].lake)-2*Number(scoreUpdate[user].nertz);
            });
            this.setState({
                isLocked: true,
                popup: text,
                scoreUpdate: scoreUpdate,
                scores: {...newScores1},
                gameCount: this.state.gameCount+1
            });
        } else {
            const text = <><span>Nertz!</span><br /><br /><span>Click OKAY to view the results.</span></>;
            this.setState({isLocked: true, popup: text});
        }
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
        if(!client) {
            alert("Could not connect to the server. Please refresh and try again.");
            return;
        }
        client.send(JSON.stringify({
            type: 'joingame',
            data: gameId
        }));
    }

    handleCreate = (numCPUs,diff,offline) => {
        if(!offline) {
            this.setState({numCPUs: numCPUs, CPUdiff: diff});
            client.send(JSON.stringify({
                type: 'newgame',
                numCPUs: numCPUs
            }));
        } else {
            let users = [];
            let scores = {};
            for(let i=0; i<numCPUs; i++) {
                const name = "CPU "+String(i);
                users.push(name);
                scores[name] = 0;
            }
            this.setState({
                numCPUs: numCPUs,
                CPUdiff: diff,
                users: [...users],
                scores: {...scores},
                isJoinedOffline: true
            });
        }
    }

    handleLogin = (name) => {
        if(this.state.isJoinedOffline) {
            if(this.state.users.indexOf(name) === -1) {
                let users = [...this.state.users];
                const scores = {...this.state.scores};
                users.push(name);
                scores[name] = 0;
                this.setState({
                    isLoggedIn: true,
                    name: name,
                    users: [...users],
                    scores: {...scores}
                });
            } else {
                alert("That username is already taken. Please type another and join again.");
            }
        } else {
            client.send(JSON.stringify({
                type: 'newuser',
                gameId: this.state.gameId,
                name: name
            }));
        } 
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
        if(this.state.isJoinedOffline) {
            this.setState({isRunning: true, countdown: 5});
            for(let i=4; i>-1; i--) {
                const newTimeout = setTimeout(() => this.setState({"countdown":Number(i)}), 1000*(5-Number(i)) );
                let timers = [...this.state.countdownTimeout];
                timers.push(newTimeout);
                this.setState({countdownTimeout: timers});
            }
            const newTimeout = setTimeout(() => {
                //new game -> reset variables
                const blank0Arr = Array.from(Array(Number(this.state.numCPUs)), () => 0);
                const blank13Arr = Array.from(Array(Number(this.state.numCPUs)), () => 13);
                this.setState({
                    isLocked: false,
                    countdown: undefined,
                    lake: [],
                    lastLake: 0,
                    lastNertz: 13,
                    readyUsers: [],
                    lastCPULake: [...blank0Arr],
                    lastCPUNertz: [...blank13Arr]
                });
            }, 4950);
            let timers = [...this.state.countdownTimeout];
            timers.push(newTimeout);
            this.setState({countdownTimeout: timers});
        } else {
            client.send(JSON.stringify({
                type: 'newready',
                gameId: this.state.gameId,
                data: isReady
            }));
        }
    }

    newLake = (lake) => {
        if(this.state.isJoinedOffline) {
            this.setState({lake: lake});
        } else {
            client.send(JSON.stringify({
                type: 'newlake',
                gameId: this.state.gameId,
                data: [...lake]
            }));
        }
    }

    handlePause = (isPaused) => {
        if(this.state.isJoinedOffline) {
            this.setState({ isPaused });
        }   
    }

    render() {
        return (
            <div id="app-container">
                <Header name={this.state.name} gameId={this.state.gameId} />
                {this.state.isConnected
                    ? this.state.gameId || this.state.isJoinedOffline
                        ? this.state.isLoggedIn
                            ? this.state.isRunning
                                ? this.state.isLocked
                                    ? this.state.countdown
                                        ? <Countdown text={this.state.countdown} shape={Number(this.state.countdown) ? 'circle' : 'square'} />
                                        : <Scoreboard scoreUpdate={this.state.scoreUpdate} scores={this.state.scores} handleReady={this.handleReady} readyUsers={this.state.readyUsers} gameCount={this.state.gameCount} isOffline={this.state.isJoinedOffline} />
                                    : <>
                                        <Game lake={this.state.lake} newLake={this.newLake} name={this.state.name} updateScore={this.updateScore} updateNertz={this.updateNertz} />
                                        {this.state.isHost
                                            ? [...Array(Number(this.state.numCPUs))].map((n,i) =>
                                                <CPUGame id={i} key={i} get_lake={() => [...this.state.lake]} newLake={this.newLake} updateCPUScore={this.updateCPUScore} updateCPUNertz={this.updateCPUNertz} difficulty={this.state.CPUdiff} />
                                              )
                                            : null
                                        }
                                      </>
                                : <Lobby handleReady={this.handleReady} users={this.state.users} readyUsers={this.state.readyUsers} isOffline={this.state.isJoinedOffline} />
                            : <Login handleLogin={this.handleLogin} />
                        : <Join handleJoin={this.handleJoin} handleCreate={this.handleCreate} throwPopup={(text) => this.setState({popup: text})} isOffline={this.state.willBeOffline} />
                    : <Connecting goOffline={this.goOffline} />
                }
                {this.state.popup
                    ? <Popup text={this.state.popup} handleClose={() => this.setState({popup: false})} />
                    : null
                }
            </div>
        )
    }
}

export default App;

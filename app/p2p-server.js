const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;

//list of websocket addresses that websocket to connect to as peer
//not http,,here ws protocol... ws://localhost:5001,ws://localhost:5002 (if theres more than 1 peer ..here on 5002)(entire string for peers env variable)
const peers = process.env.PEERS  ? process.env.PEERS.split(',') : [];


class P2pServer{
  constructor(blockchain){
    this.blockchain = blockchain;
    this.sockets = [];
  }

  listen(){
    const server = new Websocket.Server({ port : P2P_PORT});

   //event listener
    server.on('connection',socket => this.connectSocket(socket))

    this.connectToPeers();
    console.log(`Listening on peer-to-peer connections on: ${P2P_PORT}`);
  }

  connectToPeers(){
    peers.forEach( peer =>{
       //ws://localhost:5001
       const socket = new Websocket(peer);
       socket.on('open',() => this.connectSocket(socket));
    });

  }

  connectSocket(socket){
    this.sockets.push(socket);
    console.log('Socket connected');
    this.messageHandler(socket);
    this.sendChain(socket);
  }

  messageHandler(socket){

    //event listener on the socket to listen to the messages from other peers
    socket.on('message', message=>{
      const data = JSON.parse(message);
      console.log('data',data);
      //replacing with right chain
      this.blockchain.replaceChain(data);
    });
  }

  sendChain(socket){
    //sending blockchain to others
    socket.send(JSON.stringify(this.blockchain.chain));  //making it into string

  }
 //synchronise all the peers
  syncChains(){
    this.sockets.forEach(socket =>this.sendChain(socket));
  }
}

module.exports = P2pServer;

const SHA256 = require('crypto-js/SHA256');
const {DIFFICULTY} = require('../config');

class Block{
 constructor(timestamp , lastHash , hash ,data, nonce){
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
  }

  toString() {
    return `{"timestamp":"${this.timestamp}", "lastHash":"${this.lastHash}","hash" : "${this.hash}" ,"data" :"${this.data}","nonce": "${this.nonce}"}`;
  }

  static genesis(){
    return new this('00000000','----','genesis-hash',"genesis", 0);
  }

  static mineBlock(lastBlock ,data){
    let hash,timestamp;

    const lastHash = lastBlock.hash;
    let nonce = 0;
    do{
      nonce++;
      timestamp = Date.now();
      hash = Block.hash(timestamp,lastHash,data,nonce);
    }while(hash.substring(0,DIFFICULTY) !== '0'.repeat(DIFFICULTY));

    return new this(timestamp ,lastHash , hash , data ,nonce);
  }

  static hash(timestamp,lastHash,data,nonce){
    return SHA256(`${timestamp}${lastHash}${data}${nonce}`).toString();
  }

  static blockHash(block){
    const {timestamp , lastHash ,data ,nonce} = block;  //new ES6 syntax for destructor
    return Block.hash(timestamp,lastHash,data ,nonce);
  }
}

 //module exports will make this file available to access from other files
module.exports = Block;

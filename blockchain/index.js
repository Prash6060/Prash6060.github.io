const Blockchain = require('./blockchain');

class Election {
    constructor() {
        this.electionType = ["Lok Sabha", "Rajya Sabha"];
        this.constituency = "Mumbai";
        this.candidates = ["SpiderMan", "Iron Man", "Thor", "Hulk"];
        this.start = new Blockchain(); //create object of Blockchain class
        // this.flag = 0;                    //needed to start and stop election
        this.candidate_count = 0;
        this.images = ["https://wallpaperaccess.com/full/382306.jpg", "https://wallpaperaccess.com/full/382306.jpg", "https://wallpaperaccess.com/full/382306.jpg", "https://wallpaperaccess.com/full/382306.jpg"]
    }

    setCandidate(name) {
        //this.candidates.push(name);
    }

    startElection() {

    }

    stopElection() {
        //close mongoDB connection
        this.flag = 1; //flag will refrain from adding any new node to the blockchain after the election is ended.
    }

    setVote(vote_option) {
        return this.start.addBlock(vote_option); //adds new data to blockchain and the data is our vote_option
    }

    getResult() {
        let arr = new Array(4); //array of candidates whos count of votes are stored
        for (let i = 0; i < arr.length; i++) {
            arr[i] = 0; //initial setting of all votes to zero
        }
        console.log(this.start.chain);
        //incrementing count at each block for candidate matching it
        for (let i = 1; i < this.start.chain.length; i++) {
            let j = parseInt(this.start.chain[i].data);
            arr[j]++;
        }
        let count = 0;
        let winner = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] > count) {
                winner = i;
                count = arr[i];
            }
        }
        //to check if there are more than one winner
        let winner_list = [];
        winner_list.push(this.candidates[winner]);
        for (let i = 0; i < arr.length; i++) {
            if (i !== winner && arr[i] === count) {
                winner_list.push(this.candidates[i]);
                count = arr[i];
            }
        }
        console.log(arr);
        return winner_list;
    }
}
module.exports = Election;
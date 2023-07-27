const Block = require('./block');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock(vote_option) {

        const lastBlock = this.chain[this.chain.length - 1]; //we need last block hash
        const block = Block.mineBlock(lastBlock, vote_option); //mines a new block
        console.log(block);
        this.chain.push(block);
        return block;

    }

    isValidChain(chain) {
        //if genesis of attacker chain is different ..directly getting that it is a duplicate chain
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        //corruption in the middle
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];

            if (block.lastHash !== lastBlock.hash || block.hash !== Block.blockHash(block)) {
                return false;
            }
        }
        return true;
    }

    replaceChain(newChain) {
        //first two cases detect a bad actor entering and we not allowing
        // console.log("compare");
        // console.log(newChain);
        // console.log("with");
        // console.log(this.chain);
        if (newChain.length <= this.chain.length) {
            console.log('Received chain is not longer than the current chain.');
            return;
        } else if (!this.isValidChain(newChain)) {
            console.log('Received chain is not valid.');
            return;
        }

        //detected good player ,now we can replace
        console.log('Replacing Blockchain with the new chain.');
        this.chain = newChain;
    }
}

module.exports = Blockchain;
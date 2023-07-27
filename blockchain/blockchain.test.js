const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () =>{
  let bc,bc2;
  //lets set bc which set to new instance of blockchain class before each instance
  beforeEach(()=> {
    bc = new Blockchain();
    bc2 = new Blockchain();
  });

  it('start with genesis block', () => {
    expect(bc.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block', () => {
    const data ='foo';
    bc.addBlock(data);
    expect(bc.chain[bc.chain.length-1].data).toEqual(data);
  });

  it('validates a valid chain',()=>{
    bc2.addBlock('foo');
    expect(bc.isValidChain(bc2.chain)).toBe(true);
  });

  it('invalidates with a corrupt genesis block',()=>{
    bc2.chain[0].data = 'Bad Data';
    expect(bc.isValidChain(bc2.chain)).toBe(false);
  });

// checks for a chain corrupted in between and not at genesis stage
  it('invalidates a corrupt chain',()=>{
    bc2.addBlock('foo');
    bc2.chain[1].data = 'Not Foo';  //chain 1 is this foo block only
    expect(bc.isValidChain(bc2.chain)).toBe(false);
  });

  it('replaces chain with valid chain',()=>{
    bc2.addBlock('goo');
    bc.replaceChain(bc2.chain);
    expect(bc.chain).toEqual(bc2.chain);
  });

  it('does not replace the chain with one of less than or equal to length',()=>{
    bc.addBlock('foo');
    bc.replaceChain(bc2.chain);
    expect(bc.chain).not.toEqual(bc2.chain);
  });

});

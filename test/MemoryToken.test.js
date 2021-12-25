const { assert } = require('chai');

const MemoryToken = artifacts.require('./MemoryToken.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Memory Token', (accounts) => {
  // code goes here...
  let token;

  before(async () => {
    token = await MemoryToken.deployed();
  })

  describe('deployment', async () => {
    it('deployment successfully', async () => {
      const address = token.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it('has name', async () => {
      const name = await token.name();
      assert.equal(name, 'An token');
    });

    it('has symbol', async () => {
      const symbol = await token.symbol();
      assert.equal(symbol, 'MEMORY');
    });
  })

  describe('toke distribution', async () => {
    let result;
    it('mint token', async () => {
      await token.mint(accounts[0], 'https://www.token-uri.com/nft');
      result = await token.totalSupply();
      assert.equal(result.toString(), '1', 'Total supply is correct');

      // test balance of
      let balanceOf = await token.balanceOf(accounts[0]);
      assert.equal(balanceOf.toString(), '1', 'balanceOf');

      // test owner token
      result = await token.ownerOf('1');
      assert.equal(result.toString(), accounts[0].toString(), 'Owner is correct')

      // test token ids
      let tokenIds = [];
      for(let i = 0; i < balanceOf; i++){
        let id = await token.tokenOfOwnerByIndex(accounts[0], i);
        tokenIds.push(id);
      }
      let expectedIds = ['1'];
      assert.equal(tokenIds.toString(), expectedIds.toString(), 'Token ids is correct');

      // test token uri
      let tokenURI = await token.tokenURI('1');
      assert.equal(tokenURI, 'https://www.token-uri.com/nft');
    });
  })
})

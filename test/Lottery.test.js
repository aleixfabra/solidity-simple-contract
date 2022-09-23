const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());
const { abi, evm } = require('../compile');

let accounts;
let ownerAccount;
let lotteryContact;
const enterValue = '.001';

beforeEach( async () => {
  accounts = await web3.eth.getAccounts();
  ownerAccount = accounts[0];

  lotteryContact = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object,
    })
    .send({ from: ownerAccount, gas: '1000000'});
});

describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lotteryContact.options.address);
  });

  it('allows one account to enter', async () => {
    await lotteryContact.methods.enter().send({
      from: ownerAccount,
      value: web3.utils.toWei(enterValue, 'ether'),
    });

    const players = await lotteryContact.methods.getPlayers().call({
      from: ownerAccount,
    });

    assert.equal(ownerAccount, players[0]);
    assert.equal(1, players.length);
  });

  it('allows multiple accounts to enter', async () => {
    await lotteryContact.methods.enter().send({
      from: ownerAccount,
      value: web3.utils.toWei(enterValue, 'ether'),
    });
    await lotteryContact.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei(enterValue, 'ether'),
    });
    await lotteryContact.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei(enterValue, 'ether'),
    });

    const players = await lotteryContact.methods.getPlayers().call({
      from: ownerAccount,
    });

    assert.equal(ownerAccount, players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('requires .001 ether to enter', async () => {
    try {
      await lotteryContact.methods.enter().send({
        from: ownerAccount,
        value: 0,
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('only owner can call pickWinner method', async () => {
    try {
      await lotteryContact.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('sends money to the winner and resets the players array', async () => {
    await lotteryContact.methods.enter().send({
      from: ownerAccount,
      value: web3.utils.toWei(enterValue, 'ether'),
    });

    const initialOwnerBalance = await web3.eth.getBalance(accounts[0]);
    await lotteryContact.methods.pickWinner().send({ from: accounts[0] });
    const finalOwnerBalance = await web3.eth.getBalance(accounts[0]);

    const players = await lotteryContact.methods.getPlayers().call({
      from: ownerAccount,
    });

    assert(finalOwnerBalance > initialOwnerBalance);
    assert.equal(0, players.length);
  });
});

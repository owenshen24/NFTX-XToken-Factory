const _XT = artifacts.require("./XTokenClonable.sol");
const _XTF = artifacts.require("./XTokenFactory.sol");
const truffleAssert = require('truffle-assertions');

let result, expected;

contract("XT tests", async accounts => {
  it ("handles permissions correctly", async() => {
    let XT = await _XT.deployed();
    let XTF = await _XTF.deployed(XT.address);

    // Make sure factory owner is caller
    result = await XTF.owner();
    expect(result).to.eql(accounts[0]);
    
    // Create 1 before changing owner
    await XTF.createXToken("ACoin", "A");
    // Change factory owner to accounts[1]
    await XTF.transferOwnership(accounts[1], {from: accounts[0]});
    // Create 1 afer changing owner to accounts[1]
    await XTF.createXToken("BCoin", "B");
    
    // Make sure factory owner updates
    result = await XTF.owner();
    expect(result).to.eql(accounts[1]);

    // Make sure no one else can call transferOwnership (owner now set to accounts[0])
    await truffleAssert.reverts(
      XTF.transferOwnership(accounts[1], {from: accounts[0]})
    );

    // Get all deployed addresses
    let logs = await XTF.getPastEvents('NewXToken', { fromBlock: 0, toBlock: 'latest' });

    // Make sure XTF registers the address as isCloned
    result = await XTF.isCloned(logs[0].args._xTokenAddress);
    expect(result).to.eql(true);

    // Make sure owner is accounts[0]
    let XT0 = await _XT.at(logs[0].args._xTokenAddress);
    result = await XT0.owner();
    expect(result).to.eql(accounts[0]);

    // Make sure decimals is 18
    result = await XT0.decimals();
    expect(result).to.eql(web3.utils.toBN(18));

    // Make sure name/symbol is being set correctly
    result = await XT0.name();
    expect(result).to.eql("ACoin");
    result = await XT0.symbol();
    expect(result).to.eql("A");

    // Make sure owner can mint (and balance updates)
    await XT0.mint(accounts[0], 1, {from: accounts[0]});
    result = await XT0.balanceOf(accounts[0]);
    expected = web3.utils.toBN(1);
    expect(result).to.eql(expected);

    // Make sure no one else can mint
    await truffleAssert.reverts(
      XT0.mint(accounts[1], 1, {from: accounts[1]})
    );

    // Make sure no one else can transferOwnership
    await truffleAssert.reverts(
      XT0.transferOwnership(accounts[1], {from: accounts[1]})
    );

    // Make sure name/symbol can be changed by owner--accounts[0]
    await XT0.changeName("ACoin2", {from: accounts[0]});
    await XT0.changeSymbol("A2", {from: accounts[0]});
    result = await XT0.name();
    expect(result).to.eql("ACoin2");
    result = await XT0.symbol();
    expect(result).to.eql("A2");

    // Expect revert when non-owner tries to change
    await truffleAssert.reverts(
      XT0.changeName("ACoin2", {from: accounts[1]})
    );
    await truffleAssert.reverts(
      XT0.changeSymbol("ACoin2", {from: accounts[1]})
    );

    // Make sure owner can transferOwnership
    await XT0.transferOwnership(accounts[1], {from: accounts[0]})
    result = await XT0.owner();
    expect(result).to.eql(accounts[1]);

    // Expect mint to fail now that owner has changed
    await truffleAssert.reverts(
      XT0.mint(accounts[0], 10, {from: accounts[0]})
    );



    // Second deployment
    // Expect second deployment is also cloned
    result = await XTF.isCloned(logs[1].args._xTokenAddress);
    expect(result).to.eql(true);

    // Make sure new owner is set after changing it in factory for second deployment
    let XT1 = await _XT.at(logs[1].args._xTokenAddress);
    result = await XT1.owner();
    expect(result).to.eql(accounts[1]);

    // Expect decimals to be correct
    result = await XT1.decimals();
    expect(result).to.eql(web3.utils.toBN(18));

    // Expect name/symbol to be correct
    result = await XT1.name();
    expect(result).to.eql("BCoin");
    result = await XT1.symbol();
    expect(result).to.eql("B");
  });
});
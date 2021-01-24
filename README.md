# NFTX-XToken-Factory

Uses [minimal proxy pattern](https://github.com/optionality/clone-factory/blob/master/contracts/CloneFactory.sol#L30) to cut down deployment costs of the XToken for [NFTX](https://nftx.org/).

Makes a few changes to the ERC-20 and Ownable contracts to make certain values initializable outside of the constructor.

Tests are to be run with Truffle.

require("@nomicfoundation/hardhat-toolbox");


const fs = require('fs');

// load mnemonic from .eth_keys
let mnemonic = fs.readFileSync(".eth_keys").toString().trim();

// command to start hardhat node:
// npx hardhat node

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  // hardhat
  networks: {
    hardhat: {

      // use mnemonic from .eth_keys
      accounts: {
        mnemonic: mnemonic
      }
    },
    localhost: {
      url: "http://localhost:8545",
      accounts: {
        mnemonic: mnemonic
      }
    }
  }

};

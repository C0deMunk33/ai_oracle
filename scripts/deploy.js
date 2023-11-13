const hre = require("hardhat");
/*
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
*/
async function main() {
  
  // get array of accounts
  const accounts = await hre.ethers.getSigners();
  const Oracle_Bot = await hre.ethers.getContractFactory("Oracle_Bot");
  const oracle_bot = await Oracle_Bot.deploy(accounts[0].address);

  const Callback_Example = await hre.ethers.getContractFactory("Callback_Example");
  const callback_example = await Callback_Example.deploy();
  
  
  
  console.log("Oracle_Bot deployed to:", oracle_bot.target);
  // save abi and address to json file
  const fs = require('fs');
  const contract = {
    address: oracle_bot.target,
    name: "Oracle_Bot"
  }
  fs.writeFileSync("./server/libs/Oracle_Bot.json", JSON.stringify(contract));
  fs.writeFileSync("./server/libs/oracle_bot_abi.json", JSON.stringify(oracle_bot.interface.fragments, null, 2));

  

  //save address to ./server/static/libs/oracle_bot_address.js
  fs.writeFileSync("./server/static/libs/oracle_bot_address.js", "const oracle_bot_address = " + JSON.stringify(oracle_bot.target) + ";");

  // save oracle_bot_abi to ./server/static/libs/oracle_bot_abi.js for use in the browser
  fs.writeFileSync("./server/static/libs/oracle_bot_abi.js", "const oracle_bot_abi = " + Oracle_Bot.interface.formatJson() + ";");
  
  // save callback_example abi to ./server/static/libs/callback_example_abi.js for use in the browser
  fs.writeFileSync("./server/static/libs/callback_example_abi.js", "const callback_example_abi = " + Callback_Example.interface.formatJson()+ ";");
  

  // save callback_example address to ./server/static/libs/callback_example_address.js
  fs.writeFileSync("./server/static/libs/callback_example_address.js", "const callback_example_address = " + JSON.stringify(callback_example.target) + ";");


  console.log("Callback_Example deployed to:", callback_example.target);
  // save abi and address to json file
  fs.writeFileSync("./server/libs/Callback_Example.json", callback_example.target);
  fs.writeFileSync("./server/libs/callback_example_abi.json", JSON.stringify(callback_example.interface.fragments, null, 2));

  // using the hardhat command, give 0x238AC80814a959A03d08a1e4A861E09Ea445bc56 100 ETH
  const signer = accounts[0];
  await signer.sendTransaction({
    to: "0x238AC80814a959A03d08a1e4A861E09Ea445bc56",
    value: "100000000000000000000"
  });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

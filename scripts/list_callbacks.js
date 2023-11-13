const hre = require("hardhat");


const { randomBytes } = require("crypto");

const fs = require('fs');

async function main() {

    // get array of accounts
    const accounts = await hre.ethers.getSigners();
    

    const Callback_Example = await hre.ethers.getContractFactory("Callback_Example");
    const callback_address = fs.readFileSync("./server/libs/Callback_Example.json", 'utf8');
    const callback_example = await Callback_Example.attach(callback_address);

    // get Callback_Complete events from callback_example
    let events = await callback_example.queryFilter(
        callback_example.filters.Callback_Complete(null), 0, "latest")
        
    for (let i = 0; i < events.length; i++) {
        console.log("Callback_Complete event: " + JSON.stringify(events[i].args))
    }

    let callback_2_events = await callback_example.queryFilter(
        callback_example.filters.Callback_2_Complete(null,null), 0, "latest")

    for (let i = 0; i < callback_2_events.length; i++) {
        console.log(callback_2_events[i].args[0].toString() + " " + callback_2_events[i].args[1].toString())
    }

    // call callback_example.get_result(0)
    let result = await callback_example.get_result(0)
    console.log("result: " + result)

}

// run main
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
    })
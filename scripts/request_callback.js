const hre = require("hardhat");


const { randomBytes } = require("crypto");


// launch ipfs daemon command: ipfs daemon
// ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
// ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
    

async function upload_to_ipfs(doc_to_store, ipfs_url) {
    // expected url is like http://localhost:5001
    const blob = new Blob([doc_to_store], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob);
    const response = await fetch(ipfs_url + '/api/v0/add', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    const cid = result.Hash;

    // pin the cid
    const response_pin = await fetch(ipfs_url + '/api/v0/pin/add?arg=' + cid, {
        method: 'POST'
    });

    return cid;
}

const ipfs_url = "http://localhost:5001"

async function main() {
    // get array of accounts
    const accounts = await hre.ethers.getSigners();
    const Oracle_Bot = await hre.ethers.getContractFactory("Oracle_Bot");
    
    // load ./server/libs/Oracle_Bot.json
    const fs = require('fs');
    const ob_info = JSON.parse(fs.readFileSync("./server/libs/Oracle_Bot.json", 'utf8'));
    const oracle_bot = await Oracle_Bot.attach(ob_info.address);    
   
    const Callback_Example = await hre.ethers.getContractFactory("Callback_Example");
    const callback_address = fs.readFileSync("./server/libs/Callback_Example.json", 'utf8');


    let doc_to_store = "what is the airspeed velocity of an unladen swallow?\n\n"

    let callback_signature = "test_callback_two_uints(uint256,uint256)"
    let callback_param_names = "speed_in_meters,speed_in_mph"


    console.log("doc_to_store: " + JSON.stringify(doc_to_store))

    const new_cid = await upload_to_ipfs(doc_to_store, ipfs_url)
    console.log("new_cid: " + new_cid)
    // request_document to oracle_bot
    console.log("Storing document to oracle_bot...")
    
    let current_block = 0
    let receipt = await oracle_bot.request_callback(
        new_cid, 
        callback_address, 
        callback_signature, 
        callback_param_names)

    let new_block = await hre.ethers.provider.getBlockNumber()

    
    // get the Document_Requested(uint32 document_idx) events from recent blocks
    let events = await oracle_bot.queryFilter("Callback_Requested", current_block, new_block)
    
    console.log(events[0].args.document_idx.toString())

    // get_content_cid(uint32 document_idx) returns (string memory)
    let content_cid = await oracle_bot.get_content_cid(events[0].args.document_idx.toString())
    console.log("content_cid: " + content_cid)
    
    console.log("callback_address: " + callback_address)
    console.log("callback_signature: " + callback_signature)
    console.log("callback_param_names: " + callback_param_names)

    oracle_bot.request_callback(content_cid,
        callback_address,
        callback_signature,
        callback_param_names)
    
    // exit program
    process.exit(0)
}

// run main
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})
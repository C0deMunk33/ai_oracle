// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// import oz ownable
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IPFS.sol";

contract Oracle_Bot is Ownable, IPFS {

    address bot_address;

    constructor(address _bot_address) {
        bot_address = _bot_address;
    }
     
    function set_bot_address(address _bot_address) public onlyOwner {
        bot_address = _bot_address;
    }

    struct Callback_Request {
        address callback_address;
        string callback_signature;
        string param_names;
    }

    // document_idx => request
    mapping(uint256 => Callback_Request) public callback_requests;
    function get_callback_request(uint256 idx) public view returns (address, string memory, string memory) {
        return (callback_requests[idx].callback_address, callback_requests[idx].callback_signature, callback_requests[idx].param_names);
    }

    // document_idx => response
    mapping(uint256 => string) public document_responses;
    function get_document_response(uint256 idx) public view returns (string memory) {
        return document_responses[idx];
    }

    event Document_Requested(uint256 indexed document_idx, address indexed requester);
    event Document_Fulfilled(uint256 indexed document_idx);
    event Document_Rejected(uint256 indexed document_idx);

    event Callback_Requested(uint256 indexed document_idx, address indexed requester);
    event Callback_Fulfilled(uint256 indexed document_idx);
    event Callback_Rejected(uint256 indexed document_idx);

    function request_callback(
        string memory cid, 
        address callback_address, 
        string memory callback_signature, // like "some_callback(bytes32,address,uint256)"
        string memory param_names // like "param1,param2,param3"
        ) public {
        
        uint256 content_id = storeContentID(cid);
        require(callback_requests[content_id].callback_address == address(0), "request already exists");
        //TODO: place fee here (or don't)
        require(callback_address != address(0), "invalid callback address");
        require(bytes(callback_signature).length >= 3, "invalid callback signature");

        callback_requests[content_id] = Callback_Request({
            callback_address: callback_address,
            callback_signature: callback_signature,
            param_names: param_names
        });

        emit Callback_Requested(content_id, msg.sender);
        
    }

    function request_document(string memory cid) public {
        uint256 content_id = storeContentID(cid);
        require(callback_requests[content_id].callback_address == address(0), "request already exists");
        //TODO: place fee here (or don't)
        emit Document_Requested(content_id, msg.sender);
    }

    bytes32 public current_request;
    function fulfill_callback(uint256 request_id, bytes calldata data) public only_bot {
        // protect against re-entrancy
        require(current_request == 0x00, "request in progress");

        (bool success, ) = callback_requests[request_id].callback_address.call(
            abi.encodePacked(bytes4(keccak256(bytes(callback_requests[request_id].callback_signature))), data)
        );

        require(success, "callback failed");

        emit Callback_Fulfilled(request_id);

        delete callback_requests[request_id];
        current_request = 0x00;  
    }

    function fulfill_document(uint256 request_idx, string memory response_ipfs_hash) public only_bot {
        // require that document_responses[request_idx] is empty
        require(bytes(document_responses[request_idx]).length == 0, "request already fulfilled");

        document_responses[request_idx] = response_ipfs_hash;

        emit Document_Fulfilled(request_idx);
    }

    function reject_document(uint256 request_idx) public only_bot {
        require(bytes(document_responses[request_idx]).length == 0, "request already fulfilled");

        document_responses[request_idx] ="rejected";

        emit Document_Rejected(request_idx);
    }

    function reject_callback(uint256 request_id) public only_bot {
        require(callback_requests[request_id].callback_address != address(0), "request already fulfilled");

        delete callback_requests[request_id];

        emit Callback_Rejected(request_id);
    }

    // only_bot modifier
    modifier only_bot() {
        require(msg.sender == bot_address, "only bot");
        _;
    }    

}
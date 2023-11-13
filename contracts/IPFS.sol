// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./Base58.sol";

contract IPFS is Base58 {
    
    uint256 public last_content_idx = 1;
    mapping(uint256 => bytes) content;
    mapping(bytes32 => uint256) content_hash_to_idx;

    function storeContentID(string memory cid) public returns (uint256) {
        
        // convert the string to bytes
        bytes memory cid_bytes = bytes(cid);
        
        // ensure cid length is v1 or v0 CID
        require(cid_bytes.length == 59 || cid_bytes.length == 46, "invalid cid length");

        content[last_content_idx] = cid_bytes;

        content_hash_to_idx[keccak256(cid_bytes)] = last_content_idx;
        last_content_idx += 1;

        return last_content_idx - 1;
    }

    function get_content_cid(uint256 content_idx) public view returns (string memory) {
        // convert the bytes to a string to return
        return string(content[content_idx]);
    }

    function get_content_idx_by_cid(string memory cid) public view returns (uint256) {
        // convert the bytes to a string to return
        return content_hash_to_idx[keccak256(bytes(cid))];
    }


}
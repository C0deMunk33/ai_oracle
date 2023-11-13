// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;



contract Callback_Example {
    event Callback_Complete(string result);
    event Callback_2_Complete(uint256 result1, uint256 result2);
    function test_callback_string (string calldata result) public {
        // do something with result
        emit Callback_Complete(result);
    }

    struct Result {
        uint256 result1;
        uint256 result2;
    }
    mapping(uint256 => Result) public result_map;
    uint256 result_idx = 0;
    function test_callback_two_uints(uint256 speed_in_meters, uint256 speed_in_mph) public {

        result_map[result_idx] = Result({
            result1: speed_in_meters,
            result2: speed_in_mph
        });
        // do something with result1 and result2
        emit Callback_2_Complete(speed_in_meters, speed_in_mph);
    }

    function get_result(uint256 idx) public view returns (uint256, uint256) {
        return (result_map[idx].result1, result_map[idx].result2);
    }
}

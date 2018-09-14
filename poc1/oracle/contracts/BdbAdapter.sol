pragma solidity ^0.4.24;

import "oraclize-api/usingOraclize.sol";

contract BdbAdapter is usingOraclize {
    address public owner;

    struct pendingOperation {
        address receiver;
        uint256 amount;
    }

    // modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Access Denied.");
        _;
    }

    // operations pending
    mapping(bytes32 => pendingOperation) pendingOperations;

    // bigchaindb node url
    string public apiUrl = "https://test.bigchaindb.com";
    string public locationAddress = "109006 Burgos";

    // bigchaindb API query components
    string constant public apiStart = "json(";
    string constant public apiAssetEndpoint = "/api/v1/transactions/";
    string constant public apiAssetClose = ").asset.data.address";

    // events
    event newOutputResult(string outputResult);
    event queryParametersChanged(string apiUrl, string locationAddress);
    event addressMatch(string location, string expected);
    event addressMismatch(string location, string expected);

    constructor(string _apiUrlValue, string _locationAddress) public {
        // set _owner
        owner = msg.sender;

        // set query params
        apiUrl = _apiUrlValue;
        locationAddress = _locationAddress;
    }

    // changes the url for BigchainDB node
    // in case there is a need for querying another node
    // owner only
    function changeQueryParameters(string _apiUrlValue, string _locationAddress) public onlyOwner {
        // set new BigchainDB node url
        apiUrl = _apiUrlValue;
        locationAddress = _locationAddress;
        emit queryParametersChanged(_apiUrlValue, _locationAddress);
    }

    // Send payment
    function sendPayment(string _bigchaindbTxId, address _receiver, uint256 _amount) public payable {
        // check msg.amount (needs to include payment + oracle gas)
        // needs to be optimized for gas
        require(_amount < msg.value, "Not enough amount.");
        getAsset(_bigchaindbTxId, _receiver, _amount);
    }

    // Query from outputs - internal
    function getAsset(string _bigchaindbTxId, address _receiver, uint256 _amount) internal {
        string memory query = strConcat(apiStart, apiUrl, apiAssetEndpoint, _bigchaindbTxId, apiAssetClose);
        bytes32 id = oraclize_query("URL", query);
        pendingOperations[id] = pendingOperation(_receiver, _amount);
    }

    // Result from oraclize
    function __callback(bytes32 id, string stringResult) public {
        require(msg.sender == oraclize_cbAddress(), "Access Denied.");
        require(pendingOperations[id].amount > 0, "Not enough amount.");
        emit newOutputResult(stringResult);
        
        address receiver = pendingOperations[id].receiver;
        uint256 amount = pendingOperations[id].amount;

        if(keccak256(locationAddress) == keccak256(stringResult)){
            emit addressMatch(locationAddress, stringResult);
            receiver.transfer(amount);
        } else {
            emit addressMismatch(locationAddress, stringResult);
        }

        delete pendingOperations[id];
    }
}
pragma solidity ^0.4.24;

import "oraclize-api/usingOraclize.sol";

contract BdbAdapter is usingOraclize {
    address public owner;
    uint256 public minCount;

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
    string public apiUrl = "http://eth-bdb.westeurope.cloudapp.azure.com/query";

    // bigchaindb API query components
    string constant public apiStart = "json(";
    string constant public apiClose = ")";
    string constant public parameterFrom = "?fromTime=";
    string constant public parameterTo = "?toTime=";
    string constant public apiAssetEndpoint = "/api/v1/transactions/";
    string constant public apiAssetClose = ").asset.data";

    // events
    event newAssetQuery(string assetQuery);
    event newAssetResult(string assetResult);
    event newOutputQuery(string outputQuery);
    event newOutputResult(uint256 outputResult);
    event nodeUrlChanged(string apiUrl);

    constructor(string apiUrlValue, uint256 minCountValid) public {
        // set _owner
        owner = msg.sender;
        minCount = minCountValid;
        // set BigchainDB node url
        apiUrl = apiUrlValue;
    }

    // changes the url for BigchainDB node
    // in case there is a need for querying another node
    // owner only
    function changeApiUrl(string apiUrlValue) public onlyOwner {
        // set new BigchainDB node url
        apiUrl = apiUrlValue;
        emit nodeUrlChanged(apiUrlValue);
    }

    // Send payment
    function sendPayment(string _bigchaindbOwner, address _receiver, uint256 _amount, string DateFrom, string DateTo) public payable {
        // check msg.amount (needs to include payment + oracle gas)
        require(_amount < msg.value, "Not enough amount.");

        // TODO: calculate gas and check if amount + gas > msg.value
        outputs(_bigchaindbOwner, _receiver, _amount, DateFrom, DateTo);
    }

    // Query 
    function outputs(string _bigchaindbOwner, address _receiver, uint256 _amount, string DateFrom, string DateTo) internal {
        string memory query1 = strConcat(apiStart, apiUrl, parameterFrom, DateFrom, parameterTo);
        string memory  query = strConcat(query1, DateTo, _bigchaindbOwner, apiClose);
        emit newAssetQuery(query);
        bytes32 id = oraclize_query("URL", query);
        pendingOperations[id] = pendingOperation(_receiver, _amount);
    }

    // Result from oraclize
    function __callback(bytes32 id, uint256 result) public {
        // TODO: put checks for gas

        require(msg.sender == oraclize_cbAddress(), "Access Denied.");
        require(pendingOperations[id].amount > 0, "Not enough amount.");
        require(result > minCount, "The events found in BigchainDB are not enough");

        address receiver = pendingOperations[id].receiver;
        uint256 amount = pendingOperations[id].amount;
        receiver.transfer(amount);

        emit newOutputResult(result);
        delete pendingOperations[id];
    }
}
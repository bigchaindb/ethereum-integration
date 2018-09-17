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
    string public apiUrl = "http://eth-bdb.westeurope.cloudapp.azure.com:4000/query";

    // bigchaindb API query components
    string constant public apiStart = "json(";
    string constant public apiQueryClose = ").data[0].count";
    string constant public apiPostBody = "{'count': 'true'}";

    // events
    event NewAssetQuery(string assetQuery);
    event NewAssetResult(string assetResult);
    event NewOutputQuery(string outputQuery);
    event NewOutputResult(uint256 outputResult);
    event NodeUrlChanged(string apiUrl);
    event TransferredToReceiver(address receiver, uint256 amount);

    constructor(string apiUrlValue, uint256 minCountValid) public {
        // set _owner
        owner = msg.sender;
        minCount = minCountValid;
        // set BigchainDB node url
        apiUrl = apiUrlValue;
     OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
    }

    // changes the url for BigchainDB node
    // in case there is a need for querying another node
    // owner only
    function changeApiUrl(string apiUrlValue) public onlyOwner {
        // set new BigchainDB node url
        apiUrl = apiUrlValue;
        emit NodeUrlChanged(apiUrlValue);
    }

    // Send payment
    function sendPayment(string _bigchaindbOwner, address _receiver, uint256 _amount, string DateFrom, string DateTo) public payable {
        // check msg.amount (needs to include payment + oracle gas)
        //calculate gas and check if amount + gas > msg.value
        require(_amount + oraclize_getPrice("URL") < msg.value, "Not enough amount.");

        outputs(_bigchaindbOwner, _receiver, _amount, DateFrom, DateTo);
    }

    // Query 
    function outputs(string _bigchaindbOwner, address _receiver, uint256 _amount, string DateFrom, string DateTo) internal {
        string memory query = strConcat(apiStart, apiUrl, apiQueryClose);
        emit NewAssetQuery(query);
        bytes32 id = oraclize_query("URL", query, '{"count": "true"}');
        pendingOperations[id] = pendingOperation(_receiver, _amount);
    }

    // Result from oraclize
    function __callback(bytes32 id, uint256 result) public {
   
        emit NewOutputResult(result);
        require(msg.sender == oraclize_cbAddress(), "Access Denied.");
        require(pendingOperations[id].amount > 0, "Not enough amount.");
        require(result > minCount, "The events found in BigchainDB are not enough");

        address receiver = pendingOperations[id].receiver;
        uint256 amount = pendingOperations[id].amount;
        receiver.transfer(amount);

        emit TransferredToReceiver(receiver, amount);
        delete pendingOperations[id];
    }
}
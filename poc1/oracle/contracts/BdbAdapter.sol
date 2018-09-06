pragma solidity ^0.4.24;

import "oraclize-api/usingOraclize.sol";

contract BdbAdapter is usingOraclize {
    address public owner;
    enum stageType {outputs, asset}

    struct pendingOperation {
        stageType stage;
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

    // bigchaindb API query components
    string constant public apiStart = "json(";
    string constant public apiOutputsEndpoint = "/api/v1/outputs?spent=false&public_key=";
    string constant public apiOutputsClose = ").0.transaction_id";
    string constant public apiAssetEndpoint = "/api/v1/transactions/";
    string constant public apiAssetClose = ").asset.data";

    // events
    event newAssetQuery(string assetQuery);
    event newAssetResult(string assetResult);
    event newOutputQuery(string outputQuery);
    event newOutputResult(string outputResult);
    event nodeUrlChanged(string apiUrl);

    constructor(string apiUrlValue) public {
        // set _owner
        owner = msg.sender;

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
    function sendPayment(string _bigchaindbOwner, address _receiver, uint256 _amount) public payable {
        // check msg.amount (needs to include payment + oracle gas)
        require(_amount < msg.value, "Not enough amount.");
        outputs(_bigchaindbOwner, _receiver, _amount);
    }

    // Query from outputs - internal
    function outputs(string _bigchaindbOwner, address _receiver, uint256 _amount) internal {
        string memory query = strConcat(apiStart, apiUrl, apiOutputsEndpoint, _bigchaindbOwner, apiOutputsClose);
        emit newAssetQuery(query);
        bytes32 id = oraclize_query("URL", query);
        pendingOperations[id] = pendingOperation(stageType.outputs, _receiver, _amount);
    }

    // Query from asset - internal
    function asset(string _bdbAssetId, address _receiver, uint256 _amount) internal {
        string memory query = strConcat(apiStart, apiUrl, apiAssetEndpoint, _bdbAssetId, apiAssetClose);
        emit newOutputQuery(query);
        bytes32 id = oraclize_query("URL", query);
        pendingOperations[id] = pendingOperation(stageType.asset, _receiver, _amount);
    }

    // Result from oraclize
    function __callback(bytes32 id, string result) public {
        require(msg.sender == oraclize_cbAddress(), "Access Denied.");
        require(pendingOperations[id].amount > 0, "Not enough amount.");

        stageType stage = pendingOperations[id].stage;
        address receiver = pendingOperations[id].receiver;
        uint256 amount = pendingOperations[id].amount;

        if(stage == stageType.outputs){
            emit newOutputResult(result);
            asset(result, receiver, amount);
        } else if(stage == stageType.asset){
            emit newAssetResult(result);
            receiver.transfer(amount);
        }

        delete pendingOperations[id];
    }
}
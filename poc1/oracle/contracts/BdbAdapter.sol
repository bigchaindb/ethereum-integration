pragma solidity ^0.4.24;

import "oraclize-api/usingOraclize.sol";

contract BdbAdapter is usingOraclize {
    address public owner;
    enum stageType {outputs, asset}

    struct pendingOperation {
        stageType stage;
        address receiver;
        uint256 amount;
        bool latitude; // If true latitude, if false longitud
        uint256 value;
        bytes32 otherQuery;
        bool latOkay;
        bool longOkay;
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
    string constant public apiOutputsClose = ").0.output_index";
    string constant public apiAssetEndpoint = "/api/v1/transactions/";
    string constant public apiAssetClose = ").asset.data";
    string constant public assetLongitude = ".longitude";
    string constant public assetLatitude = ".latitude";

    // events
    event newAssetQuery(string assetQuery);
    event newAssetResult(uint256 assetResult);
    event newOutputQuery(string outputQuery);
    event newOutputResult(uint256 outputResult);
    event nodeUrlChanged(string apiUrl);
    event queryPrice(uint256 num);

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
    function sendPayment(string _bigchaindbOwner, address _receiver, uint256 _amount, uint256 latitude, uint256 longitude) public payable {
        // check msg.amount (needs to include payment + oracle gas)
        require(_amount < msg.value, "Not enough amount.");
        outputs(_bigchaindbOwner, _receiver, _amount, latitude, longitude);
    }

    // Query from outputs - internal
    function outputs(string _bigchaindbOwner, address _receiver, uint256 _amount, uint256 latitude, uint256 longitude) internal {
        string memory query = strConcat(apiStart, apiUrl, apiAssetEndpoint, _bigchaindbOwner, apiAssetClose);
        string memory queryLatitude = strConcat(query, assetLatitude);
        string memory queryLongitude = strConcat(query, assetLongitude);
        emit newAssetQuery(queryLatitude);
        emit queryPrice(oraclize_getPrice("URL"));
        bytes32 idLat = oraclize_query("URL", queryLatitude);
        bytes32 idLong = oraclize_query("URL", queryLongitude);
        pendingOperations[idLat] = pendingOperation(stageType.asset, _receiver, _amount, true, latitude, idLong, false, false);
        pendingOperations[idLong] = pendingOperation(stageType.asset, _receiver, _amount, false, longitude, idLat, false, false);
    }

    // Query from asset - internal
    function asset(string _bdbAssetId, address _receiver, uint256 _amount, uint256 latitude, uint256 longitude) internal {
        string memory query = strConcat(apiStart, apiUrl, apiAssetEndpoint, _bdbAssetId, apiAssetClose);
        emit newOutputQuery(query);
        bytes32 id = oraclize_query("URL", query);
        //pendingOperations[id] = pendingOperation(stageType.asset, _receiver, _amount, true, longitude, false, false);
    }

    // Result from oraclize
    function __callback(bytes32 id, string stringResult) public {
        uint256 result = stringToUint(stringResult);

        require(msg.sender == oraclize_cbAddress(), "Access Denied.");
        require(pendingOperations[id].amount > 0, "Not enough amount.");
        emit newOutputResult(result);
        
        stageType stage = pendingOperations[id].stage;
        address receiver = pendingOperations[id].receiver;
        uint256 amount = pendingOperations[id].amount;

        if(stage == stageType.outputs){
            emit newOutputResult(result);
            //asset("", receiver, amount, pendingOperations[id].latitude, pendingOperations[id].longitude);

        } else if(stage == stageType.asset){

            //If latitude
            if(pendingOperations[id].latitude){
                if(pendingOperations[id].value + 5 > result && pendingOperations[id].value -5 < result){
                    pendingOperations[id].latOkay = true;
                    pendingOperations[pendingOperations[id].otherQuery].latOkay = true;
                }

            }else{ // If longitude
                if(pendingOperations[id].value + 5 > result && pendingOperations[id].value -5 < result){
                    pendingOperations[id].longOkay = true;
                    pendingOperations[pendingOperations[id].otherQuery].longOkay = true;
                }
            }
            // If lat and long are okay, release payment
            if(pendingOperations[id].latOkay && pendingOperations[id].longOkay){
                receiver.transfer(amount);
            }
        }

        delete pendingOperations[id];
    }

    function stringToUint(string s) constant returns (uint result) {
        bytes memory b = bytes(s);
        uint i;
        result = 0;
        for (i = 0; i < b.length; i++) {
            uint c = uint(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
    }
}
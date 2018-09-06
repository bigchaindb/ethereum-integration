pragma solidity ^0.4.23;

import "oraclize-api/usingOraclize.sol";

contract BdbAdapter is usingOraclize {

  enum stageType {outputs, asset}
  struct pendingOperation {
      stageType stage;
      address receiver;
      uint256 amount;
  }
  mapping(bytes32 => pendingOperation) pendingOperations;

  string public apiUrl = "https://test.bigchaindb.com";

  string public apiStart = "json(";
  string public apiOutputsEndpoint = "/api/v1/outputs?spent=false&public_key=";
  string public apiOutputsClose = ").0.transaction_id";
  string public apiAssetEndpoint = "/api/v1/transactions/";
  string public apiAssetClose = ").asset.data";

  event newAssetQuery(string assetQuery);
  event newAssetResult(string assetResult);
  event newOutputQuery(string outputQuery);
  event newOutputResult(string outputResult);

  // Receive payment
  function sendPayment(string _bigchaindbOwner, address _receiver, uint256 _amount) payable public {
    require(_amount < msg.value); // check msg.amount (needs to include payment + oracle gas)
    outputs(_bigchaindbOwner, _receiver, _amount);
  }

  // Query from outputs
  function outputs(string _bigchaindbOwner, address _receiver, uint256 _amount) internal {
      string memory query = strConcat(apiStart, apiUrl, apiOutputsEndpoint, _bigchaindbOwner, apiOutputsClose);
      newAssetQuery(query);
      bytes32 id = oraclize_query("URL", query);
      pendingOperations[id] = pendingOperation(stageType.outputs, _receiver, _amount);
  }

  // Query from asset
  function asset(string _bdbAssetId, address _receiver, uint256 _amount) internal {
      string memory query = strConcat(apiStart, apiUrl, apiAssetEndpoint, _bdbAssetId, apiAssetClose);
      newOutputQuery(query);
      bytes32 id = oraclize_query("URL", query);
      pendingOperations[id] = pendingOperation(stageType.asset, _receiver, _amount);
  }

  // Result from oraclize
  function __callback(bytes32 id, string result) public {
      require(msg.sender == oraclize_cbAddress());
      require(pendingOperations[id].amount > 0);

      stageType stage = pendingOperations[id].stage;
      address receiver = pendingOperations[id].receiver;
      uint256 amount = pendingOperations[id].amount;

      if(stage == stageType.outputs){
          newOutputResult(result);
          asset(result, receiver, amount);
      }else if(stage == stageType.asset){
          newAssetResult(result);
          receiver.transfer(amount);
      }

      delete pendingOperations[id];
  }
}
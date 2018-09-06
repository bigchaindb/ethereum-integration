pragma solidity ^0.4.23;

import "oraclize-api/usingOraclize.sol";

contract BdbAdapter is usingOraclize {

  enum stageType {outputs, asset}
  struct pendingOperation {
      stageType stage;
      uint256 amount;
      address receiver;
  }
  mapping(bytes32 => pendingOperation) pendingOperations;

  string public apiOutputsStart = "json(https://test.bigchaindb.com/api/v1/outputs?spent=false&public_key=";
  string public apiOutputsClose = ")[0].transaction_id";
  string public apiAssetStart = "json(https://test.bigchaindb.com/api/v1/transactions/";
  string public apiAssetClose = ").asset.data";

  // Receive payment
  function sendPayment(address _receiver, string _publicKey) payable public { // rename _publicKey to bigchaindbOwner - add amount to transfer
    outputs(_publicKey, _receiver, msg.value);
  }

  // Query from outputs
  function outputs(string _publicKey, address _receiver, uint256 _amount) internal {
      string memory query = strConcat(apiOutputsStart, _publicKey, apiOutputsClose);
      bytes32 id = oraclize_query("URL", query);
      pendingOperations[id] = pendingOperation(stageType.outputs, _amount, _receiver);
  }

  // Query from asset
  function asset(string _txId, address _receiver, uint256 _amount) internal {
      string memory query = strConcat(apiAssetStart, _txId, apiAssetClose);
      bytes32 id = oraclize_query("URL", query);
      pendingOperations[id] = pendingOperation(stageType.asset, _amount, _receiver);
  }

  // Result from oraclize
  function __callback(bytes32 id, string result) public {
      require(msg.sender == oraclize_cbAddress());
      require(pendingOperations[id].amount > 0);

      address receiver = pendingOperations[id].receiver;
      uint256 amount = pendingOperations[id].amount;
      stageType stage = pendingOperations[id].stage;

      if(stage == stageType.outputs){
          asset(result, receiver, amount);
      }else if(stage == stageType.asset){
          receiver.transfer(amount);
      }

      delete pendingOperations[id];
  }
}
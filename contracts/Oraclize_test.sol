pragma solidity ^0.4.18;
import "contracts/oraclizeAPI_0.5.sol";

contract ExampleContract is usingOraclize {

   string public ETHUSD;
   event LogConstructorInitiated(string nextStep);
   event LogPriceUpdated(string price);
   event LogNewOraclizeQuery(string description);

   function Constructor() payable {
       LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");
   }

   function __callback(bytes32 myid, string result) {
       if (msg.sender != oraclize_cbAddress()) revert();
       ETHUSD = result;
       LogPriceUpdated(result);
   }

   function updatePrice() payable {
       if (oraclize_getPrice("URL") > this.balance) {
           LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
       } else {
           LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
           oraclize_query("URL", "json(https://api.gdax.com/products/ETH-USD/ticker).price");
       }
   }
}


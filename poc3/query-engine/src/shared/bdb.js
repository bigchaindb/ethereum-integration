const driver = require('bigchaindb-driver')
const bip39 = require('bip39')

const config = require("dotenv").config();

module.exports = {

  // gets a Ed25519Keypair from a pass phrase. Using passphrase as seed creates same keypair everytime.
  // https://docs.bigchaindb.com/projects/js-driver/en/latest/usage.html#ed25519keypair-seed-functionality
  getKeypairFromSeed: function(seed) {
      return new driver.Ed25519Keypair(bip39.mnemonicToSeed(seed).slice(0, 32))
  },

  // gets a transaction based on id
  getTransaction: async function(txId) {
      try {
          // initialize connection
          await this._getConnection()
          // get transaction and return it
          const tx = await this.conn.getTransaction(txId)
          return tx
      } catch (err) {
          return null
      }
  },

  // Creates a new asset in BigchainDB
  // https://docs.bigchaindb.com/projects/js-driver/en/latest/usage.html#asset-creation
  createNewAsset: async function(keypair, toPublicKey, asset, metadata) {
      // initialize connection
      await this._getConnection()

      // construct crypto condition out of publicKey
      const condition = driver.Transaction.makeEd25519Condition(toPublicKey, true)

      // construct output
      const output = driver.Transaction.makeOutput(condition)
      output.public_keys = [toPublicKey]

      // construct transaction with all data
      const transaction = driver.Transaction.makeCreateTransaction(
          asset,
          metadata,
          [output],
          keypair.publicKey
      )

      // sign and hash transaction
      const txSigned = driver.Transaction.signTransaction(transaction, keypair.privateKey)

      // send transaction in commit mode, return it when commited to BDB
      return await this.conn.postTransactionCommit(txSigned)
          .then(retrievedTx => {
              return retrievedTx
          })
          .catch(err => {
              return false
          });
  },

  // Transfers a BigchainDB asset from an input transaction to a new public key
  transferAsset: async function(tx, fromKeyPair, toPublicKey, metadata) {
      await this._getConnection()

      const txTransfer = driver.Transaction.makeTransferTransaction(
          [{ tx: tx, output_index: 0 }],
          [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(toPublicKey))],
          metadata
      );

      const txSigned = driver.Transaction.signTransaction(txTransfer, fromKeyPair.privateKey)
      let trTx
      await this.conn.postTransactionCommit(txSigned)
          .then(retrievedTx => {
              trTx = retrievedTx
          })

      return trTx
  },

  // initializes a connection to BDB server if not already initialized
  // https://docs.bigchaindb.com/projects/js-driver/en/latest/usage.html#create-connection-with-bigchaindb
  _getConnection: function() {
      // check if connection object exist
      if (!this.conn) {
          // init new connection object
          this.conn = new driver.Connection("http://"+config.parsed.HOST_BIGCHAINDB+":9984/api/v1/")
      }
  }

};

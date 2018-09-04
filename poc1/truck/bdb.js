const driver = require('bigchaindb-driver')
const bip39 = require('bip39')
const env = require('./env').default
const API_PATH = env.bdb.url;

export const sendLocation = (location) => {
    // Construct a transaction payload
    const tx = driver.Transaction.makeCreateTransaction(
        location,
        { lastModifiedOn: Date()},
        [ driver.Transaction.makeOutput(
                driver.Transaction.makeEd25519Condition(env.bdb.pubKey))
        ],
        env.bdb.pubKey
    )

    // Sign the transaction with private keys
    const txSigned = driver.Transaction.signTransaction(tx, env.bdb.privKey)

    // Send the transaction off to BigchainDB
    const conn = new driver.Connection(API_PATH)

    conn.postTransactionCommit(txSigned)
        .then(retrievedTx => console.log('Truck successfully send its current location ('+ location.latitude +','
        + location.longitude +') to BigchainDB with tx id ', retrievedTx.id))
}

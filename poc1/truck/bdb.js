const driver = require('bigchaindb-driver')
const env = require('./env').default
const API_PATH = env.bdb.url;
const app_id = env.bdb.app_id;
const app_key = env.bdb.app_key;

export const sendLocation = (truck, location) => {
    let pubKey = env.bdb[truck + "PubKey"];
    let privKey = env.bdb[truck + "PrivKey"];
    // Construct a transaction payload
    const tx = driver.Transaction.makeCreateTransaction(
        location,
        { lastModifiedOn: Date()},
        [ driver.Transaction.makeOutput(
                driver.Transaction.makeEd25519Condition(pubKey))
        ],
        pubKey
    )

    // Sign the transaction with private keys
    const txSigned = driver.Transaction.signTransaction(tx,privKey)

    // Send the transaction off to BigchainDB
    const conn = new driver.Connection(API_PATH, {
        app_id: app_id,
        app_key: app_key
    });

    conn.postTransactionCommit(txSigned)
        .then(retrievedTx => console.log(truck + ' successfully send its current location ('+ location.latitude +','
        + location.longitude +') to BigchainDB with tx id ', retrievedTx.id))
}

const driver = require('bigchaindb-driver')
const 
const bdbConfig = require("../config/bigchaindb.config.json");


module.exports = function createKeypair(passphrase = 'example passphrase') {
    return new driver.Ed25519Keypair(bip39.mnemonicToSeed(passphrase).slice(0, 32))
}

const adminKeypair = createKeypair(bdbConfig)

module.exports = async function createNewDivisibleAsset(keypair = adminKeypair, asset, amount = '900719925474090') {
    _getConnection()
    const txCreateDivisible = driver.Transaction.makeCreateTransaction(
        asset, {
            metaDataMessage: 'new token minted'
        }, [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(keypair.publicKey), amount)],
        keypair.publicKey
    )
    const txSigned = driver.Transaction.signTransaction(txCreateDivisible, keypair.privateKey)
    let tx
    await conn.postTransactionCommit(txSigned)
        .then((res) => {
            tx = res
        })

    return tx
};

// Transfer divisible asset

module.exports = async function transferTokens(fromKeyPair = adminKeypair, assetId, amount, toPublicKey, meta = {
    meta: new Date()
}) {


    const toPublicKeysAmounts = [{
        publicKey: toPublicKey,
        amount
    }]
    // initialize connection
    _getConnection()

    const metadata = {
        event: 'Dewa Transfer',
        date: new Date(),
        timestamp: Date.now()
    }
    // get all transactions (create and transfer) of asset
    // we are transfering in one call
    const transactions = await conn.listTransactions(assetId)
    // map transactions to object so we can find it easily
    const mappedTxIds = {}
    for (const tx of transactions) {
        console.log('tx.id', tx.id)
        mappedTxIds[tx.id] = tx
    }
    // get unspent outputs fromKeyPair that we can transfer
    // https://docs.bigchaindb.com/projects/js-driver/en/latest/usage.html#difference-unspent-and-spent-output
    const unspents = await conn.listOutputs(fromKeyPair.publicKey, false)
    // generate list of outputs that can be used
    const unspentOutputs = []
    // loop over all unspent outputs of publicKey
    for (const unspent of unspents) {
        // check if unspent output is part of asset we are transfering
        if (unspent.transaction_id in mappedTxIds) {
            // push to list of outputs with all needed data
            unspentOutputs.push({
                transaction_id: unspent.transaction_id,
                output_index: unspent.output_index,
                amount: parseInt(mappedTxIds[unspent.transaction_id].outputs[unspent.output_index].amount),
                tx: mappedTxIds[unspent.transaction_id]
            })
        }
    }
    // sort list to have smaller amounts processed first to reduce
    // breaking of asset to smaller and smaller chunks
    unspentOutputs.sort(function (a, b) {
        return a.amount - b.amount;
    })

    // generate new outputs with total amount spent in those outputs
    var totalAmount = 0
    const receivers = []
    // loop over publicKeys that are receiving items
    for (const entry of toPublicKeysAmounts) {
        // create output with desired amount
        const output = driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(entry.publicKey),
            entry.amount.toString()
        )
        receivers.push(output)
        // store how much we already spent
        totalAmount = totalAmount + parseInt(entry.amount)
    }
    // fullfill old outputs based on amount spent on new outputs
    var totalSpent = 0
    const fullfillers = []
    const signers = []

    // loop over outputs
    for (const output of unspentOutputs) {
        // construct inputs that fullfill old outputs
        fullfillers.push({
            tx: output.tx,
            output_index: output.output_index
        })
        signers.push(fromKeyPair.privateKey)
        // calculate how much we already spent
        totalSpent += output.amount
        // stop looping if we reached exact number of spents
        if (totalSpent === totalAmount) {
            break;
        }
        // if the outputs have higher number of amount we spent
        // we need to transfer remaining amount back to original user
        if (totalSpent > totalAmount) {
            const remaining = totalSpent - totalAmount
            const output = driver.Transaction.makeOutput(
                driver.Transaction.makeEd25519Condition(fromKeyPair.publicKey),
                remaining.toString()
            )
            receivers.push(output)
            break;
        }
    }

    // construct transaction with new outputs and inputs pointing to old outputs
    const txTransfer = driver.Transaction.makeTransferTransaction(
        fullfillers,
        receivers,
        metadata
    )

    // sign and hash transaction
    const txSigned = driver.Transaction.signTransaction(txTransfer, ...signers)
    // send transaction in commit mode, return it when commited to BDB
    return await conn.postTransactionCommit(txSigned)
        .then(retrievedTx => {
            console.log('Transaction commited', retrievedTx.id)
            return retrievedTx
        })
        .catch(err => {
            console.log('Error while transfering', err)
            return false
        });
}
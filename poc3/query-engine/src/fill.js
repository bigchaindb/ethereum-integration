const bdb = require("./shared/bdb")

const keypair1 = bdb.getKeypairFromSeed("keypair1")
const keypair2 = bdb.getKeypairFromSeed("keypair2")
const keypair3 = bdb.getKeypairFromSeed("keypair3")


async function fill(){

  // create
  const tx1 = await bdb.createNewAsset(keypair1, keypair1.publicKey, {assetdata:"asset1"}, {metadata:"meta1"})
  const tx2 = await bdb.createNewAsset(keypair2, keypair2.publicKey, {assetdata:"asset2"}, {metadata:"meta2"})
  const tx3 = await bdb.createNewAsset(keypair2, keypair2.publicKey, {assetdata:"asset3"}, {metadata:"meta3"})
  const tx4 = await bdb.createNewAsset(keypair3, keypair3.publicKey, {assetdata:"asset4"}, {metadata:"meta4"})
  const tx5 = await bdb.createNewAsset(keypair3, keypair3.publicKey, {assetdata:"asset5"}, {metadata:"meta5"})
  const tx6 = await bdb.createNewAsset(keypair3, keypair3.publicKey, {assetdata:"asset6"}, {metadata:"meta6"})
  const tx7 = await bdb.createNewAsset(keypair1, keypair3.publicKey, {assetdata:"asset1"}, {metadata:"meta1"})
  const tx8 = await bdb.createNewAsset(keypair1, keypair2.publicKey, {assetdata:"asset2"}, {metadata:"meta2"})
  const tx9 = await bdb.createNewAsset(keypair2, keypair1.publicKey, {assetdata:"asset3"}, {metadata:"meta3"})
  // transfer some
  bdb.transferAsset(tx7, keypair3, keypair1.publicKey, {metadata:"meta21"});
  bdb.transferAsset(tx8, keypair2, keypair2.publicKey, {metadata:"meta22"});
  bdb.transferAsset(tx9, keypair1, keypair2.publicKey, {metadata:"meta23"});
}

fill()
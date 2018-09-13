const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');

const mnemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeed(mnemonic)
const hdwallet = hdkey.fromMasterSeed(seed);

// Public addresses
console.log(`Accounts:`)
for (var idx = 0; idx < 10; idx++) {
  const wallet = hdwallet.derivePath("m/44'/60'/0'/0/"+idx).getWallet();
  console.log(`(${idx})`, wallet.getAddressString());
}

// Private keys
console.log(`\n`)
console.log(`Private Keys:`)
for (var idx = 0; idx < 10; idx++) {
  const wallet2 = hdwallet.derivePath("m/44'/60'/0'/0/"+idx).getWallet();
  console.log(`(${idx})`, wallet2.getPrivateKey().toString('hex'));
}

// Mnemonic
console.log(`\n`)
console.log("Mnemonic: ", mnemonic);
console.log(`\n`)
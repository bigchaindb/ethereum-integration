const bdb = require('./bdb');

const berlinAddress = "10115 Berlin";
const burgosAddress = "109006 Burgos";
let truck = "truck1";

function sendBerlinAddress() {
    bdb.sendLocation(truck, { address: berlinAddress});
}

function sendBurgosAddress() {
    bdb.sendLocation(truck, { address: burgosAddress});
}

(() => sendBurgosAddress())();


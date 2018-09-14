const bdb = require('./bdb');

const berlinAddress = "Chausseestraße 19, 10115 Berlin";
const burgosAddress = "Av. de Castilla y León, 109006 Burgos";
let truck = "truck1";

function sendBerlinAddress() {
    bdb.sendLocation(truck, { address: berlinAddress});
}

function sendBurgosAddress() {
    bdb.sendLocation(truck, { address: burgosAddress});
}

(() => sendBurgosAddress())();


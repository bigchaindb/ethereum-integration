const schedule = require('node-schedule')
const bdb = require('./bdb')
const env = require('./env').default


let longInc = 0.11370906666667, latInc = 0.034366866666667; //estimated arrival in 5 minutes (30 txs)
const latInit = 52.520008, longInit = 13.404954; //Berlin coordinates
const latMax = 53.551086, longMin = 9.993682; //Hamburg coordinates
let latitude = latInit, longitude = longInit;

// Execute every 10 seconds
var j = schedule.scheduleJob('10 * * * * *', function () {

    if(latitude >= latMax && longitude <= longMin){
        console.log("Truck reached Hamburg...");
        latitude = latInit;
        longitude = longInit;
        console.log("Truck will start again from Berlin to Hamburg...");
    }
    else {
        latitude += latInc;
        longitude -= longInc;
    }

    const location = {latitude, longitude, createdOn: Date()};
    const transaction = bdb.sendLocation(location);

})


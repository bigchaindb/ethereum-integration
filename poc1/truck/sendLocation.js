const schedule = require('node-schedule');
const bdb = require('./bdb');


let longInc = 0.11370906666667, latInc = 0.034366866666667; //estimated arrival in approx 3 minutes (30 txs)
const latInit = 52.520008, longInit = 13.404954; //Berlin coordinates
const latMax = 53.551086, longMin = 9.993682; //Hamburg coordinates
let latitude = latInit, longitude = longInit;
let truck = "truck1";
let countsToExit = 10;

// Execute every 10 seconds
var j = schedule.scheduleJob('*/5 * * * * *', function () {

    //check if truck 1 reached Hamburg
    if(latitude >= latMax && longitude <= longMin){
        console.log(truck + " reached Hamburg...");
        latitude = latInit;
        longitude = longInit;
        //Now, truck 2 will start the journey
        truck = "truck2";
        //truck 2 will go kaput midway between Berlin and Hamburg
        countsToExit = 10; 
        console.log(truck  + " will start from Berlin to Hamburg...");
    }
    else {
        //truck rides towards Hamburg
        latitude += latInc;
        longitude -= longInc; 
    }
    
    //if truck 2 reaches midway to Hamburg, 
    //it gets Kaput and stops sending location
    if(countsToExit == 0 && truck == "truck2"){
        console.log(truck  + " will got kaput in between Berlin to Hamburg...");
        bdb.sendLocation(truck, location);
        process.exit(0);
    }

    countsToExit--;
    const location = {latitude, longitude, createdOn: Date()};
    bdb.sendLocation(truck, location);

})

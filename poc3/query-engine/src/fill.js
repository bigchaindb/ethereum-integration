const bdb = require("./shared/bdb")

const keypairPlatform = bdb.getKeypairFromSeed("platform")
const keypairUser1 = bdb.getKeypairFromSeed("user1")
const keypairUser2 = bdb.getKeypairFromSeed("user2")
const keypairUser3 = bdb.getKeypairFromSeed("user3")
const keypairUser4 = bdb.getKeypairFromSeed("user4")
const keypairUser5 = bdb.getKeypairFromSeed("user5")

function getDates(startDate, endDate) {
  var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};


async function fill(){

  const dates = getDates(new Date(2015,01,01), new Date(2018,12,31));
  // for each day
  for (const date of dates) {
      bdb.createNewAsset(keypairUser1, keypairPlatform.publicKey, {type:"scan", timestamp: new Date(date).getTime()}, null);
      bdb.createNewAsset(keypairUser2, keypairPlatform.publicKey, {type:"scan", timestamp: new Date(date).getTime()}, null);
      bdb.createNewAsset(keypairUser3, keypairPlatform.publicKey, {type:"scan", timestamp: new Date(date).getTime()}, null);
      bdb.createNewAsset(keypairUser4, keypairPlatform.publicKey, {type:"scan", timestamp: new Date(date).getTime()}, null);
      bdb.createNewAsset(keypairUser5, keypairPlatform.publicKey, {type:"scan", timestamp: new Date(date).getTime()}, null);
  }
}

fill()

/*
console.log(new Date("2016,01,01").getTime())
console.log(new Date("2017,12,31").getTime())
*/
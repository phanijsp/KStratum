var MongoClient = require('mongodb').MongoClient;
var DbConnection = require('./DbConnection')

module.exports = class PoolStats {
    async updateMiner(submitResponse) {
        try {
            var minerID = submitResponse.params[0].split('.')[0]
            var workerID = submitResponse.params[0].split('.')[1]
            var date = new Date()
            date.getUTC
            date.setSeconds(0)
            date.setMilliseconds(0)
            var dateISO = date.toISOString().replace('.000Z','')
            var obj = {
                $set: {
                    [`lastSubmitted`]: Date.now(),
                    [`workers.${workerID}.lastSubmitted`]: Date.now()
                },
                $inc: {
                    [`workers.${workerID}.shares.${dateISO}`]: 1
                }
            }
            let db = await DbConnection.Get()
            var query = { _id: minerID }
            const options = { upsert: true };
            db.db().collection('Miners').updateOne(query, obj, options)
        } catch (error) {
            console.log(error)
        }
    }

    async updateBalances(arr, blockReward) {
        try {
            var uniqs = arr.reduce((acc, val) => {
                acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
                return acc;
            }, {});
            let db = await DbConnection.Get()
            for (var key in uniqs) {
                try {
                    if (uniqs.hasOwnProperty(key)) {
                        var val = uniqs[key]
                        var unPaid = blockReward * (val/arr.length)
                        var query = { _id: key }
                        var obj = {
                            $inc: {
                                [`unPaid`]: unPaid,
                            }
                        }
                        const options = { upsert: true };
                        db.db().collection('Miners').updateOne(query, obj, options)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
}



const redis = require('redis');



module.exports = class PoolStats{

    constructor(){
        this.client.connect()
    }
    
    client = redis.createClient({
        socket: {
            host: '192.168.0.180',
            port: 6379
        },
        password: ''
    });
    
    
    async getMinerStats(miner){
        return await this.client.json.get(miner)
    }

    async setMinerStats(miner){
        const eMinersType = await this.client.json.type('miners')
        
        var data = {
            [miner.params[0].replace('kaspa:','').split('.')[0]+Date.now()]:{
                "lastSubmitted" : [Date.now()]
            }
        }

        var subData = {
            "lastSubmitted" : [Date.now()]
        }

        if(eMinersType==null){
            console.log('no miners object found, creating one...')
            await this.client.json.set('miners','$',JSON.stringify(data))
            return
        }
        
        
        var path = '.'+miner.params[0].replace('kaspa:','').split('.')[0]+Date.now()
        await this.client.json.set('miners',path,JSON.stringify(subData))
    }
}

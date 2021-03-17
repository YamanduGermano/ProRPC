const rpc = require('discord-rpc')
const fetch = require('node-fetch')
const input = require('input')
var cfg = require('./config.json')


//Command Line Interface


let resStatus

async function login(){
    console.clear()
    console.log("Type your Client ID! You can find it on Discord Developers Page")

    while (true){

        cfg.cid = await input.text("> ").catch(console.error)
        
        console.clear()
        console.log("Verifying ID...")
        await fetch(`https://discordapp.com/api/oauth2/applications/${cfg.cid}/assets`)
        .then(res =>{
            res.json()
            resStatus = res.status
        })
        if(resStatus == 200){
            console.clear()
            console.log("Client validated\n\nAssets fetched successfully!")
            break
        }
        console.clear()
        
        console.log("Invalid ID! Please, try again")
    }
}


if (cfg.cid == ""){
    login()
}


    
// DiscordJS login block

// const scopes = ['rpc', 'rpc.api']


// client.on('ready', () => {
        
//     client.request('SET_ACTIVITY', {
//         pid: process.pid,
//         activity : {
//             state: cfg.state,
//             details : cfg.details,
//             assets : {
//                 large_image : cfg.lgimage,
//                 large_text : cfg.lgtext, // THIS WILL SHOW AS "Playing <Status>" from the outisde
//                 small_image : cfg.smimage,
//                 small_text: cfg.smtext
//             },
//             buttons : config.links
//         }
//     })
// })


// client.login({ clientId : "739788816008872046" }).catch(console.error)}
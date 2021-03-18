const rpc = require('discord-rpc')
const fs = require('fs')
const fetch = require('node-fetch')
const input = require('input')
var cfg = require('./config.json')


//Command Line Interface Functions

let fetchedAssets = []

let resStatus

async function login(){
    
    console.clear()

    console.log("Type your Client ID! You can find it on Discord Developers Page")

    while (true){

        //Client ID Input
        cfg.cid = await input.text("> ").catch(console.error)
        

        console.clear()

        // Verification System
        console.log("Verifying ID...")

        // Get response body
        await fetch(`https://discordapp.com/api/oauth2/applications/${cfg.cid}/assets`, {method:"GET"})
        .then(res =>res.json())
        .then(json => {fetchedAssets = json})

        //Get response status
        await fetch(`https://discordapp.com/api/oauth2/applications/${cfg.cid}/assets`, {method:"GET"})
        .then(res => {resStatus = res.status})
        
        //If Discord API find the client ID:
        if(resStatus == 200){

            console.clear()
            
            //Get asset names
            fetchedAssets.forEach((asset) => {cfg.assets.push(asset.name)})

            //Update Config JSON
            fs.writeFile('./config.json', JSON.stringify(cfg,null,3), (err) => {if (err) console.log('Error writing file:', err)})

            console.log("Client validated\n\nAssets fetched successfully!")

            //Break Login Loop
            menu()
            break
        }
        
        console.clear()

        //If ID is invalid
        console.log("Invalid ID! Please, try again")
    }
}

function run(){
    const client = new rpc.Client({ transport: 'ipc' })
    
    client.on('ready', () => {
            
        client.request('SET_ACTIVITY', {
            pid: process.pid,
            activity : {
                state: cfg.state,
                details : cfg.details,
                assets : {
                    large_image : cfg.lgimage,
                    large_text : cfg.lgtext,
                    small_image : cfg.smimage,
                    small_text: cfg.smtext
                },
                buttons : cfg.links
            }
        })
    })

    console.clear()

    console.log("Running Rich Presence!\n\nType CTRL+C to exit")
    client.login({ clientId : cfg.cid}).catch(console.error)
}


//Main Menu
async function menu(){
    // If ID is registered on system
    if (cfg.cid != ""){
        console.clear()
        let selection = await input.select("-----------------------\n \nWelcome to ProRPC\n \n \nChoose one of the options below:",[{name:'Run RPC', value: '1'},{name:'Options', value: '2'}, {name:'Reset system', value: '3'},{name:'Reload assets list', value: '4'}, {name: 'Exit', value: 5}])
        function validate (value) {
            if (value == 1){return run()}
            else if (value == 2){return options()}
            else if (value == 3){return reset()}
            else if (value == 4){return reload()}
            else{process.exit()}
        }
        validate(selection)
    }

    //If user dont provide any ID
    else{
        login()
    }
}

menu()
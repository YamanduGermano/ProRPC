const rpc = require('discord-rpc')
const fs = require('fs')
const fetch = require('node-fetch')
const input = require('input')
var cfg = require('./config.json')

const client = new rpc.Client({ transport: 'ipc' })

//Command Line Interface Functions


async function login(){
    
    console.clear()

    let fetchedAssets = []

    let resStatus

    console.log("Type your Client ID! If you are having problems, type \"HELP\"")

    while (true){

        //Client ID Input
        userinput = await input.text("> ").catch(console.error)
        
        if (userinput == "HELP"){
            help()
            break
        }

        console.clear()

        // Verification System
        console.log("Verifying ID...")

        // Get response body
        await fetch(`https://discordapp.com/api/oauth2/applications/${userinput}/assets`, {method:"GET"})
        .then(res =>res.json())
        .then(json => {fetchedAssets = json})

        //Get response status
        await fetch(`https://discordapp.com/api/oauth2/applications/${userinput}/assets`, {method:"GET"})
        .then(res => {resStatus = res.status})

        //If Discord API find the client ID:
        if(resStatus == 200){


            console.clear()
            
            cfg.cid = userinput

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


// PAGES -------------
function run(){

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
                buttons : cfg.bttns
            }
        })
    })

    console.clear()

    console.log("Running Rich Presence!\n\nType anything to return or press CTRL+C to exit")
    
    
    breakrpc()
    client.login({ clientId : cfg.cid}).catch(console.error)
}

async function breakrpc(){
    userinput = await input.text("> ").catch(console.error)
    client.destroy()
    menu()
}

async function settings(){
    console.clear()
    userinput = await input.select(" \nSETTINGS\n \n \nChoose one of the options below:",[{name:'CHANGE TEXTS', value: 1}, {name:'CHANGE IMAGES', value: 2}, {name:'CHANGE BUTTONS', value: 3}, {name:'RESET SYSTEM', value: 4}, {name:'RELOAD ASSETS LIST', value: 5}, { name: "", disabled: true },{name:'RETURN AND SAVE', value: 6},{name:'RETURN WITHOUT SAVING', value: 7}])
    switch (userinput) {
        case 1:
            texts()
            break
        case 2:
            images()
            break
        case 3:
            buttons()
            break
        case 4:
            reset()
            break
        case 5:
            reload()
            break
        case 6:
            fs.writeFileSync('./config.json', JSON.stringify(cfg,null,3), (err) => {if (err) console.log('Error writing file:', err)})
            console.log(cfg)
            menu()
            break
        default:
            cfg = JSON.parse(fs.readFileSync('config.json', 'utf8'))
            menu()
    }
}

async function texts(){
    console.clear()
    userinput = await input.select(" \nTEXTS\n \n \nChoose one of the options below:",[{name:`STATE: ${cfg.state}`, value: 1}, {name:`DETAILS: ${cfg.details}`, value: 2}, {name:`LARGE IMAGE TEXT: ${cfg.lgtext}`, value: 3}, {name:`SMALL IMAGE TEXT: ${cfg.smtext}`, value: 4}, { name: "", disabled: true },{name:'RETURN', value: 5}])
    switch (userinput) {
        case 1:
            userinput = await input.text(`To return press enter\n \nOLD State: ${cfg.state}\n \nNEW State: `).catch(console.error)
            if (userinput){
                cfg.state = userinput
                texts()
                break
            }
        case 2:
            userinput = await input.text(`To return press enter\n \nOLD Detail: ${cfg.details}\n \nNEW Detail: `).catch(console.error)
            if (userinput){
                cfg.details = userinput
                texts()
                break
            }
        case 3:
            userinput = await input.text(`To return press enter\n \nOLD Large Image Text: ${cfg.lgtext}\n \nNEW Large Image Text: `).catch(console.error)
            if (userinput){
                cfg.lgtext = userinput
                texts()
                break
            }
        case 4:
            userinput = await input.text(`To return press enter\n \nOLD Small Image Text: ${cfg.smtext}\n \nNEW Small Image Text: `).catch(console.error)
            if (userinput){
                cfg.smtext = userinput
                texts()
                break
            }
        default:
            settings()
            break
    }
}

async function images(){
    console.clear()
    userinput = await input.select(" \nTEXTS\n \n \nChoose one of the options below:",[{name:`LARGE IMAGE: ${cfg.lgimage}`, value: 1}, {name:`SMALL IMAGE: ${cfg.smimage}`, value: 2}, { name: "", disabled: true },{name:'RETURN', value: 3}])
    switch (userinput) {
        case 1:
            console.clear()

            console.log("Assets List")
            console.table(cfg.assets)
            userinput = await input.text(`To return press enter\n \nOLD Large Image: ${cfg.lgtext}\n \nNEW Large Image: `).catch(console.error)
            if (userinput){
                cfg.lgimage = userinput
                images()
                break
            }
            else{
                images()
                break
            }
        case 2:
            console.clear()

            console.log("Assets List")
            console.table(cfg.assets)
            userinput = await input.text(`To return press enter\n \nOLD Small Image: ${cfg.smtext}\n \nNEW Small Image: `).catch(console.error)
            if (userinput){
                cfg.smimage = userinput
                images()
                break
            }
            else{
                images()
                break
            }
        default:
            settings()
            break
    }
}

async function buttons(){
    console.clear()
    
    console.log("ACTIVE BUTTONS")
    console.table(cfg.bttns)
    userinput = await input.select("\n \nChoose one of the options below:",[{name:"BUTTON 1", value: 1}, {name:"BUTTON 2", value: 2, disabled:(((cfg.bttns).length)==1)? true : false}, { name: "", disabled: true }, {name:"ADD A BUTTON", value:3, disabled:(((cfg.bttns).length)==2)? true : false}, {name:'RETURN', value: 4}])

    switch (userinput) {
        case 1:
            console.clear()

            userinput = await input.text(`To return press enter\nTo delete the button press SPACEBAR and ENTER\n \nOLD LABEL: ${cfg.bttns[0].label}\nOLD URL: ${cfg.bttns[0].url}\nNEW LABEL: `).catch(console.error)
            if (userinput && userinput != " "){
                cfg.bttns[0].label = userinput
                userinput = await input.text(`NEW URL: `).catch(console.error)
                cfg.bttns[0].url = userinput
                buttons()
                break
            }
            else if (userinput == " "){
                cfg.bttns.splice(0,1)
                buttons()
                break
            }
            else{
                buttons()
                break
            }
        case 2:
            console.clear()

            userinput = await input.text(`To return press enter\n \nOLD LABEL: ${cfg.bttns[1].label}\nOLD URL: ${cfg.bttns[1].url}\nNEW LABEL: `).catch(console.error)
            if (userinput && userinput != " "){
                cfg.bttns[1].label = userinput
                userinput = await input.text(`NEW URL: `).catch(console.error)
                cfg.bttns[1].url = userinput
                buttons()
                break
            }
            else if (userinput == " "){
                cfg.bttns.splice(1,1)
                buttons()
                break
            }
            else{
                buttons()
                break
            }
        case 3:
            console.clear()

            userinput = await input.text(`To return press enter\n \nBUTTON LABEL: `).catch(console.error)
            if (userinput && userinput != " "){
                
                let userinput2 = await input.text(`BUTTON URL: `).catch(console.error)
                cfg.bttns.push({"label":userinput, "url":userinput2})
                buttons()
                break
            }
            else{
                buttons()
                break
            }
        default:
            settings()
            break
    }
}

async function reload(){
    console.clear()
    console.log("Reloading assets!")
    
    // Fetch assets list
    await fetch(`https://discordapp.com/api/oauth2/applications/${cfg.cid}/assets`, {method:"GET"})
        .then(res =>res.json())
        .then(json => {fetchedAssets = json})
    
    // Filter json to get asset names only
    fetchedAssets.forEach((asset) => {cfg.assets.push(asset.name)})
    
    // Update assets list
    fs.writeFileSync('./config.json', JSON.stringify(cfg,null,3), (err) => {if (err) console.log('Error writing file:', err)})
    
}

async function reset(){
    userinput = await input.confirm("RESET SETTINGS\n \nAre you certain?")
    if(userinput){
        console.clear()

        console.log("Resetting the system...")

        await fetch("https://raw.githubusercontent.com/YamanduGermano/ProRPC/main/config.json", {method:"GET"})
            .then(res=>res.json())
            .then(json=>{
                cfg = json
                fs.writeFileSync('./config.json', JSON.stringify(cfg,null,3), (err) => {if (err) console.log('Error writing file:', err)})
            })
        
        console.clear()
        
        menu()
    }
    else{
        settings()
    }
}

async function help(){
    console.clear()
    console.log(`
So, You are having problems with using PRORPC
No problem, I will help you!


----------| RPC Basic Setup |----------

First of all, you have to create an application on Discord Developers Page
Link: https://discord.com/developers

You will get its Client ID

Its name will be displayed as the game name, so in your account it will appear as
(If your application name is "Sua mãe")
"Playing Sua mãe"

----------| Advanced Settings |----------

Ok, now your RPC is basically working.
Lets customize it

To add images on your RPC you have to go on Assets tab

(If you are logged in, I can get the correct Link but if you don't, you have to read the block above)
Link:https://discord.com/developers/applications/${cfg.cid}/rich-presence/assets

Upload your images and set their names

Assets names are going to be fetched when you do the login here
If you notice that some of them are missing, go on the settings and refresh the list

Now, go to the settings page and choose what you want to display in your Rich Presence.

To RETURN to MAIN MENU type anything below
    `)

    userinput = await input.text("> ").catch(console.error)
    menu()
}

async function about(){
    console.clear()
    console.log(`
ProRPC! Created by Yamandú Germano, an brazilian student and creator of Codae Channel (AD time lol)

Se você deseja saber mais sobre programação e como isso pode mudar seu futuro, no canal Codae você pode aprender desde o básico até o avançado de uma forma simples e acessível!    

Now I will paste some links and Licensing things. So, if you want to back to menu, just type anything


----------| links |----------
My Youtube channel Codae: https://www.youtube.com/channel/UCGho6jJaDh51TqUckTqcyKg
Github Repository: https://github.com/YamanduGermano/ProRPC
-----------------------------


MIT License

Copyright (c) 2021 Yamandú Germano Cavalcanti

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

To RETURN to MAIN MENU type anything below
    `)

    userinput = await input.text("> ").catch(console.error)
    menu()
}

//Main Menu
async function menu(){
    // If ID is registered on system
    if (cfg.cid){
        console.clear()
        let userinput = await input.select(" \nWelcome to ProRPC\n \n \nChoose one of the options below:",[{name:'RUN RPC', value: 1},{name:'SETTINGS', value: 2}, {name: 'ABOUT', value: 3}, {name: 'HELP', value: 4}, { name: "", disabled: true }, {name: 'EXIT', value: 5}])
        switch (userinput) {
            case 1:
                run()
                break
            case 2:
                settings()
                break
            case 3:
                about()
                break
            case 4:
                help()
                break
            default:
                process.exit()
        }
    }

    //If user dont provide any ID
    else{
        login()
    }
}

menu()
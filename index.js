#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const clui = require('clui');
const figlet = require('figlet');
const axios = require('axios');
const Configstore = require('configstore');
const pkg = require('./package.json');
const argv = require('minimist')(process.argv.slice(2))['_'];

const inquirer = require('./lib/inquirer');

const conf = new Configstore(pkg.name);

let token;
let lightId;

function isNumber(value) {
    return !isNaN(value) &&
        parseFloat(Number(value)) == value &&
        !isNaN(parseFloat(value, 10));
}

const getRequestConfig = () => {
    return {
        headers: {
            Authorization: "Bearer " + token,
        }
    }
}

const isValid = (option, value) => {
    switch (option.toUpperCase()) {
        case "POWER":
            return value.toUpperCase() === "ON" || value.toUpperCase() === "OFF";
        case "COLOR":
            return value.search(/#[a-zA-Z0-9]{6}/gm) > -1;
        case "BRIGHTNESS":
            return isNumber(value);
        case "DURATION":
            return isNumber(value);
        case "INFRARED":
            return isNumber(value);
    }
    return 'Enter a valid value!';
}

const run = async () => {
    clear();
    if (conf.has("token")) {
        token = conf.get("token");
    } else {
        token = (await inquirer.askLifxToken()).token;
        conf.set("token", token);
    }


    if (conf.has('lightId')) {
        lightId = conf.get('lightId');
        await runCommand();
    } else {
        lightId = await axios.get('https://api.lifx.com/v1/lights/all', getRequestConfig()).then(async (res) => {
            let lightNames = [];
            for (let i = 0; i < res.data.length; i++) {
                let lightObject = res.data[i];
                lightNames[lightNames.length] = lightObject.label;
            }
            let lightName = (await inquirer.askLight(lightNames))['lightName'];
            console.log(lightName);
            for (let i = 0; i < res.data.length; i++) {
                let lightObject = res.data[i];
                if (lightObject.label === lightName) {
                    lightId = lightObject.id;
                }
            }
            conf.set('lightId', lightId);

            await runCommand();
        });
    }
}

const runCommand = async () => {
    console.log(chalk.yellow(figlet.textSync('LIFX', { horizontalLayout: 'full' })))
    let data = {};
    if (argv.length > 0) {
        switch (argv[0].toUpperCase()) {
            case "ON":
                data['power'] = 'on';
                break;
            case "OFF":
                data['power'] = 'off';
                break;
            default:
                data[argv[0].toLowerCase()] = argv[1];
                break;
        }
    } else {
        let done = false;

        while (!done) {
            let option = (await inquirer.askLightOption())['lightOption'];
            data[option.toLowerCase()] = (await inquirer.askLightValue(option, isValid))['lightValue'];

            done = (await inquirer.askInputDone())['inputDone'];
        }
    }

    let spinner = new clui.Spinner("Sending request...");
    spinner.start();
    await axios.put(`https://api.lifx.com/v1/lights/${lightId}/state`, data, getRequestConfig()).then((res) => {
        spinner.stop();
    });
}

run();

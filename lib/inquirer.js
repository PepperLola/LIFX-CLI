const inquirer = require('inquirer');

module.exports = {
    askLifxToken: () => {
        return inquirer.prompt(
            {
                name: 'token',
                type: 'password',
                message: 'Enter your LIFX token:',
                validate: (value) => {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter your LIFX token.'
                    }
                }
            }
        );
    },
    askLight: (names) => {
        return inquirer.prompt({
            name: 'lightName',
            type: 'list',
            message: 'Select the light you wish to change:',
            choices: names,
        });
    },
    askLightOption: () => {
        return inquirer.prompt({
            name: 'lightOption',
            type: 'list',
            message: 'What would you like to set?',
            choices: [
                'Power',
                'Color',
                'Brightness',
                'Duration',
                'Infrared',
            ]
        });
    },
    askLightValue: (option, isValid) => {
        return inquirer.prompt({
            name: 'lightValue',
            type: 'input',
            message: 'What would you like to set it to?',
            validate: (value) => {
                return isValid(option, value);
            }
        });
    },
    askInputDone: () => {
        return inquirer.prompt({
            name: 'inputDone',
            type: 'confirm',
            message: 'Send the request?'
        });
    }
}

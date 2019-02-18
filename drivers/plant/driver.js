'use strict';
'use math';

const Homey = require('homey');

class plantDriver extends Homey.Driver {
	
	onInit() {
		this.log('Plant driver has been inited');
	}

	onPair(socket) {
		var plantId = "dummy";
		// dummy
        let devices = [
            {
                "name": "zeversolar_plant_" + plantId,
                "data": { 
                    "id": plantId, 
                    "apikey": "..." 
                },
                "settings": {
                    "id": plantId,
                    "apikey": "APIKey"
                }
            }
        ]

        // this is called when the user presses save settings button in pair.html
        socket.on('get_devices', (device_data, callback) => {
            devices = device_data;
            callback(null, devices);
        });

        // this happens when user clicks away the pairing windows
        socket.on('disconnect', () => {
            this.log("ZeverCloud - Pairing is finished (done or aborted) ");
        })

    } // end onPair
}

module.exports = plantDriver;
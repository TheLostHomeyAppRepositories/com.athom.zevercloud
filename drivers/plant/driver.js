'use strict';
'use math';

const Homey = require('homey');

class plantDriver extends Homey.Driver {
	
	onInit() {
		this.log('Plant driver has been inited');
	}

	onPair(socket) {
		var plantId = Math.random().toString(36).substr(2,5);
		this.log('Plant id ' + plantId);
		
        let devices = [
            {
                "name": "ZeverSolar Plant",
                "data": { "id": "abcd" , "apikey": "..." },
                "settings": {
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

'use math';

const Homey = require('homey');

class plantDriver extends Homey.Driver {
	
	async onInit() {
		this.log('Plant driver has been inited');
	}

	async onPair(socket) {
    } // end onPair
}

module.exports = plantDriver;
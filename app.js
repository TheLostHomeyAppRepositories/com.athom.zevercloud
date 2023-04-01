const Homey = require('homey');

class ZeverCloudApp extends Homey.App {
	
	async onInit() {
		this.log('ZeverCloud app is running...');
	}
	
}

module.exports = ZeverCloudApp;

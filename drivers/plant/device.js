
const Homey = require('homey');
const zevercloud = require('../index.js');

Date.prototype.timeNow = function(){ 
    return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + " " + ((this.getHours()>12)?('PM'):'AM');
};

const RETRY_INTERVAL = 300 * 1000;
let timer;

class plant extends Homey.Device {

	async onInit() {
		this.log('plant has been inited');

        timer = this.homey.setInterval(() => {
            // poll device state from invertor
            this.pollSeverCloud();
        }, RETRY_INTERVAL);

        this._flowTriggerPowerAbove100W  = this.homey.flow.getTriggerCard('PowerAbove100W');
        this._flowTriggerPowerAbove500W  = this.homey.flow.getTriggerCard('PowerAbove500W');
        this._flowTriggerPowerAbove1000W = this.homey.flow.getTriggerCard('PowerAbove1000W');
        this._flowTriggerPowerIs0W       = this.homey.flow.getTriggerCard('PowerIs0W');

        this._conditionIsGenerating = this.homey.flow.getConditionCard('is_generating').registerRunListener((args, state) => {
                var result = (this.getCapabilityValue('measure_power') > 0 ) 
                return Promise.resolve(result);
        });        
        this._conditionGeneratingOutput = this.homey.flow.getConditionCard('generating_output').registerRunListener((args, state) => {
            var result = (this.conditionIsGeneratingToString(this.getCapabilityValue('measure_power')) == args.argument_main) 
            return Promise.resolve(result);
        });

        if (this.hasCapability('meter_power') === true) {
            await this.removeCapability('meter_power');
        }

        this.pollSeverCloud();
	}

    conditionIsGeneratingToString(power) {
        if ( power < 100 ) {
            return 'minimal';
        } else if ( power < 500 ) {
            return 'ok';
        } else if ( power < 1000 ) {
            return 'better';
        } else if ( power < 1500 ) {
            return 'nice';
        } else if ( power < 2000 ) {
            return 'super';
        } else if ( power < 3000 ) {
            return 'chill';
        } else if ( power < 4000 ) {
            return 'awesome';
        } else {
            return 'moneymaker';
        }
    }

    // flow triggers
    triggerPowerAbove100WFlow(tokens) {
        this._flowTriggerPowerAbove100W
            .trigger(tokens)
            .then(this.log("triggerPowerAbove100WFlow"))
            .catch(this.error)
    }

    // flow triggers
    triggerPowerAbove500WFlow(tokens) {
        this._flowTriggerPowerAbove500W
            .trigger(tokens)
            .then(this.log("triggerPowerAbove500WFlow"))
            .catch(this.error)
    }
    // flow triggers
    triggerPowerAbove1000WFlow(tokens) {
        this._flowTriggerPowerAbove1000W
            .trigger(tokens)
            .then(this.log("triggerPowerAbove1000WFlow"))
            .catch(this.error)
    }

    triggerPowerIs0WFlow(tokens) {
        this._flowTriggerPowerIs0W
            .trigger(tokens)
            .then(this.log("triggerPowerIs0WFlow"))
            .catch(this.error)
    }

    async onAdded() {
        let id = this.getData().id;
        this.log('device added: ', id);
    } // end onAdded

    async onDeleted() {
        this.homey.clearInterval(timer);
        this.log('device deleted:', id);
    } // end onDeleted

    async onSettings(settings, newSettingsObj, changedKeysArr) {
        this.log("device settings " +  JSON.stringify(settings));
    }

    pollSeverCloud() {
        let settings = this.getSettings();
        this.log("device settings " +  JSON.stringify(settings));
        let name2 = 'zeversolar_plant_' + this.getData().id;
        this.log("pollSeverCloud device name " +  name2);

        zevercloud.getTodayData(settings).then(data => {
            var currentdate =new Date().timeNow();
            this.log("refresh now " + currentdate);
    
            this.log("Received data");

            if (data != "ERROR"){

                this.log("object "+ JSON.stringify(data));
                var ludtdate = data.ludt; 
                this.log("update date "+ ludtdate);
                this.setCapabilityValue('latest_upload_date', ludtdate);

                var power = 0
                if ( data.Power.unit == "W" ) {
                    power =  data.Power.value;                    
                } else {
                    power =  (data.Power.value * 1000);
                }

                var etotal = 0
                if ( data["E-Total"].unit == "MWh" ) {
                    etotal =  (data["E-Total"].value * 1000);
                } else {
                    etotal =  data["E-Total"].value;
                }

                var etotalMonth = 0
                if ( data["E-Month"].unit == "MWh" ) {
                    etotalMonth =  (data["E-Month"].value * 1000);
                } else {
                    etotalMonth =  data["E-Month"].value;
                }

                this.setCapabilityValue('measure_power', power);

                var val = data["E-Today"].value
                this.setCapabilityValue('measure_e-total-today', val);
                this.setCapabilityValue('measure_e-total-month', etotalMonth);
                this.setCapabilityValue('measure_e-total', etotal);
               

                let tokens = {
                    "power": power,
                    "plant": this.getData().id.toLowerCase()
                };

                if ( this.getCapabilityValue('measure_power') < 100 
                    && power > 100 
                    && power < 500 ) {
                    this.triggerPowerAbove100WFlow(tokens);
                } else if ( this.getCapabilityValue('measure_power') < 500 
                            && power > 500 
                            && power < 1000 ) {
                    this.triggerPowerAbove500WFlow(tokens);
                } else if ( this.getCapabilityValue('measure_power') < 1000 
                            && power > 1000 ) {
                    this.triggerPowerAbove1000WFlow(tokens);
                }

                if (this.getCapabilityValue('measure_power') >= 25 && power < 25 ) {
                    let tokens2 = {
                        "power": 0,
                        "plant": this.getData().id.toLowerCase()
                    };
                    this.triggerPowerIs0WFlow(tokens2);
                }
            } else {
                this.setCapabilityValue('latest_upload_date', "Err check your keys");
            }
        })
        .catch(error => {
            this.log(error);
        });
    }
}

module.exports = plant;
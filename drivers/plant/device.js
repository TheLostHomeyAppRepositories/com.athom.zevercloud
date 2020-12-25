'use strict';

const zevercloud = require('../index.js');
const Homey = require('homey');

Date.prototype.timeNow = function(){ 
    return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() + " " + ((this.getHours()>12)?('PM'):'AM');
};

class plant extends Homey.Device {

	async onInit() {
		this.log('plant has been inited');
        let settings = this.getSettings();
        let name = 'zeversolar_plant_' + this.getData().id;
        let cronName = name.toLowerCase();
        this.log("device settings " +  JSON.stringify(settings));

        Homey.ManagerCron.getTask(cronName)
            .then(task => {
                this.log("The task exists: " + cronName);
                this.log('Unregistering cron:', cronName);
                Homey.ManagerCron.unregisterTask(cronName, function (err, success) {});
                Homey.ManagerCron.registerTask(cronName, "*/5 * * * *", settings)
                .then(task => {
                    task.on('run', settings => this.pollSeverCloud(settings));
                })
                .catch(err => {
                    this.log('problem with registering cronjob: ${err.message}');
                });            
            })
            .catch(err => {
                if (err.code == 404) {
                    this.log("The task has not been registered yet, registering task: " + cronName);
                    Homey.ManagerCron.registerTask(cronName, "*/5 * * * *", settings)
                        .then(task => {
                            task.on('run', settings => this.pollSeverCloud(settings));
                        })
                        .catch(err => {
                            this.log('problem with registering cronjob: ${err.message}');
                        });
                } else {
                    this.log('other cron error: ${err.message}');
                }
            });

        this._flowTriggerPowerAbove100W = new Homey.FlowCardTrigger('PowerAbove100W').register();
        this._flowTriggerPowerAbove500W = new Homey.FlowCardTrigger('PowerAbove500W').register();
        this._flowTriggerPowerAbove1000W = new Homey.FlowCardTrigger('PowerAbove1000W').register();
        this._flowTriggerPowerIs0W = new Homey.FlowCardTrigger('PowerIs0W').register();
        this._conditionIsGenerating = new Homey.FlowCardCondition('is_generating').register().registerRunListener((args, state) => {
                var result = (this.getCapabilityValue('measure_power') > 0 ) 
                return Promise.resolve(result);
        });        
        this._conditionGeneratingOutput = new Homey.FlowCardCondition('generating_output').register().registerRunListener((args, state) => {
            var result = (this.conditionIsGeneratingToString(this.getCapabilityValue('measure_power')) == args.argument_main) 
            return Promise.resolve(result);
        });
        this.pollSeverCloud(settings);
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

    onAdded() {
        let id = this.getData().id;
        this.log('device added: ', id);
    } // end onAdded

    onDeleted() {

        let id = this.getData().id;
        let name = this.getName() + '_' + this.getData().id;
        let cronName = name.toLowerCase();
        this.log('Unregistering cron:', cronName);
        Homey.ManagerCron.unregisterTask(cronName, function (err, success) {});

        this.log('device deleted:', id);

    } // end onDeleted

    onSettings(settings, newSettingsObj, changedKeysArr, callback) {
        try {
            for (var i = 0; i < changedKeysArr.length; i++) {
                switch (changedKeysArr[i]) {
                    case 'apikey':
                        this.log('APIKey changed to ' + newSettingsObj.apikey);
                        settings.apikey = newSettingsObj.apikey;
                        break;
                    case 'appkey':
                        this.log('APPKey changed to ' + newSettingsObj.appkey);
                        settings.appkey = newSettingsObj.appkey;
                        break;
                    case 'secret':
                        this.log('Secret changed to ' + newSettingsObj.secret);
                        settings.secret = newSettingsObj.secret;
                        break;
                    default:
                        this.log("Key not matched: " + i);
                        break;
                }
            }

            let name = 'zeversolar_plant_' + this.getData().id;
            let cronName = name.toLowerCase();
            this.log("device settings " +  JSON.stringify(settings));
    
            Homey.ManagerCron.getTask(cronName)
                .then(task => {
                    this.log("The task exists: " + cronName);
                    this.log('Unregistering cron:', cronName);
                    Homey.ManagerCron.unregisterTask(cronName, function (err, success) {});
                    Homey.ManagerCron.registerTask(cronName, "*/5 * * * *", settings)
                    .then(task => {
                        task.on('run', settings => this.pollSeverCloud(settings));
                    })
                    .catch(err => {
                        this.log('problem with registering cronjob: ${err.message}');
                    });            
                })
                .catch(err => {
                    if (err.code == 404) {
                        this.log("The task has not been registered yet, registering task: " + cronName);
                        Homey.ManagerCron.registerTask(cronName, "*/5 * * * *", settings)
                            .then(task => {
                                task.on('run', settings => this.pollSeverCloud(settings));
                            })
                            .catch(err => {
                                this.log('problem with registering cronjob: ${err.message}');
                            });
                    } else {
                        this.log('other cron error: ${err.message}');
                    }
                });

            this.pollSeverCloud(settings);
            callback(null, true)
        } catch (error) {
            callback(error, null)
        }
    }


    pollSeverCloud(settings) {
        this.log("pollSeverCloud settings " +  JSON.stringify(settings));
        // let settings2 = this.getSettings();
        let name2 = 'zeversolar_plant_' + this.getData().id;
        this.log("pollSeverCloud device name " +  name2);
        // this.log("pollSeverCloud device settings " +  JSON.stringify(settings2));

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
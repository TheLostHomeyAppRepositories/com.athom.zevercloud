
(function () {

    // main settings
    var http = require('http.min');
    var options = {
        protocol: 'https:',
        hostname: 'www.zevercloud.com',
        path: '/dummy',
        headers: {
            'User-Agent': 'Node.js http.min',
            'Accept': 'application/json'
        }
    };

    var zevercloud = exports;

    // active functions()  -------------------------------------  active functions()  --------------------------------------------

    zevercloud.getTodayData = function getTodayData(settings) {
        console.log("node_modules settings " +  JSON.stringify(settings));
        let url = '/api/v1/getPlantOverview?key=' + settings["apikey"];

        return new Promise((resolve, reject) => {
            getData(url, (error, jsonobj) => {
                if (jsonobj) {
                    resolve(jsonobj);
                } else {
                    reject(error);
                }
            });
        });
    }

    function getData(url, callback) {
        options.path = url;
        console.log('node_modules url ' + url);
        http.json(options).then(data => {
                //this.log(data)
                return callback(null, data);
            })
            .catch(err => {
                console.log(`problem with request: ${err.message}`);
            });
    }

})();

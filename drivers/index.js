
(function () {

    // main settings
    const crypto = require('crypto');
    const https = require('http')

    var zevercloud = exports;

    // active functions()  -------------------------------------  active functions()  --------------------------------------------

    zevercloud.getTodayData = function getTodayData(settings) {
        console.log("node_modules settings " +  JSON.stringify(settings));
        
        var appSecret = settings["secret"]; 
        const appKey  = settings["appkey"];
        const apiKey  = settings["apikey"];
        
        const op = 'GET';
        const accept = 'application/json';
        const time = Date.now();
        
        const payload = op.concat('\n', accept,'\n\n\n',
                              '\nX-Ca-Key:', appKey,
                              '\nX-Ca-Timestamp:', time,
                              '\n/getPlantOverview?key=', apiKey );
        
        console.log(payload);
        
        const signedHeaders = "X-Ca-Signature-Headers: X-Ca-Key,X-Ca-Timestamp"
        
        let signature = crypto.createHmac('sha256', appSecret).update(payload).digest("base64")
        
        console.log(signature);
        
        const options = {
            protocol: 'http:',
            method: 'GET',
            headers: {
                'X-Ca-Timestamp': time,
                'Accept': accept,
                'X-Ca-Key': appKey,
                'X-Ca-Signature': signature,
                'X-Ca-Signature-Headers': 'X-Ca-Key,X-Ca-Timestamp'
            }
        }
        options.hostname = 'api.general.zevercloud.cn';
        options.path = '/getPlantOverview?key='+ apiKey;

        // let url = '/api/v1/getPlantOverview?key=' + settings["apikey"];

        return new Promise((resolve, reject) => {

            const reqX = https.request(options, resX => {
                console.log('-------------------');
                console.log(`statusCode: ${resX.statusCode}`);
                console.log(resX.headers);
            
                let body = "";
                let response = "";
                resX.on("data", data => {
                  body += data;
                });
                resX.on("end", () => {
                    // handle this
                    try {
                      response = JSON.parse(body.toString());
                    }
                    catch(error) {
                      response = "ERROR";
                    }
                    console.log(response);
                    resolve(response);
                });
            })  
            
            reqX.on('error', error => {
                console.error(error)
                reject(error);
            })
            reqX.end()

        });
    }
})();

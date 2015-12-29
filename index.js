var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
    baseUrl: 'https://www.googleapis.com/'
});

var pickInputs = {
        'homeMobileCountryCode': 'homeMobileCountryCode',
        'homeMobileNetworkCode': 'homeMobileNetworkCode',
        'radioType': 'radioType',
        'carrier': 'carrier',
        'considerIp': 'considerIp',
        'cellTowers': { key: 'cellTowers', type: 'array' },
        'wifiAccessPoints': { key: 'wifiAccessPoints', type: 'array' }
    },

    pickOutputs = {
        location: 'location',
        accuracy: 'accuracy'
    };

module.exports = {

    /**
     * Get auth data.
     *
     * @param step
     * @param dexter
     * @returns {*}
     */
    authOptions: function (step, dexter) {
        if (dexter.environment('google_server_key'))
            return dexter.environment('google_server_key');
        else
            return false;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var authKey = this.authOptions(step, dexter),
            uriLink = 'geolocation/v1/geolocate';
        if (!authKey)
            return this.fail('A [google_server_key] environment variable need for this module.');

        //send API request
        request.post({
            uri: uriLink,
            qs: { key: authKey },
            body: util.pickInputs(step, pickInputs),
            json: true
        }, function (error, response, body) {
            if (error)
                this.fail(error);

            else if (response && _.parseInt(response.statusCode) !== 200)
                this.fail(body);

            else if (body && body.error_message)
                this.fail(body.error_message);

            else
                this.complete(util.pickOutputs(body, pickOutputs));
        }.bind(this));
    }
};

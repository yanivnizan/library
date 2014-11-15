var Mixpanel = require('mixpanel');
var config = require('../config/environment');

module.exports = Mixpanel.init(config.mixpanel.mixpanelId);
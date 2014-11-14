var Mixpanel = require('mixpanel');

//'f67499876bf3970d8810d066550124fe');
module.exports = Mixpanel.init(process.env.MIXPANEL_ID);
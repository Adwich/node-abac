'use strict'

const callHOF = require('./high-order-function');
const HOF = ["anyOf", "allOf"];
const Validator = require('./validator');

module.exports.findHOF = function(t) {
    var x = HOF.slice();
    return x.filter(r => r in t);
}

module.exports.rabbit = function(t, s, r) {
    var goDown = this.findHOF(t),
        next = t[goDown[0]];
    if (Array.isArray(goDown) && goDown.length > 0 && goDown.length < 2) return callHOF[goDown[0]](next, s, r);
    else return Validator.validate(t, s, r);
}

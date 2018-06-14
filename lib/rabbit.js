'use strict'

const callHOF = require('./high-order-function');
const HOF = ["anyOf", "allOf"];
const Validator = require('./validator');

const findHOF = t => {
    var x = HOF.slice();
    // console.log('findHOF', t);
    return x.filter(r => r in t);
}

module.exports.rabbit = function(t, s, r) {
    console.log('rabbit entry', t);
    //  lvl++;
    var goDown = findHOF(t),
        next = t[goDown[0]];
    //console.log('rabbit', goDown);
    if (Array.isArray(goDown) && goDown.length > 0 && goDown.length < 2) return callHOF[goDown[0]](next, s, r);
    else return Validator.validate(t, s, r);
}

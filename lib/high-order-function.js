const Rabbit = require('./rabbit');
const filter = require('lodash/filter');
const isEmpty = require('lodash/isEmpty');
const includes = require('lodash/includes');

module.exports.anyOf = function(t, s, r) {
    var resp = [];

    if (Array.isArray(t)) {
        var i = 0;
        for (const f of t) {
            resp[i] = Rabbit.rabbit(f, s, r);
            i++;
        }
    } else if (typeof t === 'object') {
        var i = 0;
        Object.keys(t).forEach(k => {
            resp[i] = Rabbit.rabbit({
                [k]: t[k]
            }, s, r);
            i++;
        })
    }

    //Check if level under returned an array of false
    const reject = includes(resp, false);
    if (reject) return false;

    //Check if level under return an array of object containing result : false
    const denies = filter(resp, ['result', false]);
    if (isEmpty(denies)) return true;

    if (this._verbose_errors)
        return this._validator.formatDeny(rule_name, denies);

    return false;
}


module.exports.allOf = function(t, s, r) {
    var resp = [];

    if (Array.isArray(t)) {
        var i = 0;
        for (const f of t) {
            resp[i] = Rabbit.rabbit(f, s, r);
            i++;
        }
    } else if (typeof t === 'object') {
        var i = 0;
        Object.keys(t).forEach(k => {
            resp[i] = Rabbit.rabbit({
                [k]: t[k]
            }, s, r);
            i++;
        })
    }

    //Check if level under returned an array of false
    const reject = includes(resp, false);
    if (reject) return false;

    //Check if level under return an array of object containing result : false
    const denies = filter(resp, ['result', false]);
    if (isEmpty(denies)) return true;

    if (this._verbose_errors)
        return this._validator.formatDeny(rule_name, denies);

    return false;
}

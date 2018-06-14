const Rabbit = require('./rabbit');
const _ = require('lodash');

module.exports.anyOf = function(t, s, r) {
    // console.log('anyOf function', t);
    var resp = [];

    if (Array.isArray(t)) {
        var i = 0;
        for (const f of t) {
            // console.log('f', f)
            resp[i] = Rabbit.rabbit(f, s, r);
            i++;
        }
    } else if (typeof t === 'object') {
        var i = 0;
        Object.keys(t).forEach(k => {
            // console.log('for', k);
            resp[i] = Rabbit.rabbit({
                [k]: t[k]
            }, s, r);
            i++;
        })
    }
    console.log('resp anyOf', resp);

    if (resp.includes('allow')) return 'allow';
    else return 'deny';
}
module.exports.allOf = function(t, s, r) {
    // console.log('allOf function', t);
    var resp = [];

    if (Array.isArray(t)) {
        var i = 0;
        for (const f of t) {
            // console.log('f', f)
            resp[i] = Rabbit.rabbit(f, s, r);
            i++;
        }
    } else if (typeof t === 'object') {
        var i = 0;
        Object.keys(t).forEach(k => {
            // console.log('for', k);
            resp[i] = Rabbit.rabbit({
                [k]: t[k]
            }, s, r);
            i++;
        })
    }
    console.log('resp allOf', resp);

    const denies = _.filter(resp, ['result', false]);
    if (_.isEmpty(denies)) return true;

    if (this._verbose_errors)
        return this._validator.formatDeny(rule_name, denies);

    return false;

    //if (resp.includes('deny')) return 'deny';
    //else return 'allow';
}

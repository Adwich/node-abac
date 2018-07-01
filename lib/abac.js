'use strict';

// Load modules

const _ = require('lodash');
const Policy = require('./policy');
const Validator = require('./validator');
const Rabbit = require('./rabbit');

// Declare internals

const internals = {};

/**
 * @param {String[]|Object} policy_paths
 * @param {Boolean} verbose_errors
 * @param {Object} policy
 */
module.exports = internals.Abac = function(policy, verbose_errors = false) {
    if (_.isArray(policy))
        Policy.loadFile(policy);
    else if (_.isObject(policy))
        Policy.load(policy);
    else
        throw new Error('Invalid policy format, expected array of file paths or JSON object');

    this._validator = new Validator(Policy);
    this._verbose_errors = verbose_errors;
};

/**
 * @param {String} rule_name
 * @param {Object} subject
 * @param {Object} resource
 * @param {Boolean} verbose_error
 * @returns {Boolean}
 */
internals.Abac.prototype.enforce = function(rule_name, subject, resource = {}, verbose_error = false) {
    const rule = Policy.getRules()[rule_name];

    if (!rule) return console.log("not found");

    const validate_result = Rabbit.rabbit(rule, subject, resource);
    // console.log('result', validate_result);
    //const validate_result = this._validator.validate(rule_name, subject, resource);

    return validate_result;
};

/**
 * Return the user/resource attributes required to enforce a rule
 *
 * @param {String} rule_name
 * @returns {Object}
 */
internals.Abac.prototype.getRuleAttributes = function(rule_name) {
    const rule = Policy.getRules()[rule_name];
    //console.log('rule', JSON.stringify(rule, null, 4));

    let rule_attributes = {};

    const attributeRabbit = (t) => {
        var goDown = Rabbit.findHOF(t),
            next = t[goDown[0]];
        if (Array.isArray(goDown) && goDown.length > 0 && goDown.length < 2)
            return attributeRabbitMapper(next);
        else {
            const key = Object.keys(t)[0];
            const [entity, attribute] = key.split('.');
            const obj = t[Object.keys(t)[0]];

            if (!rule_attributes.hasOwnProperty(entity)) rule_attributes[entity] = [];

            if (!_.includes(rule_attributes[entity], attribute)) rule_attributes[entity].push(attribute);

            if (obj.hasOwnProperty("comparison_target")) {
                var compTarget = obj['comparison_target'],
                    field = obj['field'];
                if (!rule_attributes.hasOwnProperty(compTarget)) rule_attributes[compTarget] = [field];
                else rule_attributes[compTarget].push(field);
            }
        }
    }

    const attributeRabbitMapper = (t) => {
        //console.log('attributeRabbitMapper', JSON.stringify(t, null, 4))

        if (Array.isArray(t)) {
            for (const f of t) {
                //console.log('f', JSON.stringify(f, null, 4))
                attributeRabbit(f);
            }
        } else if (typeof t === 'object') {
            var i = 0;
            Object.keys(t).forEach(k => {
                //console.log('for', JSON.stringify(k, null, 4));
                attributeRabbit({
                    [k]: t[k]
                });

            })
        }
    }

    attributeRabbit(rule);

    if (_.keys(rule_attributes).length > 2)
        throw new Error('Rules can only apply to a maximum of one subject and one resource. "' + rule_name +
            '" requires ' + _.join(_.keys(rule_attributes), ', '));

    return rule_attributes;
};

/**
 * @param {Object} attributes
 * @returns {Object}
 */
internals.getAttributes = function(attributes) {
    let rule_attributes = {};

    _.forEach(attributes, (criteria, object_attribute) => {
        if (criteria.hasOwnProperty('field')) {
            if (!rule_attributes.hasOwnProperty(criteria.comparison_target))
                rule_attributes[criteria.comparison_target] = [];

            if (!_.includes(rule_attributes[criteria.comparison_target], criteria.field))
                rule_attributes[criteria.comparison_target].push(criteria.field);
        }

        let [object, attribute] = _.split(object_attribute, '.', 2);

        if (!rule_attributes.hasOwnProperty(object))
            rule_attributes[object] = [];

        if (!_.includes(rule_attributes[object], attribute))
            rule_attributes[object].push(attribute);
    });

    return rule_attributes;
};

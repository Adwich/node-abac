'use strict';

// Load modules

const isArray = require('lodash/isArray');
const isObject = require('lodash/isObject');
const includes = require('lodash/includes');
const keys = require('lodash/keys');
const join = require('lodash/join');

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
    if (isArray(policy))
        Policy.loadFile(policy);
    else if (isObject(policy))
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
    if (!rule) return "not found";
    const validate_result = Rabbit.rabbit(rule, subject, resource);
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

    let rule_attributes = {
        subject: {},
        resource: {}
    };

    const attributeRabbit = (t) => {
        var goDown = Rabbit.findHOF(t),
            next = t[goDown[0]];
        if (Array.isArray(goDown) && goDown.length > 0 && goDown.length < 2)
            return attributeRabbitMapper(next);
        else {
            const key = Object.keys(t)[0];
            const [entity, attribute] = key.split('.');
            const obj = t[Object.keys(t)[0]];

            // Add Entity to response object if not exists
            if (!rule_attributes.subject.hasOwnProperty(entity)) rule_attributes.subject[entity] = [];

            // Add attributes to entity if not existing
            if (!includes(rule_attributes.subject[entity], attribute)) rule_attributes.subject[entity].push(attribute);

            // Add a new entity if a comparison target exists
            if (obj.hasOwnProperty("comparison_target")) {
                var compTarget = obj['comparison_target'],
                    field = obj['field'];
                if (!rule_attributes.resource.hasOwnProperty(compTarget)) rule_attributes.resource[compTarget] = [field];
                else if (!includes(rule_attributes.resource[compTarget], field)) rule_attributes.resource[compTarget].push(field);
            }
        }
    }

    const attributeRabbitMapper = (t) => {
        if (Array.isArray(t))
            for (const f of t) attributeRabbit(f);
        else if (typeof t === 'object') {
            Object.keys(t).forEach(k => {
                attributeRabbit({
                    [k]: t[k]
                });
            })
        }
    }

    attributeRabbit(rule);

    if (keys(rule_attributes).length > 2)
        throw new Error('Rules can only apply to a maximum of one subject and one resource. "' + rule_name +
            '" requires ' + join(keys(rule_attributes), ', '));

    return rule_attributes;

};

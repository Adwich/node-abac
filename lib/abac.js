'use strict';

// Load modules

const _ = require('lodash');
const Policy = require('./policy');
const Validator = require('./validator');

// Declare internals

const internals = {};

/**
 * @param {String[]} policy_paths
 * @param {Object} policy
 */
module.exports = internals.Abac = function (policy_paths, policy)
{
    if (policy_paths)
        Policy.loadFile(policy_paths);
    else
        Policy.load(policy);

    this._validator = new Validator(Policy);
};

/**
 * @param {String} rule_name
 * @param {Object} subject
 * @param {Object} resource
 */
internals.Abac.prototype.enforce = function (rule_name, subject, resource = {})
{
    const validate_result = this._validator.validate(rule_name, subject, resource);

    const denies = _.filter(validate_result, ['result', false]);

    if (_.isEmpty(denies))
        return true;

    return this._validator.formatDeny(rule_name, denies);
};

/**
 * Return the user/resource attributes required to enforce a rule
 *
 * @param {String} rule_name
 * @returns {Object}
 */
internals.Abac.prototype.getRuleAttributes = function (rule_name)
{
    const rule = Policy.getRules()[rule_name];

    let rule_attributes = {};

    if (_.isArray(rule))
        _.forEach(rule, criteria => rule_attributes = _.merge(rule_attributes, internals.getAttributes(criteria.attributes)));
    else
        rule_attributes = internals.getAttributes(rule.attributes);

    if (rule.hasOwnProperty('rules'))
        _.forEach(rule.rules, sub_rule_name =>
        {
            const sub_rule_attributes = this.getRuleAttributes(sub_rule_name);

            _.forEach(sub_rule_attributes, (attributes, object) =>
            {
                if (!rule_attributes.hasOwnProperty(object))
                    rule_attributes[object] = [];

                rule_attributes[object] = _.uniq(_.concat(rule_attributes[object], attributes));
            });
        });

    if (_.keys(rule_attributes).length > 2)
        throw new Error('Rules can only apply to a maximum of one subject and one resource. "' + rule_name +
            '" requires ' + _.join(_.keys(rule_attributes), ', '));

    return rule_attributes;
};

/**
 * @param {Object} attributes
 * @returns {Object}
 */
internals.getAttributes = function (attributes)
{
    let rule_attributes = {};

    _.forEach(attributes, (criteria, object_attribute) =>
    {
        if (criteria.hasOwnProperty('field'))
        {
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
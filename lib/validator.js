'use strict';

// Load modules

const _ = require('lodash');
const Comparator = require('./comparator');

// Declare internals

const internals = {};

/**
 * @param {Policy} policy
 */
module.exports = internals.Validator = function(policy) {
    this._policy = policy;
};

/**
 * @param {Object} target
 * @param {Object} subject
 * @param {Object} resource
 * @return {Object[]}
 */
module.exports.validate = function(target, subject, resource) {


    var key = Object.keys(target)[0],
        object = target[key],
        criteria_value,
        field_value;
    const [entity, attribute] = key.split('.');

    const type = object.comparison_type,
        mode = object.comparison,
        object_value = subject[entity][attribute];

    if (object.hasOwnProperty('field')) {
        criteria_value = resource[object.comparison_target][object.field];
        field_value = criteria_value;
    } else criteria_value = object.value;

    var comparison_result = Comparator.compare(type, mode, object_value, criteria_value);

    var results = {
        criteria: key,
        field_value: field_value,
        result: comparison_result,
        subject: entity,
        subject_attribute: attribute,
        subject_value: object_value
    };

    return results;
};


/////////// NOT USED
/**
 * @param {String} rule_name
 * @param {Object[]} denies
 */
internals.Validator.prototype.formatDeny = function(rule_name, denies) {
    const error = {
            msg: rule_name + ' DENIED',
            errors: []
        },
        attributes = this._policy.getAttributes();

    _.forEach(denies, deny => {
        let expected;

        if (deny.criteria.hasOwnProperty('field'))
            expected = deny.field_value;
        else
            expected = deny.criteria.value;

        if (_.isArray(expected))
            expected = _.join(expected, '|');

        error.errors.push({
            msg: deny.criteria.comparison_type + ' value \'' + attributes[deny.subject][deny.subject_attribute] +
                '\' failed to pass ' + deny.criteria.comparison,
            expected: expected,
            actual: deny.subject_value
        });
    });

    return error;
};

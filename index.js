const AbacNode = require('./lib/abac');
const Abac = new AbacNode(['./abac-test.json']);

let subject = {
    user: {
        active: true,
        dob: '1991-05-12',
        banCount: 1,
        group: 12
    }
};

let resource = {
    group: {
        id: 12
    }
};

console.time('enforce');
const attributes = Abac.getRuleAttributes('test');
console.log('attributes', attributes);
const permit = Abac.enforce('test', subject, resource); // returns true
console.log('permit', permit);
console.timeEnd('enforce');
return permit;

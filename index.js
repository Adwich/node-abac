const AbacNode = require('./lib/abac');
const Abac = new AbacNode(['./policy.json']);

let subject = {
    user: {
        deleted: false,
        emailVerified: true,
        pwTemporary: false,
        twoFASet: true,
        group: [12]
    }
};

let resource = {
    group: {
        id: [12]
    }
};

console.time('enforce');
const attributes = Abac.getRuleAttributes('access-brand');
console.log(attributes);
const permit = Abac.enforce('access-brand', subject, resource); // returns true
console.log('permit', permit);
console.timeEnd('enforce');
return permit;

const AbacNode = require('./lib/abac');
const Abac = new AbacNode(['./abac-test.json']);

let subject = {
    user: {
        active: true,
        dob: '1991-05-12',
        banCount: 2,
        group: 12
    }
};

let resource = {
    group: {
        id: 12
    }
};

const permit = Abac.enforce('test', subject, resource); // returns true

var policy = {
    "access-user": {
        "allOf": [{
            "allOf": {
                "user.id": {
                    "answer": "allow",
                    "comparison_type": "string",
                    "comparison": "isStrictlyEqual",
                    "field": "id"
                },
                "user.group": {
                    "answer": "deny",
                    "comparison_target": "group",
                    "comparison_type": "array",
                    "comparison": "isIn",
                    "field": "id"
                }
            }
        }, {
            "user.POMME": {
                "answer": "allow",
                "comparison_type": "string",
                "comparison": "isStrictlyEqual",
                "field": "id"
            }
        }]
    }
}

const validate = (t, s, r) => {
    // console.log('validate', t, s, r);
    // console.log('val', Object.keys(t));
    var key = Object.keys(t),
        object = t[key];
    const [entity, attribute] = key[0].split('.');
    //TODO object comparison
    return object.answer;
}

const enforce = (t, s, r) => {
    var result;
    // console.log("rabbit start");
    if (t in policy) result = rabbit(policy[t], s, r);
    else console.log("not found");
    console.log('result', result);
}

enforce("access-user", 1, 2);

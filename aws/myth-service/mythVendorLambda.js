'use strict';

exports.get = async function(event, context, callback) {
    const data = [
        'first',
        'second',
    ];

    const mythIndex = Math.floor(Math.random() * data.length);
    const myth = data[mythIndex];

    var result = {
        statusCode: 200,
        body: JSON.stringify(myth),
        headers: {'content-type': 'text/json'}
    };

    callback(null, result);
}

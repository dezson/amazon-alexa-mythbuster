'use strict';

const AWS = require('aws-sdk');
AWS.config.update(
    {
         region: 'eu-west-1'
    }
);
const S3 = new AWS.S3();

const MYTHS_KEY = "myths.json";


exports.get = async function(event, context, callback) {
    const data = await getS3Object(process.env.S3BucketName, MYTHS_KEY);

    const mythIndex = Math.floor(Math.random() * data.length);
    const myth = data[mythIndex];

    var result = {
        statusCode: 200,
        body: JSON.stringify(myth),
        headers: {'content-type': 'text/json'}
    };

    callback(null, result);
}

function getS3Object(bucketName, key) {
    const params = {
        Bucket: bucketName,
        Key: key
    };
    return new Promise((resolve, reject) => {
        S3.getObject(params,  function(err, data) {
            if (err) {
                console.log(err, err.stack);
                reject(err);
            }

            const objectData = data.Body.toString();
            resolve(JSON.parse(objectData));
         });
     });
}
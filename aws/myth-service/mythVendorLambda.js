"use strict";

const AWS = require("aws-sdk");
AWS.config.update({
  region: "eu-west-1",
});
const S3 = new AWS.S3();
const MYTHS_KEY = "myths.json";

exports.get = async function (event, context, callback) {
  const data = await getS3Object(process.env.S3BucketName, MYTHS_KEY);

  const mythIndex = Math.floor(Math.random() * data.length);
  const mythItem = data[mythIndex];

  if (mythItem.length != 3) {
    console.log(`Error! Invalid length of data: ${mythItem}`);

    var errorResp = {
      statusCode: 500,
      body: "Invalid data",
      headers: { "content-type": "text/json" },
    };
    callback(null, errorResp);
  }

  var resp = { statement: mythItem[0], answer: mythItem[1], explanation: mythItem[0] };

  var result = {
    statusCode: 200,
    body: JSON.stringify(resp),
    headers: { "content-type": "text/json" },
  };

  callback(null, result);
};

function getS3Object(bucketName, key) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  return new Promise((resolve, reject) => {
    S3.getObject(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      }

      const objectData = data.Body.toString();
      resolve(JSON.parse(objectData));
    });
  });
}

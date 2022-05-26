const dotenv = require('dotenv');
const aws = require('aws-sdk');
// import { DeleteObjectCommand } from "@aws-sdk/client-s3";
const {deleteObjectCommand} = require('aws-sdk');
const crypto = require('crypto');
const { promisify } = require('util');

const randomBytes = promisify(crypto.randomBytes);

dotenv.config()

const region = "us-east-1";
const bucket = "bookstagram";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region, 
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4'
});

exports.generateUploadURL = async function() {
  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString('hex');

  const params = ({
    Bucket: bucket,
    Key: imageName,
    Expires: 60
  })

  const uploadURL = await s3.getSignedUrlPromise('putObject', params);

  return [imageName, uploadURL]
}

exports.deleteObject = function(key) {

  const params = ({
    Bucket: bucket,
    Key: key
  })

  s3.deleteObject(params, function(err, data) {
  if (err) {  // an error occurred
    console.log(err, err.stack)
  } else { // successful response
    console.log(data)
  };
  // const data = await s3.send(new deleteObjectCommand(params));
  // console.log("Success. Object deleted.");
  })
  return 'Photo has been deleted';

}
// async function deleteObject(key) {
  
// }

// async function generateUploadURL() {
  
//   const rawBytes = await randomBytes(16);
//   const imageName = rawBytes.toString('hex');

//   const params = ({
//     Bucket: bucket,
//     Key: imageName,
//     Expires: 60
//   })

//   const uploadURL = await s3.getSignedUrlPromise('putObject', params);

//   return [imageName, uploadURL]
// }


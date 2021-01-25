var express = require('express');
var app = express();
var util = require('util');
var exec = util.promisify(require('child_process').exec);
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var Archiver = require('archiver');
var AWS = require("aws-sdk");
var axios = require("axios");
var Stream = require("stream");
var accessKeyId =  "";
var secretAccessKey = "";
var key = fs.readFileSync('../selfsigned.key');
var cert = fs.readFileSync('../selfsigned.crt');
var options = {
key: key,
cert: cert};
AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});
var s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: 'eu-central-1'
});

async function shellExec(id){

await exec(`aws s3 sync s3://fileable-quick-transfer/${id} ${id}`);
await exec(`zip -r ${id}.zip ${id}`);
await exec(`aws s3 cp ${id}.zip s3://fileable-quick-transfer/zipped/${id}.zip`);
await exec(`rm -r ${id}.zip ${id}`);
return "done";
}
app.get('/download', async function (request, response) {
  
     var params = request.query.downloadFiles;
var res = await shellExec(params);
 response.json({ zipped: 'true' })  
 });

var server = https.createServer(options,app);
server.listen(3000,'0.0.0.0',()=>{
  console.log('listening on port 3000');
});

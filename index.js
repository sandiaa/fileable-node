var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var Archiver = require('archiver');
var AWS = require("aws-sdk");
var axios = require("axios");
//var createReadStream = require("fs");
var Stream = require("stream");
var accessKeyId =  "";
var secretAccessKey = "";

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});
var s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: 'eu-central-1'
});

app.get('/download', async function (request, response) {
  
     var params = request.query.downloadFiles;
   
     const res = await axios.get(`https://wlebqx4mhj.execute-api.us-east-1.amazonaws.com/quickTransfer/getFilesByLink?sessionId=${params}`);
    const fileList = res.data.fileList ;
    
         const s3FileDwnldStreams = fileList.map(item => {
     
        const stream = s3.getObject({ Bucket: 'fileable-quick-transfer',Key: `${params}/${item.name}`}).createReadStream();
        return {
          stream,
          fileName: item.name,
        };
      });

      const streamPassThrough = new Stream.PassThrough();
     
    var filename = 'fileable.zip';
  
    response.attachment(filename);
  
    const zip = Archiver("zip",{
        zlib: { level: 1 }
    });
     
    zip.on('finish', function(error) {
      return response.end();
    });
    zip.pipe(response);
    s3FileDwnldStreams.forEach(s3FileDwnldStream => {
      zip.append(s3FileDwnldStream.stream, {
        name: s3FileDwnldStream.fileName,
      });
    });
  
    zip.finalize();
  });


app.listen(3000,'0.0.0.0',()=>{
  console.log('listening on port 3000');
});
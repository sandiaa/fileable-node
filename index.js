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

app.post('/download', function (request, response) {
  console.log("app is running") ;
     var params = request.body.files;
//     var params = [{key: "ef964860-9799-40cf-975f-73a13c7a9ab0/AnyDesk (3) (1) (1).exe",
// name: "AnyDesk (3) (1) (1).exe"},{
//     key: "ef964860-9799-40cf-975f-73a13c7a9ab0/uploading (1) (3) (1) (2).svg",
//     name:"uploading (1) (3) (1) (2).svg"
// },
// {
//     key: "ef964860-9799-40cf-975f-73a13c7a9ab0/copyright-symbol (1).svg",
//     name: "copyright-symbol (1).svg"
// },
// {
//     key:"ef964860-9799-40cf-975f-73a13c7a9ab0/python-2.7.18.amd64.msi",
//     name:"python-2.7.18.amd64.msi"
// }
//     ];
    const s3FileDwnldStreams = params.map(item => {
        const stream = s3.getObject({ Bucket: 'fileable-quick-transfer',Key: item.key }).createReadStream();
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


app.listen(3000);
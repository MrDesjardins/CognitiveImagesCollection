import * as g from "glob";
import * as path from "path";
import * as sharp from "sharp";
import * as fs from "fs";
import * as querystring from "querystring";
import * as http from "http";
import * as request from "request";
import * as formData from "form-data";

import * as streamBuffers from "stream-buffers";
import * as stream from "stream";

import { endPointURL } from "../../../config";
import { key1, localDirectory } from "../../../secret";

// 1- Get list of images
// const imagesDirectory = localDirectory;
// const pathImagesDirectory = path.join(imagesDirectory, "**/*.+(jpg|JPG2)");
// console.log("Step 1 : Getting files " + pathImagesDirectory);
// const glob = new g.Glob(pathImagesDirectory, (err: Error, matches: string[]) => {
//     matches.forEach(file => {
//         console.log(file);
//     });
// });

// 2 - Resize
console.log("Resize");
const file = localDirectory + "/jpg/PAT_4202.JPG";
const maxSize = 640;
const sharpFile = sharp(file);
sharpFile.metadata()
    .then((metadata: sharp.Metadata) => {
        const actualWidth = metadata.width;
        const actualHeight = metadata.height;
        let ratio = 1;
        if (actualWidth > actualHeight) {
            ratio = actualWidth / maxSize;
        } else {
            ratio = actualHeight / maxSize;
        }
        const newHeight = Math.round(actualHeight / ratio);
        const newWidth = Math.round(actualWidth / ratio);
        return sharpFile
            .resize(newWidth, newHeight)
            .webp()
            .toFile("d:\\todelete.jpg");
        //.toBuffer();
    })
    .then(() => {
        analyzeRequest(null);
    })
    ;//.then(function (data: Buffer) {
//     // const fileDescriptor = fs.openSync("d:\\todelete.jpg", 'w', 666);
//     // fs.writeSync(fileDescriptor, data, 0, data.length, 0);
//     analyzeRequest(data);
// });


function analyzeRequest(data: Buffer): void {
    console.log("AnalyzeRequest");
    const urlAzure = endPointURL + "/analyze?visualFeatures=Categories,Tags,Description,Faces,Color&details=Landmarks&language=en";

    console.log("Url : " + urlAzure);
    console.log("Key : " + key1);
    var req = request({
        url: urlAzure,
        encoding: "binary",
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
            "Host": "westus.api.cognitive.microsoft.com",
            "Ocp-Apim-Subscription-Key": key1
        }
    }, function (error, response, body) {
        console.log("error: " + error);
        //console.log(response);
        console.log(body);
        console.log("Done");
    });
    var form = req.form();
    form.append('file', fs.createReadStream("d:\\todelete.jpg"));

}
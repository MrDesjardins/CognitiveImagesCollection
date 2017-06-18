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
import { IImage } from "./IImage";

const maxSize = 640;
const directoryName = "metainfo";
const maxRequestPerSecond = 10;
const waitingPeriodInMs = 1500; // 10 requests per second

let fullPathFiles: string[] = [];
// 1- Get list of images
const imagesDirectory = localDirectory;
const pathImagesDirectory = path.join(imagesDirectory, "**/_*.+(jpg|JPG2)");
console.log("Step 1 : Getting files " + pathImagesDirectory);
const glob = new g.Glob(pathImagesDirectory, { ignore: "**/" + directoryName + "/**" } as g.IOptions, (err: Error, matches: string[]) => {
    matches.forEach(file => {
        console.log(file);
        fullPathFiles.push(file);
    });

    resize(fullPathFiles);
});

const imagesReadyToBeAnalyzed: IImage[] = [];

// 2 - Resize
function resize(files: string[]): void {
    console.log(`Resize ${files.length} files`);
    for (let i = 0; i < fullPathFiles.length; i++) {
        const thumb = getThumbnailPathAndFileName(fullPathFiles[i]);
        if (fs.existsSync(thumb)) {
            console.log("Thumbnail already exist, skip");
            imagesReadyToBeAnalyzed.push({ thumbnailPath: thumb, originalFullPathImage: files[i] } as IImage);
        } else {
            resizeImage(fullPathFiles[i])
                .then((image: IImage) => {
                    imagesReadyToBeAnalyzed.push(image);
                });
        }
    }
}


function resizeImage(imageToProceed: string): Promise<IImage> {
    const sharpFile = sharp(imageToProceed);
    return sharpFile.metadata()
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
            const promiseToGetAnalyze = new Promise<IImage>((resolve, reject) => {
                const thumbnailPath = getThumbnailPathAndFileName(imageToProceed);
                // Create directory thumbnail first
                const dir = getMetainfoDirectoryPath(imageToProceed);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                const promise = sharpFile
                    .resize(newWidth, newHeight)
                    .webp()
                    .toFile(thumbnailPath)
                    ;
                promise.then((image: sharp.OutputInfo, ) => {
                    console.log("resizeImage successful");
                    resolve();
                }, (reason: any) => {
                    console.error(reason);
                });
            });
            return promiseToGetAnalyze;
        });
}

function getMetainfoDirectoryPath(imageFullPath: string): string {
    const onlyPath = path.dirname(imageFullPath);
    const imageFilename = path.parse(imageFullPath);
    const thumbnail = path.join(onlyPath, "/"+directoryName+"/");
    return thumbnail;
}

function getThumbnailPathAndFileName(imageFullPath: string): string {
    const dir = getMetainfoDirectoryPath(imageFullPath);
    const imageFilename = path.parse(imageFullPath);
    const thumbnail = path.join(dir, imageFilename.base);
    return thumbnail;
}

function getJsonImageinfoPathAndFileName(thumbnailPath: string): string {
    var onlyPath = path.dirname(thumbnailPath);
    var imageFilename = path.parse(thumbnailPath);
    var info = path.join(onlyPath, imageFilename.name) + ".json";
    return info;
}

// 3- Azure Analyze 
let batchTimeInMs: number = new Date().getTime();
let numberOfImageProceeded = 0;
function batchImagesAnalyse(): void {
    console.log(`batchImagesAnalyse has ${imagesReadyToBeAnalyzed.length} in queue`);
    setTimeout((imagesReadyToBeAnalyzed: IImage[]) => {
        console.log(imagesReadyToBeAnalyzed);
        while (imagesReadyToBeAnalyzed.length > 0 && numberOfImageProceeded < Math.min(imagesReadyToBeAnalyzed.length, maxRequestPerSecond)) {
            const image = imagesReadyToBeAnalyzed.splice(imagesReadyToBeAnalyzed.length - 1, 1)[0];
            if (analyzeRequest(image)) {
                numberOfImageProceeded++;
            }
        }

        numberOfImageProceeded = 0;
        batchImagesAnalyse();

    }, waitingPeriodInMs, imagesReadyToBeAnalyzed);
}


batchImagesAnalyse();


function analyzeRequest(data: IImage): boolean {
    const pathToSave = getJsonImageinfoPathAndFileName(data.thumbnailPath);
    if (fs.existsSync(pathToSave)) {
        console.log(`Skip analysis of ${data.thumbnailPath} because json already exist.`);
        return false;
    }
    const urlAzure = endPointURL + "/analyze?visualFeatures=Categories,Tags,Description,Faces,Color&details=Landmarks&language=en";
    var req = request({
        url: urlAzure,
        encoding: "binary",
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
            "Host": "westus.api.cognitive.microsoft.com",
            "Ocp-Apim-Subscription-Key": key1
        }
    }, (error, response, body) => {
        if (error) {
            console.error(error);
        } else {
            console.log(body);

            fs.writeFile(pathToSave, body, (err) => {
                if (err) {
                    return console.error(err);
                }
            });
        }
    });
    var form = req.form();
    form.append('file', fs.createReadStream(data.thumbnailPath));
    return true;
}
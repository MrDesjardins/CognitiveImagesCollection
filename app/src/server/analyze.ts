import * as g from "glob";
import * as path from "path";
import * as sharp from "sharp";
import * as fs from "fs";
import * as request from "request";

import { endPointURL } from "../../../config";
import { key1, localDirectory } from "../../../secret";
import { IImage } from "./IImage";

// ============== Configuration Constants =============
const maxSize = 640;
const directoryName = "metainfo";
const maxRequestPerSecond = 10;
const waitingPeriodInMs = 1500; // 10 requests per second
const imagesDirectory = localDirectory;
const pathImagesDirectory = path.join(imagesDirectory, "**/_*.+(jpg|JPG2)");

// =============== Global data variables ===============

let numberOfImageProceeded = 0;

function getImageToAnalyze(): Promise<string[]> {
    const fullPathFiles: string[] = [];
    const promise = new Promise<string[]>((resolve, reject) => {
        const glob = new g.Glob(pathImagesDirectory, { ignore: "**/" + directoryName + "/**" } as g.IOptions, (err: Error, matches: string[]) => {
            matches.forEach(file => {
                console.log(file);
                fullPathFiles.push(file);
            });
            resolve(fullPathFiles);
        });
    });
    return promise;
}

function resize(fullPathFiles: string[]): Promise<IImage[]> {
    const queue: IImage[] = [];
    const promise = new Promise<IImage[]>((resolve, reject) => {
        for (const imagePathFile of fullPathFiles) {
            const thumb = getThumbnailPathAndFileName(imagePathFile);
            if (fs.existsSync(thumb)) {
                queue.push({ thumbnailPath: thumb, originalFullPathImage: imagePathFile } as IImage);
            } else {
                resizeImage(imagePathFile)
                    .then((image: IImage) => {
                        queue.push(image);
                    });
            }
        }
        resolve(queue);
    });
    return promise;
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
    const thumbnail = path.join(onlyPath, "/" + directoryName + "/");
    return thumbnail;
}

function getThumbnailPathAndFileName(imageFullPath: string): string {
    const dir = getMetainfoDirectoryPath(imageFullPath);
    const imageFilename = path.parse(imageFullPath);
    const thumbnail = path.join(dir, imageFilename.base);
    return thumbnail;
}

function getJsonImageinfoPathAndFileName(thumbnailPath: string): string {
    const onlyPath = path.dirname(thumbnailPath);
    const imageFilename = path.parse(thumbnailPath);
    const info = path.join(onlyPath, imageFilename.name) + ".json";
    return info;
}

function batchImagesAnalyse(imagesReadyToBeAnalyzed: IImage[]): void {
    setTimeout((images: IImage[]) => {
        while (images.length > 0 && numberOfImageProceeded < Math.min(images.length, maxRequestPerSecond)) {
            const image = images.splice(images.length - 1, 1)[0];
            if (analyzeRequest(image)) {
                numberOfImageProceeded++;
            }
        }
        numberOfImageProceeded = 0;
        batchImagesAnalyse(images);
    }, waitingPeriodInMs, imagesReadyToBeAnalyzed);
}

function analyzeRequest(data: IImage): boolean {
    const pathToSave = getJsonImageinfoPathAndFileName(data.thumbnailPath);
    if (fs.existsSync(pathToSave)) {
        return false;
    }

    const urlAzure = endPointURL + "/analyze?visualFeatures=Categories,Tags,Description,Faces,Color&details=Landmarks&language=en";
    const req = request({
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
            fs.writeFile(pathToSave, body, (err) => {
                if (err) {
                    return console.error(err);
                }
            });
        }
    });
    const form = req.form();
    form.append("file", fs.createReadStream(data.thumbnailPath));
    return true;
}

// 1- Get list of images
console.log("Step 1 : Getting files " + pathImagesDirectory);
getImageToAnalyze()
    .then((fullPathFiles: string[]) => {
        // 2- Resize (and save)
        console.log("Step 2 : Resize " + fullPathFiles.length + " files");
        return resize(fullPathFiles);
    }).then((images: IImage[]) => {
        // 3- Analyze (and save)
        console.log("Step 3 : Analyze " + images.length + " files");
        batchImagesAnalyse(images);
    });

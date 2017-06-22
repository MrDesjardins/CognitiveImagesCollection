import * as g from "glob";
import * as path from "path";
import * as sharp from "sharp";
import * as fs from "fs";
import * as request from "request";

import { visionEndpointURL, imageGroupId, faceEndpointURL } from "../../../config";
import { computerVisionKey, localDirectory, faceApiKey, personIdToDisplayName } from "../../../secret";
import { IImage } from "./IImage";

// ============== Configuration Constants =============
const maxSize = 640;
const directoryName = "metainfo";
const maxRequestPerSecond = 10;
const waitingPeriodInMs = 1500; // 10 requests per second
const imagesDirectory = localDirectory;
const pathImagesDirectory = path.join(imagesDirectory, "**/_*.+(jpg|JPG)");

// =============== Global data variables ===============



function getImageToAnalyze(): Promise<string[]> {
    const fullPathFiles: string[] = [];
    const promise = new Promise<string[]>((resolve, reject) => {
        const glob = new g.Glob(pathImagesDirectory, { ignore: "**/" + directoryName + "/**" } as g.IOptions, (err: Error, matches: string[]) => {
            matches.forEach((file: string) => {
                console.log(file);
                fullPathFiles.push(file);
            });
            resolve(fullPathFiles);
        });
    });
    return promise;
}

function resize(fullPathFiles: string[]): Promise<IImage[]> {
    const listPromises: Promise<IImage>[] = [];
    const promise = new Promise<IImage[]>((resolve, reject) => {
        for (const imagePathFile of fullPathFiles) {
            const thumb = getThumbnailPathAndFileName(imagePathFile);
            if (fs.existsSync(thumb)) {
                listPromises.push(Promise.resolve({ thumbnailPath: thumb, originalFullPathImage: imagePathFile } as IImage));
            } else {
                listPromises.push(resizeImage(imagePathFile));
            }
        }
        Promise.all(listPromises)
            .then((value: IImage[]) => resolve(value));
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
            const thumbnailPath = getThumbnailPathAndFileName(imageToProceed);
            // Create directory thumbnail first
            const dir = getMetainfoDirectoryPath(imageToProceed);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            return sharpFile
                .resize(newWidth, newHeight)
                .webp()
                .toFile(thumbnailPath)
                .then((image: sharp.OutputInfo, ) => {
                    return { thumbnailPath: thumbnailPath, originalFullPathImage: imageToProceed } as IImage;
                });
        }, (reason: any) => {
            console.error(reason);
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

function getJsonVisionInfoPathAndFileName(thumbnailPath: string): string {
    const onlyPath = path.dirname(thumbnailPath);
    const imageFilename = path.parse(thumbnailPath);
    const info = path.join(onlyPath, imageFilename.name + "_vision") + ".json";
    return info;
}

let numberOfImageProceeded = 0;
function batchImagesVisionAnalyzeWrapper(imagesReadyToBeAnalyzed: IImage[]): Promise<IImage[]> {
    const copyImages = imagesReadyToBeAnalyzed.slice();
    const promise = new Promise((resolve, reject) => {
        batchImagesVisionAnalyze(imagesReadyToBeAnalyzed, () => {
            resolve(copyImages);
        });
    });
    return promise;
}
function batchImagesVisionAnalyze(imagesReadyToBeAnalyzed: IImage[], done: () => void): void {
    setTimeout((images: IImage[]) => {
        while (images.length > 0 && numberOfImageProceeded < Math.min(images.length, maxRequestPerSecond)) {
            const image = images.splice(images.length - 1, 1)[0];
            if (analyzeVisionRequest(image)) {
                numberOfImageProceeded++;
            }
        }
        if (images.length !== 0) {
            numberOfImageProceeded = 0;
            batchImagesVisionAnalyze(images, done);
        } else {
            done();
        }
    }, waitingPeriodInMs, imagesReadyToBeAnalyzed);
}

function analyzeVisionRequest(data: IImage): boolean {
    const pathToSave = getJsonVisionInfoPathAndFileName(data.thumbnailPath);
    if (fs.existsSync(pathToSave)) {
        return false;
    }

    const urlAzure = visionEndpointURL + "/analyze?visualFeatures=Categories,Tags,Description,Faces,Color&details=Landmarks&language=en";
    const req = fs.createReadStream(data.thumbnailPath).pipe(request({
        url: urlAzure,
        encoding: "binary",
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
            "Host": "westus.api.cognitive.microsoft.com",
            "Ocp-Apim-Subscription-Key": computerVisionKey
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
    }));

    return true;
}


let numberOfImageVisionProceeded = 0;
function batchImagesFacesEmotionsAnalyze(imagesReadyToBeAnalyzed: IImage[], imageGroupId: string): void {
    setTimeout((images: IImage[]) => {
        while (images.length > 0 && numberOfImageVisionProceeded < Math.min(images.length, maxRequestPerSecond)) {
            const image = images.splice(images.length - 1, 1)[0];
            analyzeFaceRequest(image)
                .then((result: any) => {
                    analyzeFaceDetectionRequest(image, imageGroupId, JSON.parse(result));
                })
                .catch(() => {
                    numberOfImageVisionProceeded--;
                    const dataFromFile = fs.readFileSync(getJsonFaceInfoPathAndFileName(image.thumbnailPath), "utf8");
                    analyzeFaceDetectionRequest(image, imageGroupId, JSON.parse(dataFromFile));
                });
            numberOfImageVisionProceeded++;
        }
        if (images.length !== 0) {
            numberOfImageVisionProceeded = 0;
            batchImagesFacesEmotionsAnalyze(images, imageGroupId);
        }
    }, waitingPeriodInMs, imagesReadyToBeAnalyzed);
}


function getJsonFaceInfoPathAndFileName(thumbnailPath: string): string {
    const onlyPath = path.dirname(thumbnailPath);
    const imageFilename = path.parse(thumbnailPath);
    const info = path.join(onlyPath, imageFilename.name + "_faces") + ".json";
    return info;
}


function analyzeFaceRequest(data: IImage): Promise<any> {
    const pathToSave = getJsonFaceInfoPathAndFileName(data.thumbnailPath);
    if (fs.existsSync(pathToSave)) {
        return Promise.reject("No Need to analyze, already analyzed");
    }
    const promise = new Promise<any>((resolve, reject) => {
        const urlAzure = faceEndpointURL + `/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair,accessories`;
        console.log(urlAzure);
        const req = fs.createReadStream(data.thumbnailPath).pipe(request({
            url: urlAzure,
            method: "POST",
            encoding: "binary",
            headers: {
                "Content-Type": "application/octet-stream",
                "Host": "westus.api.cognitive.microsoft.com",
                "Ocp-Apim-Subscription-Key": faceApiKey
            }
        }, (error, response, body) => {
            if (error) {
                console.error(error);
            } else {
                // console.log("analyzeFaceRequest > " + pathToSave + " : " + body);
                fs.writeFile(pathToSave, body, (err) => {
                    if (err) {
                        return console.error(err);
                    }
                });
                resolve(body);
            }
        }));
    });

    return promise;
}




function getJsonFaceDetectionInfoPathAndFileName(thumbnailPath: string): string {
    const onlyPath = path.dirname(thumbnailPath);
    const imageFilename = path.parse(thumbnailPath);
    const info = path.join(onlyPath, imageFilename.name + "_facesdetection") + ".json";
    return info;
}


function analyzeFaceDetectionRequest(data: IImage, imageGroupId: string, detectPayload: any): Promise<any> {
    console.log(detectPayload);
    const pathToSave = getJsonFaceDetectionInfoPathAndFileName(data.thumbnailPath);
    if (fs.existsSync(pathToSave)) {
        console.log("Dectection already exist for " + pathToSave);
        return Promise.reject("Face Detection Already Occurred. No need to analyze again. Skipping.");
    }

    const promise = new Promise<any>((resolve, reject) => {
        const arrayIds = (detectPayload as any[]).map((entry) => entry.faceId);
        const urlAzure = faceEndpointURL + `/identify`;
        console.log(urlAzure);
        request({
            url: urlAzure,
            method: "POST",
            json: {
                personGroupId: imageGroupId,
                faceIds: arrayIds,
                maxNumOfCandidatesReturned: 3,
                confidenceThreshold: 0.5
            },
            headers: {
                "Content-Type": "application/json",
                "Host": "westus.api.cognitive.microsoft.com",
                "Ocp-Apim-Subscription-Key": faceApiKey
            }
        }, (error, response, body) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                const dataToPersist: any[] = [];

                for (let i = 0; i < body.length; i++) {
                    let displayNameFromDetection = "Unknown";
                    let personId = "-1";
                    let faceId = body[i].faceId;
                    if (body[i].candidates.length) {
                        displayNameFromDetection = personIdToDisplayName[body[i].candidates[0].personId];
                        personId = body[i].candidates[0].personId;
                        faceId = body[i].faceId;
                    }
                    dataToPersist[i] = { displayName: displayNameFromDetection, personId: personId, faceId: faceId };
                }
                if (error) {
                    console.error(error);
                } else {
                    const toSaveString = JSON.stringify(dataToPersist);
                    fs.writeFile(pathToSave, toSaveString, (err) => {
                        if (err) {
                            return console.error(err);
                        }
                    });
                }
                resolve(body);
            }
        });
    });
    return promise;
}



console.log("Step 1 : Getting images to analyze " + pathImagesDirectory);
getImageToAnalyze()
    .then((fullPathFiles: string[]) => {
        console.log("Step 2 : Resize " + fullPathFiles.length + " files");
        return resize(fullPathFiles);
    })
    .then((images: IImage[]) => {
        console.log("Step 3 : Vision Analyze " + images.length + " files");
        return batchImagesVisionAnalyzeWrapper(images);
    })
    .then((images: IImage[]) => {
        console.log("Step 4 : Faces Analyze + Detection " + images.length + " files");
        return batchImagesFacesEmotionsAnalyze(images, imageGroupId);
    });
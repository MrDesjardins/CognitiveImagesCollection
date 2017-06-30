import * as g from "glob";
import * as path from "path";
import * as sharp from "sharp";
import * as fs from "fs";
import * as request from "request";

import { visionEndpointURL, faceEndpointURL, imageGroupId, imageGroupDisplayName } from "../../../config";
import { computerVisionKey, localDirectory, trainDirectory, faceApiKey } from "../../../secret";
import { IImage } from "./IImage";
import { IPerson } from "./IPerson";

const maxRequestPerSecond = 5;
const waitingPeriodInMs = 2000;

// Mainly use this C# steps but with NodeJs : https://docs.microsoft.com/en-us/azure/cognitive-services/face/face-api-how-to-topics/howtoidentifyfacesinimage

// 1- Get training set of people. 1 directory from the source path is 1 person. For example,
// if this folder has 3 directories, it means 3 people in this group
function getDirectories(srcpath: string) {
    return fs.readdirSync(srcpath)
        .filter((file: string) => fs.lstatSync(path.join(srcpath, file)).isDirectory())
}

const peopleDirectoryName = getDirectories(trainDirectory);

createFaceList(imageGroupId, imageGroupDisplayName)
    .then(() => forAllPeopleLocallyCreateCloudPerson())
    .then((people: IPerson[]) => forAllCloudPeopleAddFaces(people))
    .then(() => trainModelToRecognizePeople(imageGroupId));

function forAllPeopleLocallyCreateCloudPerson(): Promise<IPerson[]> {
    const promise = new Promise<IPerson[]>((resolve, reject) => {
        const listPerson: IPerson[] = [];
        for (const person of peopleDirectoryName) {
            const fullPathPersonImages = path.join(trainDirectory, person);
            fs.readdir(fullPathPersonImages, (err, files: string[]) => {
                createPersonToFacelist(imageGroupId, person).then((personWithId: IPerson) => {
                    personWithId.trainingImagesPathFileName = files;
                    listPerson.push(personWithId);
                });
            })
        }
        resolve(listPerson);
    });

    return promise;
}

function forAllCloudPeopleAddFaces(people: IPerson[]): Promise<void> {
    const addFacesPromise = new Promise<void>((resolve, reject) => {
        // Add photos for each person sequencially (because of API limit request)
        batchAddFacesToPerson(imageGroupId, people, () => {
            resolve();
        }, true);
    });
    return addFacesPromise
}

function batchAddFacesToPerson(imageGroupId: string, people: IPerson[], done: () => void, doNext: boolean): void {
    console.log(`batchAddFacesToPerson for group ${imageGroupId} and people array length is ${people.length}`);
    setTimeout((remainingPeople: IPerson[]) => {
        if (remainingPeople.length === 0) {
            done();
        } else {
            if (doNext) {
                const person = remainingPeople.splice(remainingPeople.length - 1, 1)[0];
                addFacesToPerson(imageGroupId, person)
                    .then(() => {
                        batchAddFacesToPerson(imageGroupId, people, done, true);
                    });
            } else {
                batchAddFacesToPerson(imageGroupId, people, done, false);
            }
        }
    }, waitingPeriodInMs, people);
}

// https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395244
function createFaceList(personGroupId: string, groupDisplayName: string): Promise<void> {
    console.log(`createFaceList for person group id ${personGroupId} with the display name ${groupDisplayName}`);
    const promise = new Promise<void>((resolve, reject) => {
        const urlAzure = faceEndpointURL + "/persongroups/" + personGroupId;
        console.log(urlAzure);
        const req = request({
            url: urlAzure,
            method: "PUT",
            json: { name: groupDisplayName },
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": faceApiKey
            }
        }, (error, response, body) => {
            if (error) {
                console.error(error);
                reject();
            } else {
                console.log(body);
                resolve();
            }
        });
    });

    return promise;
}
// https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f3039523c
function createPersonToFacelist(personGroupId: string, personDisplayName: string): Promise<IPerson> {
    console.log(`createPersonToFacelist for group id ${personGroupId} will add this person display name ${personDisplayName}`);
    const promise = new Promise<IPerson>((resolve, reject) => {
        const urlAzure = faceEndpointURL + `/persongroups/${personGroupId}/persons`;
        console.log(urlAzure);
        const req = request({
            url: urlAzure,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": faceApiKey
            },
            json: { name: personDisplayName }
        }, (error, response, body) => {
            if (error) {
                console.error(error);
                reject();
            } else {
                console.log(body);
                resolve({
                    displayName: personDisplayName,
                    personId: body.personId
                } as IPerson);
            }
        });
    });

    return promise;
}

// https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f3039523b
function addFacesToPerson(personGroupId: string, person: IPerson): Promise<void> {
    console.log(`addFaceToPerson for group id ${personGroupId} will add this person display name ${person.displayName}`);
    const promise = new Promise<void>((resolve, reject) => {
        batchAddFacesToPersonImage(personGroupId, person.personId, person.trainingImagesPathFileName, () => { resolve(); }, true);
    });
    return promise;
}

let numberOfRequestSent = 0;
let numberOfResponseReceived = 0;
function batchAddFacesToPersonImage(personGroupId: string, personId: string, imagesFullPath: string[], done: () => void, doNext: boolean): void {
    console.log(`batchAddFacesToPersonImage for group id ${personGroupId} and person ${personId} for an array of image length ${imagesFullPath.length}`);
    setTimeout(() => {
        if (doNext) {
            numberOfRequestSent = 0;
            numberOfResponseReceived = 0;
            while (imagesFullPath.length > 0 && numberOfRequestSent < Math.min(imagesFullPath.length, maxRequestPerSecond)) {
                const imageToUpload = imagesFullPath.splice(imagesFullPath.length - 1, 1)[0];

                const urlAzure = faceEndpointURL + `/persongroups/${personGroupId}/persons/${personId}/persistedFaces`;
                console.log(imageToUpload);
                numberOfRequestSent++;
                const req = fs.createReadStream(imageToUpload).pipe(request({
                    url: urlAzure,
                    method: "POST",
                    encoding: "binary",
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Host": "westus.api.cognitive.microsoft.com",
                        "Ocp-Apim-Subscription-Key": faceApiKey
                    }
                }, (error, response, body) => {
                    numberOfResponseReceived++;
                    if (error) {
                        console.error(error);
                    } else {
                        console.log(body);
                    }
                }));
            }
            console.log("LEN: " + imagesFullPath.length);
            if (imagesFullPath.length === 0) {
                console.log("DONE");
                done();
                return;
            }
        }
        batchAddFacesToPersonImage(personGroupId, personId, imagesFullPath, done, numberOfRequestSent === numberOfResponseReceived);
    }, waitingPeriodInMs);
}

// https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395249
function trainModelToRecognizePeople(personGroupId: string): Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
        const urlAzure = faceEndpointURL + `/persongroups/${personGroupId}/train`;
        const req = request({
            url: urlAzure,
            method: "POST",
            headers: {
                "Ocp-Apim-Subscription-Key": faceApiKey
            }
        }, (error, response, body) => {
            if (error) {
                console.error(error);
                reject();
            } else {
                console.log(body);
                resolve();
            }
        });
    });
    return promise;
}
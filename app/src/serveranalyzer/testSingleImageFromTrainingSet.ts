import * as fs from "fs";
import * as request from "request";

import { visionEndpointURL, faceEndpointURL, imageGroupId, imageGroupDisplayName } from "../../../config";
import { computerVisionKey, localDirectory, trainDirectory, faceApiKey } from "../../../secret";

const testImageFullPath = "D:\\code\\CognitiveImagesCollection\\trainimages\\meloAndAlicia.jpg";


// Get Emotion of a single image
function detectPeopleFromImage(imageFullPath: string): Promise<any> {
    const promise = new Promise<any>((resolve, reject) => {
        const urlAzure = faceEndpointURL + `/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair,accessories`;
        console.log(urlAzure);
        const req = fs.createReadStream(imageFullPath).pipe(request({
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
                reject(error);
            } else {
                console.log(body);
                resolve(JSON.parse(body));
            }
        }));
    });
    return promise;
}


// Identify
function identifyPeople(personGroupId: string, detectPayload: any): Promise<void> {
    const promise = new Promise<any>((resolve, reject) => {
        const arrayIds = (detectPayload as any[]).map((entry) => entry.faceId);
        const urlAzure = faceEndpointURL + `/identify`;
        console.log(urlAzure);
        request({
            url: urlAzure,
            method: "POST",
            json: {
                personGroupId: personGroupId,
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
                for (let i = 0; i < body.length; i++) {
                    console.log("Body:");
                    console.log(body[i]);
                    console.log("Candidates:");
                    console.log(body[i].candidates);
                }               
                resolve(body);
            }
        });
    });
    return promise;
}


detectPeopleFromImage(testImageFullPath)
    .then((payload: any) => {
        identifyPeople(imageGroupId, payload);
    });


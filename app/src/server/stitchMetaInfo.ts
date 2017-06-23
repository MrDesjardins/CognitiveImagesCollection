import * as g from "glob";
import * as path from "path";
import * as sharp from "sharp";
import * as fs from "fs";
import * as request from "request";

import { visionEndpointURL, imageGroupId, faceEndpointURL } from "../../../config";
import { computerVisionKey, localDirectory, faceApiKey, personIdToDisplayName } from "../../../secret";
import { IImage } from "./IImage";


// ============== Configuration Constants =============
const directoryName = "metainfo";
const imagesDirectory = localDirectory;
const pathImagesDirectory = path.join(imagesDirectory, "**/" + directoryName + "/*_vision.json");

// =============== Global data variables ===============


console.log(pathImagesDirectory);

const glob = new g.Glob(pathImagesDirectory, {} as g.IOptions, (err: Error, matches: string[]) => {
    matches.forEach((file: string) => {

        const mainFile = file;
        const facesFile = file.replace("_vision", "_faces");
        const detectionFile = file.replace("_vision", "_facesdetection");
        const savedFinalFile = file.replace("_vision", "_fullmeta");

        // console.log("Main :" + mainFile);
        // console.log("Faces :" + facesFile);
        // console.log("Detect :" + detectionFile);


        const dataFromMainFile = fs.readFileSync(mainFile, "utf8");
        const dataFromFacesFile = fs.readFileSync(facesFile, "utf8");
        const dataFromDetectFile = fs.readFileSync(detectionFile, "utf8");

        const mainObject = JSON.parse(dataFromMainFile);
        const facesObject = JSON.parse(dataFromFacesFile);
        const detectObject = JSON.parse(dataFromDetectFile);

        facesObject.forEach((face: any) => {
            const faceId = face.faceId;
            const personObject = detectObject.find((faceLooking: any) => faceLooking.faceId === faceId);
            if (personObject) {
                face.displayName = personObject.displayName;
                face.personId = personObject.personId;
            } else {
                face.displayName = "Unknown";
                face.personId = "";
            }
        });
        mainObject.peoples = facesObject;
        fs.writeFile(savedFinalFile, JSON.stringify(mainObject), (err) => {
            if (err) {
                return console.error(err);
            }
        });
    });
});
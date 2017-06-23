import * as g from "glob";
import * as path from "path";
import * as sharp from "sharp";
import * as fs from "fs";
import * as request from "request";

import { visionEndpointURL, imageGroupId, faceEndpointURL } from "../../../config";
import { computerVisionKey, localDirectory, faceApiKey, personIdToDisplayName } from "../../../secret";
import { IImage } from "./IImage";
import { IVisionModel, IFace, IFaceDetection, IFullMeta, IFaceWithDetection } from "./model";


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

        const dataFromMainFile = fs.readFileSync(mainFile, "utf8");
        const dataFromFacesFile = fs.readFileSync(facesFile, "utf8");
        const dataFromDetectFile = fs.readFileSync(detectionFile, "utf8");

        const mainObject = JSON.parse(dataFromMainFile) as IVisionModel;
        const facesObject = JSON.parse(dataFromFacesFile) as IFace[];
        const detectObject = JSON.parse(dataFromDetectFile) as IFaceDetection[];
        const fullMeta = mainObject as IFullMeta;
        fullMeta.people = [];
        facesObject.forEach((face: IFace) => {
            const faceId = face.faceId;
            const personObject = detectObject.find((faceLooking: IFaceDetection) => faceLooking.faceId === faceId);
            const newFace = face as IFaceWithDetection;
            if (personObject) {
                newFace.displayName = personObject.displayName;
                newFace.personId = personObject.personId;
            } else {
                newFace.displayName = "Unknown";
                newFace.personId = "";
            }
            fullMeta.people.push(newFace);
        });

        const regexPattern = /([0-9]{4})\/([0-9]{4}\-[0-9]{2}\-[0-9]{2})\-([^\/]*)/g;
        const regexMatches = regexPattern.exec(mainFile);
        const year = regexMatches[1];
        const yearMonthDay = regexMatches[2];
        const tinyDescription = regexMatches[3];
        const extractedTagsFromTinyDescription = tinyDescription.replace(/([A-Z])/g, " $1").split(" ").filter((e: string) => e !== "");
        fullMeta.year = parseInt(year, 10);
        fullMeta.fullDate = yearMonthDay;
        fullMeta.manualTags = extractedTagsFromTinyDescription;

        fs.writeFile(savedFinalFile, JSON.stringify(fullMeta), (err) => {
            if (err) {
                return console.error(err);
            }
            // Delete other JSON files since we merged everything
            fs.unlink(mainFile, (errorDelete) => {
                if (err) {
                    return console.error(errorDelete);
                }
                console.log("Deleted " + mainFile);
            });
            fs.unlink(facesFile, (errorDelete) => {
                if (err) {
                    return console.error(errorDelete);
                }
                console.log("Deleted " + facesFile);
            });
            fs.unlink(detectionFile, (errorDelete) => {
                if (err) {
                    return console.error(errorDelete);
                }
                console.log("Deleted " + detectionFile);
            });
        });
    });
});
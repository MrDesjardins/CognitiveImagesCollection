import { MongoClient, MongoError, Db, InsertOneWriteOpResult } from "mongodb";
import { localDirectory } from "../../../secret";
import { mongodbConnectionString, mongodbCollectionName } from "../../../config";
import * as g from "glob";
import * as path from "path";
import * as fs from "fs";
import { IFullMeta } from "./model";

// ============== Configuration Constants =============
const url = mongodbConnectionString;
const directoryName = "metainfo";
const imagesDirectory = localDirectory;
const pathImagesDirectory = path.join(imagesDirectory, "**/" + directoryName + "/*_fullmeta.json");

function insertDocuments(db: Db, objToInsert: IFullMeta): void {
    const collection = db.collection(mongodbCollectionName);

    objToInsert.fullDate = new Date(objToInsert.fullDate); // Convert into date which got stringyfied during the save/load
    collection.insert(objToInsert, (err: MongoError, result: InsertOneWriteOpResult) => {
        // console.log("Inserted " + result.insertedId);
        // console.log(result.result);
    });
}

MongoClient.connect(url, (errMongo: MongoError, db: Db) => {
    if (errMongo) {
        console.log(errMongo);
    } else {
        console.log("Connected successfully to server");
    }
    const glob = new g.Glob(pathImagesDirectory, {} as g.IOptions, (errFile: Error, matches: string[]) => {
        matches.forEach((file: string) => {
            const dataFromMainFile = JSON.parse(fs.readFileSync(file, "utf8"));
            insertDocuments(db, dataFromMainFile);
        });
        db.close();
        console.log("Done saving");
    });
});

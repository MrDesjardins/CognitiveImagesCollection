import * as express from "express";
import { MongoClient, MongoError, Db, InsertOneWriteOpResult, IteratorCallback, EndCallback } from "mongodb";
import { mongodbConnectionString, mongodbCollectionName } from "./config";
import { IResults, IResult } from "./app/src/website/scripts/models/filterModels";

const app = express();

app.use(express.static(__dirname + "/"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/api", (req, res) => {
    // Fix cors issue
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const parameters = req.url.substring(req.url.indexOf("?") + 1);
    const parameterObject = JSON.parse('{"' + parameters.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
        (key, value) => key === "" ? value : decodeURIComponent(value));

    console.log("Url : " + req.url);
    console.log("Parameters : " + parameters);
    console.log("Parameters Object : ");
    console.log(parameterObject);

    const queryParameters = initializeDefaultMongoQuery(parameterObject);
    addTagsToMongoQuery(queryParameters, parameterObject.tags);
    addNumberOfPeopleToMongoQuery(queryParameters, parameterObject.numberofpeople);
    addPeopleNameToMongoQuery(queryParameters, parameterObject.names);

    // Query MongoDb
    console.log("MongoDb ConnectionString : " + mongodbConnectionString);
    console.log("Parameters for Query:");
    console.log(JSON.stringify(queryParameters));
    MongoClient.connect(mongodbConnectionString, (errMongo: MongoError, db: Db) => {
        if (errMongo) {
            console.log(errMongo);
        } else {
            console.log("Connected successfully to server");
        }
        const collection = db.collection(mongodbCollectionName);

        const resultList = collection.find<IResult>(queryParameters).toArray();
        const resultToSend = {
            pictureResults: []
        } as IResults;

        resultList.then((result: IResult[]) => {

            console.log(result);
            resultToSend.pictureResults = result;
            console.log("Done Querying");
            db.close();
            res.json(resultToSend);
        });
        console.log("Waiting Query Result");
    });
});

app.listen(8080);
function initializeDefaultMongoQuery(parameterObject: any): any {
    const isBw = (parameterObject.isblackandwhite === "true");
    return {
        $and: [
            {
                "color.isBWImg": isBw
            },
            {
                fullDate: {
                    $gte: new Date(parseInt(parameterObject.startdate, 10)),
                    $lt: new Date(parseInt(parameterObject.enddate, 10))
                }
            },
            {
                "people.faceAttributes.smile": { $gt: parseFloat(parameterObject.smilelevel) }
            },
            {
                "people.faceAttributes.emotion.happiness": { $gt: parseFloat(parameterObject.hapinesslevel) }
            }
        ]
    };
}
function addPeopleNameToMongoQuery(queryParameters: any, names: string): void {
    let peopleName = null;
    if (names !== undefined) {
        const namesArray = names.split(",");
        peopleName = {
            $and: namesArray.map((name: string) => {
                return {
                    "people.displayName": new RegExp(name)
                };
            })
        };
    }
    if (peopleName !== null) {
        (queryParameters.$and as any).push(peopleName);
    }
}

function addNumberOfPeopleToMongoQuery(queryParameters: any, numberOfPeopleString: string): void {
    const numberOfPeople = parseInt(numberOfPeopleString, 10);
    if (!isNaN(numberOfPeople) && numberOfPeople > 0) {
        const andConditon = {};
        andConditon["faces." + (numberOfPeople - 1)] = { $exists: true };
        const condition = {
            $and: [
                andConditon
            ]
        };
        (queryParameters.$and as any).push(condition);
    }
}

function addTagsToMongoQuery(queryParameters: any, tags: string): void {
    let queryTagsNameObjectArray;
    let queryDescriptionCaptionsObjectArray;
    let queryManualTagObjectArray;
    if (tags !== undefined && tags.trim() !== "") {
        const tagsArray = tags.split(",");
        if (tagsArray.length > 0) {
            queryTagsNameObjectArray = tagsArray.map((tag) => {
                return {
                    "tags.name": new RegExp(tag),
                    "tags.confidence": { $gt: 0.9 }
                }
            });
            queryDescriptionCaptionsObjectArray = tagsArray.map((tag) => {
                return {
                    "description.captions.text": new RegExp(tag),
                    "description.captions.confidence": { $gt: 0.9 }
                }
            });
            queryManualTagObjectArray = tagsArray.map((tag) => {
                return {
                    manualTags: new RegExp(tag)
                }
            });
        }
    }
    if (queryTagsNameObjectArray !== undefined && queryTagsNameObjectArray.length > 0) {
        const andConditon = {};
        const condition = {
            $or: [
                {
                    $and: queryTagsNameObjectArray
                },
                {
                    $and: queryDescriptionCaptionsObjectArray
                },
                {
                    $and: queryManualTagObjectArray
                }
            ]
        };
        (queryParameters.$and as any).push(condition);
    }
}
# Goal

This is an experimental project with the goal of allowing to search a collection of image by words and get the best images. 

The idea is to scan thousand of images, to resize them, to send them to Azure Computer Vision Api, Faces Emotion and Detect, to save the result and enhance this the program with information like date and folder description that we have locally into a MongoDB. 

The second piece of this project, is to have a web front-end that will allow to search by key word and date. For example, "girl on a table in 2017" should return me a list of local path of results. The idea is also to be able to identify people. The configuration allows to specify a folder where you can put pictures of people you want to identify. This will allows to search for example : "Alicia halloween pumpkin".

# Details

## secret.js
This file is not part of this repository but must be created.
It must constains few Azure keys, and some private directories. The Azure keys are multiple because we use the Vision and the Face apis. The directory is to get all the local images to analyze and the directory to get face shot to train the face detection machine learning.

The last piece of the secret file is a manual steps which is to get the GUID of people training and provide a string that will be used to replace the GUID to a human readable string. You can get this GUID once you run the "train.ts" code in the console or if you call the API : [Person - List Persons in a Person Group](https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395241/console). The idea is just to speed thing up could be more dynamic later by calling this api to create the mapping

```
export const computerVisionKey = "<azure key>";
export const faceApiKey = "<azure key>";
export const localDirectory = "<local path to a directories with images and sub directories>";
export const trainDirectory = "<local path to a directory that contains many directory of people to train to recognize>";
export const personIdToDisplayName = {
  "201a100d-39f3-4825-b5a1-9bda64a5fd9c": "First Last 1",
  "7ca9ac32-2fde-4fe9-baff-50cbe0262be2": "First Last 2",
  "c625e1ca-ead4-402e-ba9a-ff01137f3c33": "First Last 3"
};

```

To get your **Azure keys** use this link : https://portal.azure.com/#create/Microsoft.CognitiveServices

## Scan Files
A local directory is defined in the secret file (*localDirectory*). This will scan all jpg or JPG file and go recursively into sub directory to have a list of file to request.

A second configuration called train directory (*trainDirectory*) is used to train the system to recognize some people. This directory needs to have sub directories with the full name of the people you want to identify. These sub-folders will have face pictures only. This is how it should look:

```
c:\your\directory\to\train\
c:\your\directory\to\train\First Last 1\
c:\your\directory\to\train\First Last 2\
c:\your\directory\to\train\First Last 3\

```

## Resize
Images need to be resized because most of local image are big (between 8 megs and 20 megs each from my camera). Azure doesn't need that much quality. By resizing them to have the image with a maximum of 640 pixel, the size shrink down to about 25kb. It's very fast to send and reduce the waste of bandwidth and increase overall performance.

## Analyze
The analyze part contains calling the Vision Api to get tags, description and others information about how many people are in the picture. To get information about the emotion of everyone as well as who is in the picture, we need to call other API. This result of many payload that are downloaded. Every response is saved into the */metainfo/* directory. In the last step, we consolidate them. This is separated because it's easy to debug, but also because we could do some paralyzing later.

## Stitch
Stitching is the last part which combine the information from all the JSON file as well as taking information from the folder. My local folders are containing information about the date and about small details on what happen. For example:

```
c:\folder\where\all\pictures\2017\2017-12-25-Christmas\
c:\folder\where\all\pictures\2017\2018-01-01-NewEveMorning\
```

This mean I can extract the date and an accurate tiny description.

## DB
Every file is stored in MongoDb. The script saveInDb.ts insert all metadata stiched files in MongoDb. You need to start an instance and connect to it.

```
mongod --dbpath=.\data
```

This will allow us to have the website to be backed up with a faster way to query.

# Pre-requisite

1. Python 2 : https://www.python.org/downloads/release/python-2713/

# Scan

The scan consist of building the NodeJs code that will train, analyze images and stich all results to endup in MongoDb.

1. npm run build
2. npm run train
3. npm run analyze
4. npm run stitch
5. npm run db

# Website

The website allows to query the trained and analyzed images that are at this point in the MongoDb. Here are the step to build and run the server.

1. npm run buildweb
2. npm run serverweb
3. http://localhost:8080

# High Level Tasks List

1. ~~Scan files~~
2. ~~Resize~~
3. ~~Request Azure Computer Vision API~~
4. ~~Save a temporary file on disk for the thumbnail and the response. Thumbnail will be used for the website. Response in the search tool later.~~
5. ~~Train Face from a subset of images to have future identification~~
6. ~~Request Face Api to get emotion and to tag people name (create a second JSON file)~~
7. ~~Enhance result with local information (folder directory has name and full date)~~
8. ~~Store information~~
9. Create website to query data
10. Display result
11. Remove hard-coded value from secret.js and use the [Person - List Persons in a Person Group](https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395241/console) API to create the map between GUID and display name.
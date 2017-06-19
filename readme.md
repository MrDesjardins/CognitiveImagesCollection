# Goal

This is an experimental project with the goal of being able to search a collection of image by words. The idea is to scan thousand of images, to resize them, to send them to Azure Computer Vision Api, to save the result and enhance this one with information like date and folder description that we have locally into a MongoDB. From there, the goal is to have a web front-end that will allow to search by key word and date. For example, "girl on a table in 2017" should return me a list of local path of results. The idea is also to be able to identify people. The configuration allows to specify a folder where you can put pictures of people you want to identify. This will allows to search for example : "Alicia halloween pumpkin".

# Details

## secret.js
This file is not part of this repository but must be created.
It must constains:
```
export const computerVisionKey = "<azure key>";
export const faceApiKey = "<azure key>";
export const localDirectory = "<local path to a directories with images and sub directories>";
export const trainDirectory = "<local path to a directory that contains many directory of people to train to recognize>";
```
To get your key use this link : https://portal.azure.com/#create/Microsoft.CognitiveServices

## Scan Files
A local directory is defined in the secret file. This will scan all jpg or JPG file and go recursively into sub directory to have a list of file to request.

A second configuration called train directory is used to train the system to recognize some people. This directory needs to have sub directory with the full name of the people you want to identify. These sub-folders will have face pictures only.

## Resize
Images need to be resized because most of my local image are big (between 8 megs and 20 megs each). Azure doesn't need that much quality. By resizing them to have the image with a maximum of 640 pixel, the size shrink down to about 25kb. It's very fast to send.

# Pre-requisite

1. Python 2 : https://www.python.org/downloads/release/python-2713/

# Scan

1. npm run build
2. npm run train
3. npm run analyze

# High Level Tasks List

1. ~~Scan files~~
2. ~~Resize~~
3. ~~Request Azure Computer Vision API~~
4. ~~Save a temporary file on disk for the thumbnail and the response. Thumbnail will be used for the website. Response in the search tool later.~~
5. ~~Train Face from a subset of images to have future identification~~
6. Request Face Api to get emotion and to tag people name (create a second JSON file)
7. Enhance result with local information (folder directory has name and full date)
8. Store information
9. Create website to query data
10. Display result
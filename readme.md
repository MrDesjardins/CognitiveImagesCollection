# Goal

This is an experimental project with the goal of being able to search a collection of image by words. The idea is to scan thousand of images, to resize them, to send them to Azure Computer Vision Api, to save the result and enhance this one with information like date and folder description that we have locally into a MongoDB. From there, the goal is to have a web front-end that will allow to search by key word and date. For example, "girl on a table in 2017" should return me a list of local path of results.

# Details

## secret.js
This file is not part of this repository but must be created.
It must constains:
```
export const key1 = "<azure key>";
export const localDirectory = "<local path to a directories with images and sub directories>";
```
To get your key use this link : https://portal.azure.com/#create/Microsoft.CognitiveServices

## Scan Files
A local directory is defined in the secret file. This will scan all jpg or JPG file and go recursively into sub directory to have a list of file to request.

## Resize
Images need to be resized because most of my local image are big (between 8 megs and 20 megs each). Azure doesn't need that much quality. By resizing them to have the image with a maximum of 640 pixel, the size shrink down to about 25kb. It's very fast to send.

# Pre-requisite

1. Python 2 : https://www.python.org/downloads/release/python-2713/

# Scan

1. npm run buildserver
2. npm run server

# High Level Tasks List

1. ~~Scan files~~
2. ~~Resize~~
3. ~~Request Azure Computer Vision API~~
4. Avoid saving a temporary file on disk
5. Enhance result with local information
6. Store information
7. Create website to query data
8. Display result



// // Search by tag with > 50%
// db
// .getCollection("documents")
// .find({"tags.name":/baby/, "tags.confidence":{ $gt: 0.5}});

// // Search by caption with > 50%
// db
// .getCollection("documents")
// .find({"description.captions.text":/bottle/, "description.captions.confidence":{ $gt: 0.5}});


// // Search by name
// db
// .getCollection("documents")
// .find({"people.displayName":/Alicia/});


// // If two people in picture
// db
// .getCollection("documents")
// .find({"faces.1":{$exists: true}});

// db
// .getCollection("documents")
// .find(
//     { 
//         $and: [
//             {
//             $or: [
//                 {
//                     $and: 
//                     [ 
//                         { 
//                             "description.captions.text":/bed/, 
//                             "description.captions.confidence":{ $gt: 0.9}
//                         },
//                         { 
//                             "description.captions.text":/indoor/, 
//                             "description.captions.confidence":{ $gt: 0.9}
//                         }
//                     ]
//                 },
//                 {
//                     $and: 
//                     [ 
//                         {"manualTags": /bed/},
//                         {"manualTags": /indoor/},
//                     ]
//                 },
//                 {
//                     $or: 
//                     [ 
//                         {"description.captions.text": /bed/},
//                         {"description.captions.text": /indoor/},
//                     ]
//                 }
//             ]
//         },
//         {
//             "color.isBWImg" : true
//         },
//         {
//             "fullDate":{
//                 $gte: ISODate("2015-04-29T00:00:00.000Z"),
//                 $lt: ISODate("2017-05-01T00:00:00.000Z")
//             }
//         }
//     ]
//     }
//     );


// -------- With number of people

// db
// .getCollection("documents")
// .find(
//     { 
//         $and: [
//             {
//             $or: [
//                 {
//                     $and: 
//                     [ 
//                         { 
//                             "description.captions.text":/bed/, 
//                             "description.captions.confidence":{ $gt: 0.9}
//                         },
//                         { 
//                             "description.captions.text":/indoor/, 
//                             "description.captions.confidence":{ $gt: 0.9}
//                         }
//                     ]
//                 },
//                 {
//                     $and: 
//                     [ 
//                         {"manualTags": /bed/},
//                         {"manualTags": /indoor/},
//                     ]
//                 },
//                 {
//                     $or: 
//                     [ 
//                         {"description.captions.text": /bed/},
//                         {"description.captions.text": /indoor/},
//                     ]
//                 }
//             ]
//         },
//         {
//             "color.isBWImg" : true
//         },
//         {
//             "fullDate":{
//                 $gte: ISODate("2015-04-29T00:00:00.000Z"),
//                 $lt: ISODate("2017-05-01T00:00:00.000Z")
//             }
//         },
//         {
//              $and: [
//                 {
//                     "faces.0":{$exists: true}
//                 },
//                 {
//                     "faces":{$exists: true}
//                 },
//             ]
//         }
//         ]
//     }
// );


// - With Name + Emotion
// db
// .getCollection("documents")
// .find(
//     { 
//         $and: [
//             {
//             $or: [
//                 {
//                     $and: 
//                     [ 
//                         { 
//                             "description.captions.text":/bed/, 
//                             "description.captions.confidence":{ $gt: 0.9}
//                         },
//                         { 
//                             "description.captions.text":/indoor/, 
//                             "description.captions.confidence":{ $gt: 0.9}
//                         }
//                     ]
//                 },
//                 {
//                     $and: 
//                     [ 
//                         {"manualTags": /bed/},
//                         {"manualTags": /indoor/},
//                     ]
//                 },
//                 {
//                     $or: 
//                     [ 
//                         {"description.captions.text": /bed/},
//                         {"description.captions.text": /indoor/},
//                     ]
//                 }
//             ]
//         },
//         {
//             "color.isBWImg" : true
//         },
//         {
//             "fullDate":{
//                 $gte: ISODate("2015-04-29T00:00:00.000Z"),
//                 $lt: ISODate("2017-05-01T00:00:00.000Z")
//             }
//         },
//         {
//              $and: [
//                 {
//                     "faces.0":{$exists: true}
//                 },
//                 {
//                     "faces":{$exists: true}
//                 },
//             ]
//         },
//         {
//             "people.displayName": /Alicia/
//         },
//         {
//             "people.faceAttributes.smile": { $gt: 0.0}
//         },
//         {
//             "people.faceAttributes.emotion.happiness": { $gt: 0.0}
//         }
//         ]
//     }
// );
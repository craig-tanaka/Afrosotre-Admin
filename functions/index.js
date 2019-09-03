/*jshint esversion: 8 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const path = require('path');
const os = require('os');
const fs = require('fs');
const sharp = require('sharp');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.copyToNew = functions.firestore
    .document(`products/{productId}`)
    .onCreate((snap) => {
        return admin.firestore().doc(`/new/${snap.id}`)
            .set(snap.data());
    });

exports.updateNewReference = functions.firestore
    .document(`products/{productID}`)
    .onUpdate((change, context) => {
        return admin.firestore().doc(`/new/${change.after.id}`)
            .set(change.after.data());
    });

exports.deleteNewReference = functions.firestore
    .document(`products/{productID}`)
    .onDelete((change, context) => {
        return admin.firestore().doc(`/new/${change.id}`)
            .delete();
    });

exports.deleteProductImages = functions.firestore
    .document(`products/{productID}`)
    .onDelete((change, context) => {
        const {productID} = context.params;
        return admin.storage().bucket().deleteFiles({
            prefix: `product-images/${productID}`
        })
    })

exports.convertImageToJpeg = functions.storage.object().onFinalize(async (object) => {

    if(object.metadata === undefined) return console.log('image already converted');
    console.log(object.metadata);
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

    if (!contentType.startsWith('image')) {
        return console.error('This is not an image.')
    }

    // Get the file name.
    const fileName = path.basename(filePath);

    const bucket = admin.storage().bucket(object.bucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const outputFolder = path.join(os.tmpdir(), '/converted/');
    await bucket.file(filePath).download({
            destination: tempFilePath
        })
        .catch(error => {
            console.log(error);
            return;
        });

    console.log('image downloaded locally to ', tempFilePath);
    
    let minifiedFile = path.join(os.tmpdir(), '01.jpg');

    console.log('Converting and minifying file........');

    // conversion and minification
    // todo: minification improvement test
    await sharp(tempFilePath).toFile(minifiedFile);

    async function convertImage() {

        const files = await imagemin([minifiedFile], {
                    destination: outputFolder,
                    plugins: [
                        imageminMozjpeg({
                            progressive : true,
                            quality: 70
                        })
                    ]
                });
        
        console.log('image converted returned : ', files);
    }

    
    const outputFile = path.join(outputFolder, path.basename(minifiedFile));

    await convertImage().catch(error => console.log(error));

    await bucket.file(filePath).delete()
            .catch((error) => {
                console.log(error);
                    return;
            });
    const outputFilePath = filePath.replace(fileName, '00.jpg');
    // todo: delete temp files
    
    return bucket.upload(outputFile, {
        destination: outputFilePath ,
         metadata: {
            converted: true
            // fixed metadata undefined error and in turn metadata recursion check
        }
    })
    .then(() => console.log('image uploaded to: ', outputFilePath ));
});
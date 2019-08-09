/*jshint esversion: 6 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.copyToNew = functions.firestore
    .document(`products/{productId}`)
    .onCreate((snap) =>{
        const newDocument = snap.data();

        console.log(newDocument);

        return admin.firestore().doc(`/new/${snap.id}`)
                .set(newDocument);
    });
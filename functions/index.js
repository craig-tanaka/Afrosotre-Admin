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
        return admin.firestore().doc(`/new/${snap.id}`)
                .set(snap.data());
    });

exports.updateNewReference = functions.firestore
    .document(`products/{productID}`)
    .onUpdate((change, context)=>{
        return admin.firestore().doc(`/new/${change.after.id}`)
                .set(change.after.data());
    });

    exports.deleteNewReference = functions.firestore
    .document(`products/{productID}`)
    .onDelete((change, context)=>{
        return admin.firestore().doc(`/new/${change.id}`)
                .delete();
    });
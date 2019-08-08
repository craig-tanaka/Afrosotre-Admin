/*jshint esversion: 6 */

try{
    window.db = firebase.firestore();
    window.storageRef = firebase.storage().ref();
}
catch(ReferenceError){
    console.log('Firebase not found');
}

const form = document.querySelector('form');
const productNameInput = document.querySelector('#product-name');
const productCategoryInput = document.querySelector('#product-category');
const productBrandInput = document.querySelector('#product-brand');
const productPriceInput = document.querySelector('#product-price');
const productDescriptionInput = document.querySelector('#product-description');

const browseBtn = document.querySelector('#browse-btn');
const fileInfo = document.querySelector('#file-info');
const realImageInput = document.querySelector('#real-image-input');
const productImagePreview = document.querySelector('#product-image-preview');

let ImageUrl = '';
let image = {};
let ImageName = '';
let fileExt = '';
let DocRef = {};

productImagePreview.addEventListener('click', event=>{
    realImageInput.click();
})

realImageInput.addEventListener('change', () => {
    const name = realImageInput.value.split(/\\|\//).pop();
    const truncated = name.length > 20 ?
        name.substr(name.length - 20) :
        name;
    const re = /(?:\.([^.]+))?$/;

    ImageUrl = window.URL.createObjectURL(realImageInput.files[0]);
    image = realImageInput.files[0];
    ImageName = truncated;
    fileExt = re.exec(truncated)[1];
    productImagePreview.style.backgroundImage= `url(${ImageUrl})`;
    productImagePreview.style.backgroundColor= 'initial';
    productImagePreview.innerHTML = '';
});


form.onsubmit = event => {
    event.preventDefault();

    // validateForm();
    uploadDocument();

    return false;
}

function validateForm() {

}

function uploadDocument(){
    db.collection("products").add({
        ProductName: productNameInput.value,
        Price: productPriceInput.value,
        Brand: productBrandInput.value,
        Category: productCategoryInput.value,
        Description: productDescriptionInput.value
    })
    .then(function (docRef) {
        console.log("Document written with ID: ", docRef.id);
        DocRef = docRef;
        uploadImage();
    })
    .catch(function (error) {
        console.error("Error adding document: ", error);
    });
}

function uploadImage(){
    let uploadTask = storageRef.child('product-images/' + DocRef.id + '/00.' + fileExt).put(image);

    uploadTask.on('state_changed', function(snapshot){
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function(error) {
        // Handle unsuccessful uploads
        console.log('upload unsuccessful');
      }, function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log('File available at', downloadURL);
        });
      });
}
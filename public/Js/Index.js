var db = firebase.firestore();

var form = document.querySelector('form');          
var productNameInput = document.querySelector('#product-name');          
var productCategoryInput = document.querySelector('#product-category');          
var productBrandInput = document.querySelector('#product-brand');          
var productPriceInput = document.querySelector('#product-price');          
var productDescriptionInput = document.querySelector('#product-description');          

form.onsubmit = event => {
    event.preventDefault();

    // validateForm();



    db.collection("products").add({
        ProductName: productNameInput.value,
        Price: productPriceInput.value,
        // ProductID: 1815,
        Brand: productBrandInput.value,
        Category: productCategoryInput.textContent,
        Description: productDescriptionInput.value
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });

    return false;
}

function validateForm() {
    
}

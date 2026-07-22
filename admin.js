const imageInput = document.getElementById("image");

const preview = document.getElementById("preview");



imageInput.addEventListener("change", function(){



const file = this.files[0];



if(file){


const reader = new FileReader();



reader.onload = function(e){


preview.src = e.target.result;


};



reader.readAsDataURL(file);



}



});







const saveButton = document.getElementById("save-page");



saveButton.onclick = function(){



const title = document.getElementById("page-title").value;


const number = document.getElementById("page-number").value;


const image = imageInput.files[0];





if(!title || !number || !image){


alert("Please fill in all fields");


return;


}





alert(

"PAGE READY\n\n" +

"Title: " + title +

"\nPage: " + number

);



};
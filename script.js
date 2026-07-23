let pageFlip;


let zoom = 1;

let moveX = 0;
let moveY = 0;


let dragging = false;

let startX = 0;
let startY = 0;



async function loadMagazine(){


const response = await fetch("pages.json");

const pages = await response.json();



const book = document.getElementById("book");

const menuPages = document.getElementById("menu-pages");

const menu = document.querySelector(".menu");





pages.forEach((item,index)=>{


const page = document.createElement("div");


page.className="page";


page.innerHTML = `

<img src="${item.image}" alt="">

`;



book.appendChild(page);






const menuItem = document.createElement("p");


menuItem.textContent =

`${String(index+1).padStart(2,"0")} — ${item.title}`;





menuItem.style.cursor="pointer";



menuItem.onclick = ()=>{


pageFlip.turnToPage(index);


menu.classList.remove("active");


};




menuPages.appendChild(menuItem);



});









pageFlip = new St.PageFlip(

book,

{

width:540,

height:720,

size:"fixed",

showCover:true,

usePortrait:false,

drawShadow:false,

maxShadowOpacity:0,

flippingTime:900,

mobileScrollSupport:false,

useMouseEvents:false

}

);








pageFlip.loadFromHTML(

document.querySelectorAll(".page")

);








const counter=document.querySelector(".counter");



counter.textContent =

`01 / ${String(pages.length).padStart(2,"0")}`;








pageFlip.on("flip",(e)=>{


counter.textContent =

`${String(e.data+1).padStart(2,"0")} / ${String(pages.length).padStart(2,"0")}`;



});









document.getElementById("next").onclick = ()=>{


pageFlip.flipNext();


};




document.getElementById("prev").onclick = ()=>{


pageFlip.flipPrev();


};









const menuButton=document.querySelector(".menu-btn");



menuButton.onclick = ()=>{


menu.classList.toggle("active");


};









const camera=document.querySelector(".camera");


const zoomValue=document.getElementById("zoom-value");






function updateCamera(){



camera.style.transform =

`translate(${moveX}px,${moveY}px) scale(${zoom})`;



zoomValue.textContent =

`${Math.round(zoom*100)}%`;



}









document.getElementById("zoom-in").onclick = ()=>{


zoom +=0.1;



if(zoom>2.5){


zoom=2.5;


}



updateCamera();



};









document.getElementById("zoom-reset").onclick = ()=>{


zoom=1;


moveX=0;


moveY=0;



updateCamera();



};









camera.addEventListener("mousedown",(e)=>{



if(zoom<=1){


return;


}



dragging=true;


camera.classList.add("dragging");



startX=e.clientX;


startY=e.clientY;



});









document.addEventListener("mousemove",(e)=>{


if(!dragging){


return;


}





moveX += e.clientX-startX;


moveY += e.clientY-startY;



startX=e.clientX;


startY=e.clientY;




updateCamera();



});









document.addEventListener("mouseup",()=>{



dragging=false;



camera.classList.remove("dragging");



});




}



loadMagazine();
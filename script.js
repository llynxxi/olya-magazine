const book = document.getElementById("book");


const pageFlip = new St.PageFlip(

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

        mobileScrollSupport:false

    }

);



pageFlip.loadFromHTML(

    document.querySelectorAll(".page")

);



const counter = document.querySelector(".counter");



pageFlip.on("flip",(e)=>{


    let page = e.data + 1;


    counter.textContent =

    `${String(page).padStart(2,"0")} / 03`;


});



document.getElementById("next").onclick = ()=>{

    pageFlip.flipNext();

};



document.getElementById("prev").onclick = ()=>{

    pageFlip.flipPrev();

};
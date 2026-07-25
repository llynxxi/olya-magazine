let pageFlip = null;

const baseScale = 0.72;
let zoom = 1;
let moveX = 0;
let moveY = 0;

let dragging = false;
const zoomValue = document.getElementById("zoom-value");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const zoomReset = document.getElementById("zoom-reset");
let startX = 0;
let startY = 0;

async function loadMagazine() {

    const response = await fetch("pages.json");
    const pages = await response.json();

    const book = document.getElementById("book");
    const menuPages = document.getElementById("menu-pages");

    const menu = document.querySelector(".menu");
    const menuPrev = document.getElementById("menu-prev");
    const menuNext = document.getElementById("menu-next");

    book.innerHTML = "";
    menuPages.innerHTML = "";

    pages.forEach((item, index) => {

        const page = document.createElement("div");
        page.className = "page";

        page.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
        `;

        book.appendChild(page);

        const menuItem = document.createElement("p");

        menuItem.textContent =
            `${String(index + 1).padStart(2, "0")} — ${item.title}`;

        menuItem.style.cursor = "pointer";

        menuItem.addEventListener("click", () => {

            pageFlip.turnToPage(index);

            menu.classList.remove("active");

        });

        menuPages.appendChild(menuItem);

    });

    pageFlip = new St.PageFlip(book, {

        width: 540,
        height: 720,

        size: "fixed",

        showCover: true,

        usePortrait: false,

        drawShadow: false,
        maxShadowOpacity: 0,

        flippingTime: 450,

        mobileScrollSupport: false,
        useMouseEvents: false

    });
    pageFlip.loadFromHTML(

    document.querySelectorAll(".page")

);
console.log(pageFlip.getPageCount());


    const container = document.querySelector(".viewer");
    if (!container) return;

    function updateTransform() {

    book.style.transform =
    `translate(${moveX}px, ${moveY}px) scale(${baseScale * zoom})`;

    if (zoomValue) {

        zoomValue.textContent = `${Math.round(zoom * 100)}%`;

    }

}

    container.addEventListener("wheel", (e) => {

        if (!e.ctrlKey) return;

        e.preventDefault();

        const delta = e.deltaY < 0 ? 0.1 : -0.1;

        zoom += delta;

        zoom = Math.min(Math.max(zoom, 1), 3);

        updateTransform();

    });
    if (zoomIn) {

    zoomIn.onclick = () => {

        zoom = Math.min(zoom + 0.1, 3);

        updateTransform();

    };

}

if (zoomOut) {

    zoomOut.onclick = () => {

        zoom = Math.max(zoom - 0.1, 0.5);

        updateTransform();

    };

}

if (zoomReset) {

    zoomReset.onclick = () => {

        zoom = 1;
        moveX = 0;
        moveY = 0;

        updateTransform();

    };

}

    container.addEventListener("mousedown", (e) => {

        if (zoom <= 1) return;

        dragging = true;

        startX = e.clientX - moveX;
        startY = e.clientY - moveY;

        container.style.cursor = "grabbing";

    });

    window.addEventListener("mousemove", (e) => {

        if (!dragging) return;

        moveX = e.clientX - startX;
        moveY = e.clientY - startY;

        updateTransform();

    });

    window.addEventListener("mouseup", () => {

        dragging = false;

        container.style.cursor = "grab";

    });
        const nextButton = document.getElementById("next");
    const prevButton = document.getElementById("prev");
    const bottomNext = document.getElementById("bottom-next");
const bottomPrev = document.getElementById("bottom-prev");

    if (nextButton) {

        nextButton.onclick = () => {

            pageFlip.flipNext();

        };

    }
    if (bottomNext) {

    bottomNext.onclick = () => {

        pageFlip.flipNext();

    };

}

    if (prevButton) {

        prevButton.onclick = () => {

            pageFlip.flipPrev();

        };

    }
    if (bottomPrev) {

    bottomPrev.onclick = () => {

        pageFlip.flipPrev();

    };

}

    if (menuNext) {

        menuNext.onclick = () => {

            pageFlip.flipNext();
            menu.classList.remove("active");

        };

    }

    if (menuPrev) {

        menuPrev.onclick = () => {

            pageFlip.flipPrev();
            menu.classList.remove("active");

        };

    }

    const menuButton = document.getElementById("menu-button");
    const closeMenu = document.getElementById("close-menu");

    if (menuButton) {

        menuButton.onclick = () => {

            menu.classList.add("active");

        };

    }

    if (closeMenu) {

        closeMenu.onclick = () => {

            menu.classList.remove("active");

        };

    }

    document.addEventListener("keydown", (e) => {

        if (e.key === "ArrowRight") {

            pageFlip.flipNext();

        }

        if (e.key === "ArrowLeft") {

            pageFlip.flipPrev();

        }

        if (e.key === "Escape") {

            menu.classList.remove("active");

        }

    });
    }

loadMagazine().catch((error) => {

    console.error(error);

});    
let pageFlip = null;

const baseScale = 0.72;

let zoom = 1;
let moveX = 0;
let moveY = 0;

let dragging = false;

let startX = 0;
let startY = 0;

let touchStartX = 0;
let touchStartY = 0;

let activeText = null;

let currentTextSize =
    Number(localStorage.getItem("magazine-text-size")) || 18;

let currentTextColor =
    localStorage.getItem("magazine-text-color") || "#111111";


const zoomValue = document.getElementById("zoom-value");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const zoomReset = document.getElementById("zoom-reset");

const textSmaller =
    document.getElementById("text-smaller");

const textLarger =
    document.getElementById("text-larger");

const textSize =
    document.getElementById("text-size");

const textColor =
    document.getElementById("text-color");


async function loadMagazine() {

    const response = await fetch("pages.json");
    const pages = await response.json();

    const book =
        document.getElementById("book");

    const menuPages =
        document.getElementById("menu-pages");

    const menu =
        document.querySelector(".menu");

    const menuPrev =
        document.getElementById("menu-prev");

    const menuNext =
        document.getElementById("menu-next");

    const container =
        document.querySelector(".viewer");

    if (!book || !container) return;

    book.innerHTML = "";
    menuPages.innerHTML = "";


    /* =====================================================
       TEXT STORAGE
    ===================================================== */

    const savedTexts =
        JSON.parse(
            localStorage.getItem("magazine-texts") || "{}"
        );


    /* =====================================================
       REGULAR PAGES
    ===================================================== */

    const regularPages =
        pages.slice(0, -1);

    const coverBack =
        pages[pages.length - 1];


    regularPages.forEach((item, index) => {

        const page =
            document.createElement("div");

        page.className =
            "page";

        page.innerHTML = `
            <img
                src="${item.image}"
                alt="${item.title}"
            >
        `;

        book.appendChild(page);


        /*
         * Используем имя картинки как ключ.
         * Поэтому если позже добавятся новые страницы,
         * уже написанный текст не будет переезжать.
         */

        const pageKey =
            `page-${item.image}`;


        /* =================================================
           RESTORE SAVED TEXT
        ================================================= */

        if (savedTexts[pageKey]) {

            savedTexts[pageKey].forEach(item => {

                createTextElement(
                    page,
                    pageKey,
                    item.text,
                    item.left,
                    item.top,
                    item.fontSize || currentTextSize,
                    item.color || currentTextColor
                );

            });

        }


        /* =================================================
           ONE CLICK = NEW TEXT
        ================================================= */

        page.addEventListener("click", (e) => {

            /*
             * Если кликнули по уже существующему тексту —
             * новый текст не создаём.
             */

            if (
                e.target.closest(".magazine-text")
            ) {
                activeText =
                    e.target.closest(".magazine-text");

                updateTextPanel();

                return;
            }


            /*
             * Если кликнули по Contents —
             * текст не создаём.
             */

            if (
                e.target.closest(".contents-item")
            ) {
                return;
            }


            const rect =
                page.getBoundingClientRect();


            /*
             * Считаем положение относительно
             * реального размера страницы.
             *
             * Благодаря этому текст появляется
             * именно там, куда нажали,
             * даже при увеличении.
             */

            const x =
                ((e.clientX - rect.left) /
                    rect.width) * 100;

            const y =
                ((e.clientY - rect.top) /
                    rect.height) * 100;


            const text =
                createTextElement(
                    page,
                    pageKey,
                    "",
                    `${x}%`,
                    `${y}%`,
                    currentTextSize,
                    currentTextColor
                );


            activeText = text;

            updateTextPanel();

            text.focus();

        });


        /* =================================================
           MENU PAGE
        ================================================= */

        const menuItem =
            document.createElement("p");

        menuItem.textContent =
            `${String(index + 1).padStart(2, "0")} — ${item.title}`;

        menuItem.style.cursor =
            "pointer";

        menuItem.addEventListener("click", () => {

            pageFlip.turnToPage(index);

            menu.classList.remove("active");

        });

        menuPages.appendChild(menuItem);

    });


    /* =====================================================
       CONTENTS
    ===================================================== */

    if (regularPages.length % 2 === 0) {

        const contentsPage =
            document.createElement("div");

        contentsPage.className =
            "page contents-page";


        let contentsHTML = `
            <div class="contents-inner">

                <div class="contents-top">
                    <span>ENGLISH WITH OLYA</span>
                    <span>PEOPLE • MUSIC • REAL LIFE</span>
                </div>

                <div class="contents-line"></div>

                <h1>CONTENTS</h1>

                <div class="contents-subtitle">
                    PEOPLE • STORIES • ENGLISH
                </div>

                <div class="contents-list">
        `;


        regularPages.forEach((item, index) => {

            if (index === 0) return;


            const number =
                String(index + 1).padStart(2, "0");


            contentsHTML += `
                <div
                    class="contents-item"
                    data-page="${index}"
                >

                    <span class="contents-number">
                        ${number}
                    </span>

                    <span class="contents-title">
                        ${item.title}
                    </span>

                    <span class="contents-dots"></span>

                    <span class="contents-arrow">
                        →
                    </span>

                </div>
            `;

        });


        contentsHTML += `
                </div>

                <div class="contents-bottom">
                    <span>LEARN</span>
                    <span>EXPLORE</span>
                    <span>BE INSPIRED</span>
                    <span>GROW</span>
                </div>

            </div>
        `;


        contentsPage.innerHTML =
            contentsHTML;

        book.appendChild(contentsPage);


        /* =================================================
           CONTENTS IN MENU
        ================================================= */

        const contentsMenuItem =
            document.createElement("p");

        contentsMenuItem.textContent =
            `${String(regularPages.length + 1).padStart(2, "0")} — Contents`;

        contentsMenuItem.style.cursor =
            "pointer";

        contentsMenuItem.addEventListener("click", () => {

            pageFlip.turnToPage(
                regularPages.length
            );

            menu.classList.remove("active");

        });

        menuPages.appendChild(
            contentsMenuItem
        );


        /* =================================================
           CONTENTS CLICK
        ================================================= */

        contentsPage
            .querySelectorAll(".contents-item")
            .forEach(item => {

                item.addEventListener("click", () => {

                    const targetPage =
                        Number(
                            item.dataset.page
                        );

                    pageFlip.turnToPage(
                        targetPage
                    );

                });

            });

    }


    /* =====================================================
       BACK COVER
    ===================================================== */

    const backPage =
        document.createElement("div");

    backPage.className =
        "page";

    backPage.innerHTML = `
        <img
            src="${coverBack.image}"
            alt="${coverBack.title}"
        >
    `;

    book.appendChild(backPage);


    /* =====================================================
       BACK COVER MENU
    ===================================================== */

    const backMenuItem =
        document.createElement("p");

    backMenuItem.textContent =
        `${String(pages.length).padStart(2, "0")} — ${coverBack.title}`;

    backMenuItem.style.cursor =
        "pointer";

    backMenuItem.addEventListener("click", () => {

        const backCoverIndex =
            book.querySelectorAll(".page").length - 1;

        pageFlip.turnToPage(
            backCoverIndex
        );

        menu.classList.remove("active");

    });

    menuPages.appendChild(
        backMenuItem
    );


    /* =====================================================
       PAGE FLIP
    ===================================================== */

    pageFlip =
        new St.PageFlip(
            book,
            {

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

            }
        );


    pageFlip.loadFromHTML(
        document.querySelectorAll(".page")
    );


    console.log(
        "Количество страниц:",
        pageFlip.getPageCount()
    );


    /* =====================================================
       CAMERA
    ===================================================== */

    const camera =
        document.getElementById("book");

    if (!camera) return;


    function updateTransform() {

        camera.style.transform =
            `translate(${moveX}px, ${moveY}px) scale(${baseScale * zoom})`;


        if (zoomValue) {

            zoomValue.textContent =
                `${Math.round(zoom * 100)}%`;

        }

    }


    /* =====================================================
       MOUSE DRAG
    ===================================================== */

    container.addEventListener(
        "mousedown",
        (e) => {

            /*
             * Не начинаем перемещение,
             * если нажали на текстовую панель.
             */

            if (
                e.target.closest(".text-panel")
            ) {
                return;
            }


            /*
             * Не начинаем перемещение,
             * если печатаем текст.
             */

            if (
                e.target.closest(".magazine-text")
            ) {
                return;
            }


            if (zoom <= 1) return;


            dragging = true;


            startX =
                e.clientX - moveX;

            startY =
                e.clientY - moveY;


            container.style.cursor =
                "grabbing";

        }
    );


    container.addEventListener(
        "mousemove",
        (e) => {

            if (!dragging) return;


            moveX =
                e.clientX - startX;

            moveY =
                e.clientY - startY;


            updateTransform();

        }
    );


    window.addEventListener(
        "mouseup",
        () => {

            dragging = false;

            container.style.cursor =
                "grab";

        }
    );


    /* =====================================================
       MOBILE SWIPE
    ===================================================== */

    container.addEventListener(
        "touchstart",
        (e) => {

            if (
                e.touches.length !== 1
            ) return;


            touchStartX =
                e.touches[0].clientX;

            touchStartY =
                e.touches[0].clientY;

        },
        { passive: true }
    );


    container.addEventListener(
        "touchend",
        (e) => {

            if (
                e.changedTouches.length !== 1
            ) return;


            const touchEndX =
                e.changedTouches[0].clientX;

            const touchEndY =
                e.changedTouches[0].clientY;


            const differenceX =
                touchEndX - touchStartX;

            const differenceY =
                touchEndY - touchStartY;


            if (
                Math.abs(differenceX) < 50
            ) return;


            if (
                Math.abs(differenceY) >
                Math.abs(differenceX)
            ) return;


            if (differenceX < 0) {

                pageFlip.flipNext();

            } else {

                pageFlip.flipPrev();

            }

        },
        { passive: true }
    );


    /* =====================================================
       ZOOM IN
    ===================================================== */

    if (zoomIn) {

        zoomIn.onclick = () => {

            zoom =
                Math.min(
                    zoom + 0.1,
                    4.5
                );

            updateTransform();

        };

    }


    /* =====================================================
       ZOOM OUT
    ===================================================== */

    if (zoomOut) {

        zoomOut.onclick = () => {

            zoom =
                Math.max(
                    zoom - 0.1,
                    0.5
                );

            updateTransform();

        };

    }


    /* =====================================================
       ZOOM RESET
    ===================================================== */

    if (zoomReset) {

        zoomReset.onclick = () => {

            zoom = 1;

            moveX = 0;
            moveY = 0;

            updateTransform();

        };

    }


    /* =====================================================
       WHEEL ZOOM
    ===================================================== */

    container.addEventListener(
        "wheel",
        (e) => {

            /*
             * Если крутим колесо над текстом,
             * всё равно работает zoom.
             */

            e.preventDefault();


            const delta =
                e.deltaY < 0
                    ? 0.08
                    : -0.08;


            zoom += delta;


            zoom =
                Math.min(
                    Math.max(zoom, 1),
                    4.5
                );


            updateTransform();

        },
        { passive: false }
    );


    /* =====================================================
       TEXT PANEL
    ===================================================== */

    if (textSmaller) {

        textSmaller.onclick = () => {

            if (!activeText) return;


            let size =
                parseFloat(
                    getComputedStyle(
                        activeText
                    ).fontSize
                );


            size =
                Math.max(
                    size - 2,
                    8
                );


            activeText.style.fontSize =
                `${size}px`;


            currentTextSize =
                size;


            localStorage.setItem(
                "magazine-text-size",
                currentTextSize
            );


            saveAllTexts();

            updateTextPanel();

        };

    }


    if (textLarger) {

        textLarger.onclick = () => {

            if (!activeText) return;


            let size =
                parseFloat(
                    getComputedStyle(
                        activeText
                    ).fontSize
                );


            size =
                Math.min(
                    size + 2,
                    72
                );


            activeText.style.fontSize =
                `${size}px`;


            currentTextSize =
                size;


            localStorage.setItem(
                "magazine-text-size",
                currentTextSize
            );


            saveAllTexts();

            updateTextPanel();

        };

    }


    if (textColor) {

        textColor.value =
            currentTextColor;


        textColor.oninput = () => {

            if (!activeText) return;


            activeText.style.color =
                textColor.value;


            currentTextColor =
                textColor.value;


            localStorage.setItem(
                "magazine-text-color",
                currentTextColor
            );


            saveAllTexts();

        };

    }


    /* =====================================================
       PREVIOUS / NEXT
    ===================================================== */

    const nextButton =
        document.getElementById("next");

    const prevButton =
        document.getElementById("prev");

    const bottomNext =
        document.getElementById("bottom-next");

    const bottomPrev =
        document.getElementById("bottom-prev");


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


    /* =====================================================
       MENU NAVIGATION
    ===================================================== */

    if (menuNext) {

        menuNext.onclick = () => {

            pageFlip.flipNext();

            menu.classList.remove(
                "active"
            );

        };

    }


    if (menuPrev) {

        menuPrev.onclick = () => {

            pageFlip.flipPrev();

            menu.classList.remove(
                "active"
            );

        };

    }


    /* =====================================================
       MENU
    ===================================================== */

    const menuButton =
        document.getElementById("menu-button");

    const closeMenu =
        document.getElementById("close-menu");


    if (menuButton) {

        menuButton.onclick = () => {

            menu.classList.add(
                "active"
            );

        };

    }


    if (closeMenu) {

        closeMenu.onclick = () => {

            menu.classList.remove(
                "active"
            );

        };

    }


    /* =====================================================
       KEYBOARD
    ===================================================== */

    document.addEventListener(
        "keydown",
        (e) => {

            if (
                e.key === "ArrowRight" &&
                !e.target.isContentEditable
            ) {

                pageFlip.flipNext();

            }


            if (
                e.key === "ArrowLeft" &&
                !e.target.isContentEditable
            ) {

                pageFlip.flipPrev();

            }


            if (
                e.key === "Escape"
            ) {

                menu.classList.remove(
                    "active"
                );

            }

        }
    );


    /* =====================================================
       INITIAL TRANSFORM
    ===================================================== */

    updateTransform();


    /* =====================================================
       UPDATE TEXT PANEL
    ===================================================== */

    function updateTextPanel() {

        if (!textSize) return;


        if (!activeText) {

            textSize.textContent =
                currentTextSize;

            if (textColor) {

                textColor.value =
                    currentTextColor;

            }

            return;

        }


        const size =
            parseFloat(
                getComputedStyle(
                    activeText
                ).fontSize
            );


        textSize.textContent =
            Math.round(size);


        if (textColor) {

            textColor.value =
                rgbToHex(
                    getComputedStyle(
                        activeText
                    ).color
                );

        }

    }


    /* =====================================================
       SAVE ALL TEXTS
    ===================================================== */

    function saveAllTexts() {

        const allPages =
            book.querySelectorAll(".page");


        allPages.forEach(page => {

            const image =
                page.querySelector("img");


            if (!image) return;


            const pageKey =
                `page-${image.getAttribute("src")}`;


            const texts =
                page.querySelectorAll(
                    ".magazine-text"
                );


            savedTexts[pageKey] =
                Array.from(texts).map(
                    text => ({

                        text:
                            text.textContent,

                        left:
                            text.style.left,

                        top:
                            text.style.top,

                        fontSize:
                            parseFloat(
                                text.style.fontSize
                            ) || currentTextSize,

                        color:
                            text.style.color ||
                            currentTextColor

                    })
                );

        });


        localStorage.setItem(
            "magazine-texts",
            JSON.stringify(savedTexts)
        );

    }


    /* =====================================================
       COLOR CONVERSION
    ===================================================== */

    function rgbToHex(rgb) {

        if (!rgb) return "#111111";


        if (
            rgb.startsWith("#")
        ) {
            return rgb;
        }


        const result =
            rgb.match(
                /\d+/g
            );


        if (!result) {
            return "#111111";
        }


        return "#" +
            result
                .slice(0, 3)
                .map(
                    x =>
                        Number(x)
                            .toString(16)
                            .padStart(2, "0")
                )
                .join("");

    }


    /* =====================================================
       CREATE TEXT ELEMENT
    ===================================================== */

    function createTextElement(
        page,
        pageKey,
        value,
        left,
        top,
        fontSize,
        color
    ) {

        const text =
            document.createElement("div");


        text.className =
            "magazine-text";


        text.contentEditable =
            "true";


        text.spellcheck =
            false;


        text.textContent =
            value;


        text.style.left =
            left;


        text.style.top =
            top;


        text.style.fontSize =
            `${fontSize}px`;


        text.style.color =
            color;


        page.appendChild(text);


        text.addEventListener(
            "mousedown",
            (e) => {

                e.stopPropagation();

                activeText =
                    text;

                updateTextPanel();

            }
        );


        text.addEventListener(
            "click",
            (e) => {

                e.stopPropagation();

                activeText =
                    text;

                updateTextPanel();

            }
        );


        text.addEventListener(
            "input",
            () => {

                activeText =
                    text;

                saveAllTexts();

            }
        );


        text.addEventListener(
            "focus",
            () => {

                activeText =
                    text;

                updateTextPanel();

            }
        );


        return text;

    }


    updateTextPanel();

}


loadMagazine().catch(
    (error) => {

        console.error(error);

    }
);
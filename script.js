// ------------------ NAVIGATION ------------------
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("[data-page]");
const navMenu = document.getElementById("navMenu");
const navToggle = document.getElementById("navToggle");

// show page function
function showPage(pageId) {
    pages.forEach(p => p.classList.add("hidden"));
    document.getElementById(pageId).classList.remove("hidden");
    navMenu.classList.remove("open");
}

navButtons.forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
});

// hamburger
navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
});


// ------------------ SWIPE NAV ------------------
let startX = 0;

document.addEventListener("touchstart", e => {
    startX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", e => {
    let endX = e.changedTouches[0].screenX;

    // swipe right = open menu
    if (endX - startX > 60) {
        navMenu.classList.add("open");
    }

    // swipe left = close menu
    if (startX - endX > 60) {
        navMenu.classList.remove("open");
    }
});


// ------------------ DARK / LIGHT MODE ------------------
const themeToggle = document.getElementById("themeToggle");

function applyTheme(t) {
    if (t === "light") {
        document.body.classList.add("light");
        themeToggle.textContent = "☀";
    } else {
        document.body.classList.remove("light");
        themeToggle.textContent = "☾";
    }
}

themeToggle.addEventListener("click", () => {
    const current = localStorage.getItem("theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
});

applyTheme(localStorage.getItem("theme") || "dark");


// ------------------ SAVE WEIGHT ------------------
const saveWeight = document.getElementById("saveWeight");
saveWeight.addEventListener("click", () => {
    let w = document.getElementById("weightInput").value;
    localStorage.setItem("weight", w);
    document.getElementById("dashWeight").textContent = w + " kg";
});

// ------------------ SAVE PROTEIN ------------------
const saveProtein = document.getElementById("saveProtein");
saveProtein.addEventListener("click", () => {
    let p = document.getElementById("proteinInput").value;
    localStorage.setItem("protein", p);
    document.getElementById("dashProtein").textContent = p + " g";
});

// ------------------ SAVE WORKOUT ------------------
const saveWorkout = document.getElementById("saveWorkout");
saveWorkout.addEventListener("click", () => {
    let kg = document.getElementById("workWeight").value;
    localStorage.setItem("workoutKG", kg);
    alert("Saved " + kg + " KG");
});

// ------------------ BODYFAT CALCULATION ------------------
const calcBF = document.getElementById("calcBF");
calcBF.addEventListener("click", () => {
    let waist = +document.getElementById("waist").value;
    let neck = +document.getElementById("neck").value;
    let height = +document.getElementById("height").value;

    if (!waist || !neck || !height) {
        document.getElementById("bfResult").textContent = "Missing fields.";
        return;
    }

    // US Navy Bodyfat formula (male)
    let bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) +
        0.15456 * Math.log10(height)) - 450;

    bf = Math.round(bf * 10) / 10;
    document.getElementById("bfResult").textContent = "Bodyfat: " + bf + "%";

    localStorage.setItem("bf", bf);
    document.getElementById("dashBF").textContent = bf + "%";
});

// ------------------ PROTEIN NEEDS ------------------
const calcProteinNeeds = document.getElementById("calcProteinNeeds");
calcProteinNeeds.addEventListener("click", () => {
    let bw = +document.getElementById("bodyWeight").value;
    if (!bw) return;

    let protein = bw * 1.6;
    document.getElementById("proteinNeedResult").textContent =
        "Daily needed protein: " + Math.round(protein) + " g";
});


// ------------------ LOAD DASHBOARD ------------------
window.onload = () => {
    let w = localStorage.getItem("weight");
    let p = localStorage.getItem("protein");
    let bf = localStorage.getItem("bf");

    if (w) document.getElementById("dashWeight").textContent = w + " kg";
    if (p) document.getElementById("dashProtein").textContent = p + " g";
    if (bf) document.getElementById("dashBF").textContent = bf + "%";
};

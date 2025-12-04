/* ---------- PAGE NAVIGATION ---------- */
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-links button");

function showPage(id) {
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    closeMenu();
}

navButtons.forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
});

/* ---------- NAV MENU ---------- */
const navMenu = document.getElementById("navMenu");
const navToggle = document.getElementById("navToggle");

function closeMenu() { navMenu.classList.remove("open"); }

navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
});

/* ---------- SWIPE NAVIGATION ---------- */
let touchX = 0;

document.addEventListener("touchstart", e => {
    touchX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", e => {
    let diff = e.changedTouches[0].screenX - touchX;

    if (diff > 70) navMenu.classList.add("open");
    if (diff < -70) closeMenu();
});

/* ---------- THEME TOGGLE ---------- */
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
    if (theme === "light") {
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
applyTheme(localStorage.getItem("theme"));

/* ---------- DATA STORAGE ---------- */
let workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
let diet = JSON.parse(localStorage.getItem("diet") || "[]");
let weight = JSON.parse(localStorage.getItem("weight") || "[]");

function saveAll() {
    localStorage.setItem("workouts", JSON.stringify(workouts));
    localStorage.setItem("diet", JSON.stringify(diet));
    localStorage.setItem("weight", JSON.stringify(weight));
    updateDashboard();
}

/* ---------- WORKOUTS ---------- */
function addWorkout() {
    let name = woName.value;
    let w = Number(woWeight.value);
    if (!name || !w) return;

    workouts.push({ name, w });
    saveAll();
    renderWorkouts();
}

function renderWorkouts() {
    workoutList.innerHTML = "";
    workouts.forEach(w => {
        let li = document.createElement("li");
        li.textContent = `${w.name}: ${w.w} kg`;
        workoutList.appendChild(li);
    });
}
renderWorkouts();

/* ---------- DIET ---------- */
function addFood() {
    let name = foodName.value;
    let p = Number(foodProtein.value);
    if (!name || !p) return;

    diet.push({ name, p });
    saveAll();
    renderDiet();
}

function renderDiet() {
    dietList.innerHTML = "";
    diet.forEach(f => {
        let li = document.createElement("li");
        li.textContent = `${f.name}: ${f.p}g protein`;
        dietList.appendChild(li);
    });
}
renderDiet();

/* ---------- DAILY WEIGHT ---------- */
function addWeight() {
    let w = Number(weightInput.value);
    if (!w) return;

    weight.push(w);
    saveAll();
    renderWeight();
}

function renderWeight() {
    weightList.innerHTML = "";
    weight.forEach(w => {
        let li = document.createElement("li");
        li.textContent = `${w} kg`;
        weightList.appendChild(li);
    });
}
renderWeight();

/* ---------- DASHBOARD ---------- */
function updateDashboard() {
    latestWeight.textContent = `Last Weight: ${weight.at(-1) || "—"}`;
    proteinToday.textContent = `Protein Today: ${diet.reduce((x, y) => x + y.p, 0)}g`;
    totalWorkouts.textContent = `Workouts Logged: ${workouts.length}`;
}
updateDashboard();

/* ---------- CALCULATIONS ---------- */
function calcBF() {
    let h = height.value;
    let n = neck.value;
    let w = waist.value;

    if (!h || !n || !w) return;

    let bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    bfResult.textContent = `Bodyfat: ${bf.toFixed(1)}%`;
}

function calcProtein() {
    let bw = Number(bodyWeightProtein.value);
    if (!bw) return;

    proteinResult.textContent = `Recommended: ${Math.round(bw * 1.6)}g`;
}

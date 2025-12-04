/* ====== NAVIGATION ====== */

document.querySelectorAll(".navbtn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
        document.getElementById(btn.dataset.section).classList.add("active");
    });
});

/* ====== WORKOUT LOG ====== */
function addWorkout() {
    const name = document.getElementById("wo_name").value;
    const w = document.getElementById("wo_weight").value;

    if (!name || !w) return;

    document.getElementById("dashboardWorkout").innerText = `${name} - ${w}kg`;

    const div = document.createElement("div");
    div.classList.add("card");
    div.innerText = `${name} - ${w}kg`;

    document.getElementById("workoutList").appendChild(div);
}

/* ====== MEAL LOG ====== */
function addMeal() {
    const name = document.getElementById("meal_name").value;
    const p = document.getElementById("meal_protein").value;

    if (!name || !p) return;

    document.getElementById("dashboardMeal").innerText = `${name} - ${p}g protein`;

    const div = document.createElement("div");
    div.classList.add("card");
    div.innerText = `${name} - ${p}g protein`;

    document.getElementById("mealList").appendChild(div);
}

/* ====== CALCULATIONS ====== */

/* Bodyfat (US Navy formula) */
function calcBF() {
    const weight = parseFloat(document.getElementById("weight").value);
    const waist = parseFloat(document.getElementById("waist").value);
    const height = parseFloat(document.getElementById("height").value);

    if (!weight || !waist || !height) {
        document.getElementById("bfResult").innerText = "Fill all fields.";
        return;
    }

    const bf = (495 / (1.0324 - 0.19077 * Math.log10(waist - weight) + 0.15456 * Math.log10(height))) - 450;

    document.getElementById("bfResult").innerText = `Your bodyfat: ${bf.toFixed(1)}%`;
}

/* Protein target */
function calcProtein() {
    const w = parseFloat(document.getElementById("proteinWeight").value);

    if (!w) {
        document.getElementById("proteinResult").innerText = "Enter your weight.";
        return;
    }

    const protein = w * 1.6;
    document.getElementById("proteinResult").innerText = `Daily protein target: ${protein.toFixed(0)}g`;
}

/* ====== THEME TOGGLE ====== */
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
    if (theme === "light") document.body.classList.add("light");
    else document.body.classList.remove("light");
}

themeToggle.addEventListener("click", () => {
    const current = localStorage.getItem("theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
});

applyTheme(localStorage.getItem("theme") || "dark");

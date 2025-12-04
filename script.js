// -------------------- PAGE SWITCHING --------------------
function showPage(page) {
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    document.getElementById(page).classList.remove("hidden");
    localStorage.setItem("currentPage", page);
}

showPage(localStorage.getItem("currentPage") || "dashboard");


// -------------------- THEME --------------------
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
    if (theme === "light") document.body.classList.add("light");
    else document.body.classList.remove("light");
}

themeToggle.onclick = () => {
    const now = localStorage.getItem("theme") === "light" ? "dark" : "light";
    localStorage.setItem("theme", now);
    applyTheme(now);
};

applyTheme(localStorage.getItem("theme") || "dark");


// -------------------- DASHBOARD VALUES --------------------
function quickAddWeight() {
    let w = prompt("Enter your weight (kg)");
    if (!w) return;
    localStorage.setItem("weight", w);
    document.getElementById("weightDisplay").innerText = w + " kg";
}

function quickAddProtein() {
    let p = prompt("Enter your protein (g)");
    if (!p) return;
    localStorage.setItem("protein", p);
    document.getElementById("proteinDisplay").innerText = p + " g";
}

// load saved
document.getElementById("weightDisplay").innerText =
    (localStorage.getItem("weight") || "Tap to set") + "";

document.getElementById("proteinDisplay").innerText =
    (localStorage.getItem("protein") || "Tap to set") + "";


// -------------------- WORKOUTS --------------------
function saveWorkout() {
    let item = document.getElementById("workoutInput").value.trim();
    if (!item) return;

    let list = JSON.parse(localStorage.getItem("workouts") || "[]");
    list.push(item);
    localStorage.setItem("workouts", JSON.stringify(list));
    
    renderWorkouts();
}

function renderWorkouts() {
    let list = JSON.parse(localStorage.getItem("workouts") || "[]");
    document.getElementById("workoutList").innerHTML = list.join("<br>");
}

renderWorkouts();


// -------------------- CALORIES --------------------
function saveCalories() {
    let c = document.getElementById("calInput").value;
    localStorage.setItem("calories", c);
    document.getElementById("calDisplay").innerText = c + " kcal";
}

document.getElementById("calDisplay").innerText =
    (localStorage.getItem("calories") || "") + " kcal";


// -------------------- BODY CALCULATIONS --------------------
function runCalculations() {
    let h = +height.value;
    let w = +weight.value;
    let waistVal = +waist.value;
    let neckVal = +neck.value;
    let ageVal = +age.value;

    // BF% (US Navy formula)
    let bf = 495 / (1.0324 - 0.19077 * Math.log10(waistVal - neckVal) + 0.15456 * Math.log10(h)) - 450;

    // Protein target (1.8g per kg)
    let prot = w * 1.8;

    // BMR (Mifflin St Jeor)
    let bmr = 10 * w + 6.25 * h - 5 * ageVal + 5;

    // TDEE (light activity multiplier)
    let tdee = bmr * 1.55;

    bfResult.innerText = "Bodyfat: " + bf.toFixed(1) + "%";
    proteinTarget.innerText = "Protein Target: " + prot.toFixed(0) + "g";
    bmrResult.innerText = "BMR: " + Math.round(bmr);
    tdeeResult.innerText = "TDEE: " + Math.round(tdee);
}

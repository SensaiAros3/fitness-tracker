// Storage
const storage = {
    getWorkouts(){return JSON.parse(localStorage.getItem("workouts")||"[]");},
    saveWorkouts(d){localStorage.setItem("workouts",JSON.stringify(d));},
    getMeals(){return JSON.parse(localStorage.getItem("meals")||"[]");},
    saveMeals(d){localStorage.setItem("meals",JSON.stringify(d));},
    getDailyInfo(){return JSON.parse(localStorage.getItem("dailyInfo")||"{}");},
    saveDailyInfo(date,weight,bodyfat){let i=storage.getDailyInfo();i[date]={weight:parseFloat(weight),bodyfat:parseFloat(bodyfat)};localStorage.setItem("dailyInfo",JSON.stringify(i));},
    getInfoByDate(date){const i=storage.getDailyInfo();return i[date]||{weight:0,bodyfat:0};}
};

// Navigation
document.querySelectorAll("nav button").forEach(btn=>{
    btn.addEventListener("click",()=>{
        document.querySelectorAll("nav button").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        showPage(btn.dataset.page);
    });
});

function showPage(pageName){
    document.querySelectorAll(".page").forEach(p=>p.style.display="none");
    document.getElementById(pageName+"-page").style.display="block";
    if(pageName==="dashboard") loadDashboard();
    if(pageName==="workouts") loadWorkoutsPage();
    if(pageName==="diet") loadDietPage();
    if(pageName==="calculations") updateCalculations();
}

// Dashboard
function loadDashboard(){
    const today=new Date().toISOString().split('T')[0];
    const weightInput=document.getElementById("dashWeightInput");
    const heightInput=document.getElementById("dashHeightInput");
    const neckInput=document.getElementById("dashNeckInput");
    const waistInput=document.getElementById("dashWaistInput");
    const hipsInput=document.getElementById("dashHipsInput");
    const genderInput=document.getElementById("dashGenderInput");
    const bfDisplay=document.getElementById("calcBodyfatDisplay");
    const info=storage.getInfoByDate(today);
    weightInput.value=info.weight||"";
    bfDisplay.textContent=info.bodyfat||"0";
    document.getElementById("saveInfoBtn").onclick=()=>{
        const weight=parseFloat(weightInput.value);
        const height=parseFloat(heightInput.value);
        const neck=parseFloat(neckInput.value);
        const waist=parseFloat(waistInput.value);
        const hips=parseFloat(hipsInput.value);
        const gender=genderInput.value;
        if(!weight||!height||!neck||!waist) return alert("Fill required fields: weight, height, neck, waist.");
        let bodyfat;
        if(gender==="male"){
            bodyfat=86.010*Math.log10(waist-neck)-70.041*Math.log10(height)+36.76;
        } else {
            if(!hips) return alert("Hips required for female bodyfat calc.");
            bodyfat=163.205*Math.log10(waist+hips-neck)-97.684*Math.log10(height)-78.387;
        }
        bodyfat=parseFloat(bodyfat.toFixed(1));
        bfDisplay.textContent=bodyfat;
        storage.saveDailyInfo(today,weight,bodyfat);
        updateCalculations();
        alert("Info saved.");
    };
}

// Calculations
function updateCalculations(){
    const today=new Date().toISOString().split('T')[0];
    const info=storage.getInfoByDate(today);
    const weight=info.weight||0;
    const bodyfat=info.bodyfat||0;
    const leanMass=(weight*(1-bodyfat/100)).toFixed(1);
    const fatMass=(weight*(bodyfat/100)).toFixed(1);
    const meals=storage.getMeals();
    const totalCalories=meals.reduce((a,b)=>a+b.calories,0);
    const totalProtein=meals.reduce((a,b)=>a+b.protein,0);
    const workouts=storage.getWorkouts();
    const totalVolume=workouts.reduce((a,b)=>a+b.weight*b.reps,0);
    const maxWeight=workouts.length?Math.max(...workouts.map(w=>w.weight)):0;
    const proteinPerKgLean=leanMass?(totalProtein/leanMass).toFixed(1):0;
    const caloriesPerKg=weight?(totalCalories/weight).toFixed(1):0;
    document.getElementById("calcWeight").textContent=weight;
    document.getElementById("calcBodyfat").textContent=bodyfat;
    document.getElementById("calcLeanMass").textContent=leanMass;
    document.getElementById("calcFatMass").textContent=fatMass;
    document.getElementById("calcCalories").textContent=totalCalories;
    document.getElementById("calcProtein").textContent=totalProtein;
    document.getElementById("calcProteinPerKgLean").textContent=proteinPerKgLean;
    document.getElementById("calcVolume").textContent=totalVolume;
    document.getElementById("calcMaxWeight").textContent=maxWeight;
    document.getElementById("calcCaloriesPerKg").textContent=caloriesPerKg;
}

// Workouts page
function loadWorkoutsPage(){
    const workouts=storage.getWorkouts();
    const workoutList=document.getElementById("workoutList");
    workoutList.innerHTML=workouts.map((w,i)=>`<div class="card"><h3>${w.date}</h3><p><strong>${w.exercise}</strong></p><p>${w.weight} kg × ${w.reps} reps</p><button class="btn" onclick="deleteWorkout(${i})">Delete</button></div>`).join("");
    const form=document.getElementById("workoutForm");
    form.onsubmit=e=>{
        e.preventDefault();
        const exercise=document.getElementById("exerciseName").value;
        const weight=parseFloat(document.getElementById("exerciseWeight").value);
        const reps=parseInt(document.getElementById("exerciseReps").value);
        if(!exercise||!weight||!reps) return;
        workouts.push({date:new Date().toLocaleDateString(),exercise,weight,reps});
        storage.saveWorkouts(workouts);
        form.reset();
        loadWorkoutsPage();
        updateCalculations();
    };
}
function deleteWorkout(i){let workouts=storage.getWorkouts();workouts.splice(i,1);storage.saveWorkouts(workouts);loadWorkoutsPage();updateCalculations();}

// Diet page
function loadDietPage(){
    const meals=storage.getMeals();
    const mealList=document.getElementById("mealList");
    mealList.innerHTML=meals.map((m,i)=>`<div class="card"><h3>${m.name}</h3><p>Calories: ${m.calories}</p><p>Protein: ${m.protein} g</p><button class="btn" onclick="deleteMeal(${i})">Delete</button></div>`).join("");
    const form=document.getElementById("mealForm");
    form.onsubmit=e=>{
        e.preventDefault();
        const name=document.getElementById("mealName").value;
        const calories=parseInt(document.getElementById("mealCalories").value);
        const protein=parseInt(document.getElementById("mealProtein").value);
        if(!name||!calories||!protein) return;
        meals.push({name,calories,protein});
        storage.saveMeals(meals);
        form.reset();
        loadDietPage();
        updateCalculations();
    };
}
function deleteMeal(i){let meals=storage.getMeals();meals.splice(i,1);storage.saveMeals(meals);loadDietPage();updateCalculations();}

// Service worker registration (optional)
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/service-worker.js').then(()=>console.log('SW registered')).catch(()=>{});
}
// THEME TOGGLE
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light");
    } else {
        document.body.classList.remove("light");
    }
}

themeToggle.addEventListener("click", () => {
    const current = localStorage.getItem("theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
});

// load saved theme
applyTheme(localStorage.getItem("theme") || "dark");

// Init
showPage("dashboard");

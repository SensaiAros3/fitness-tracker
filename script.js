/* Sand-Six — app script
   Features: storage, theme, navigation, swipe nav, charts, animations, CSV export
*/

// ---------- Storage helpers ----------
const storage = {
  getWorkouts(){ return JSON.parse(localStorage.getItem('ss_workouts')||'[]'); },
  saveWorkouts(a){ localStorage.setItem('ss_workouts', JSON.stringify(a)); },

  getMeals(){ return JSON.parse(localStorage.getItem('ss_meals')||'[]'); },
  saveMeals(a){ localStorage.setItem('ss_meals', JSON.stringify(a)); },

  // dailyInfo stored by date key: { "2025-12-04": {weight, height, neck, waist, hips, gender, bodyfat} }
  getDailyInfo(){ return JSON.parse(localStorage.getItem('ss_dailyInfo')||'{}'); },
  saveDailyInfo(date, obj){ let d = storage.getDailyInfo(); d[date] = obj; localStorage.setItem('ss_dailyInfo', JSON.stringify(d)); },
  getInfoByDate(date){ const d = storage.getDailyInfo(); return d[date] || null; },

  getTheme(){ return localStorage.getItem('ss_theme') || 'dark'; },
  setTheme(t){ localStorage.setItem('ss_theme', t); }
};

function todayKey(){ return new Date().toISOString().split('T')[0]; }
function nowDate(){ return new Date().toLocaleDateString(); }
/* ---------- PAGE NAVIGATION ---------- */
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-links button");

function showPage(id) {
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    closeMenu();
}

// ---------- Theme ----------
const themeToggle = document.getElementById('themeToggle');
function applyTheme(t){ if(t === 'light') document.body.classList.add('light'); else document.body.classList.remove('light'); }
themeToggle.addEventListener('click', ()=>{
  const cur = storage.getTheme();
  const next = cur === 'dark' ? 'light' : 'dark';
  storage.setTheme(next); applyTheme(next);
navButtons.forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
});
applyTheme(storage.getTheme());

// ---------- Page Navigation ----------
const pages = ['dashboard','workouts','meals','calculations'];
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(b => b.addEventListener('click', ()=> showPage(b.dataset.page)));

function showPage(name){
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.remove('active');
    p.classList.add('hidden');
  });
  const el = document.getElementById(name);
  if(!el) return;
  el.classList.remove('hidden');
  // small timeout to allow CSS transition
  setTimeout(()=> el.classList.add('active'), 5);

  // update active nav visual (optional)
  navButtons.forEach(nb => nb.classList.toggle('active', nb.dataset.page === name));

  if(name === 'workouts') renderWorkouts();
  if(name === 'meals') renderMeals();
  if(name === 'calculations') updateCalculations();
}
showPage(localStorage.getItem('ss_lastPage') || 'dashboard');
window.addEventListener('beforeunload', ()=> localStorage.setItem('ss_lastPage', document.querySelector('.page.active')?.id || 'dashboard'));

// ---------- Swipe Navigation (mobile) ----------
let touchStartX = 0;
let touchStartY = 0;
const minSwipe = 60;
document.addEventListener('touchstart', (e)=>{
  const t = e.touches[0];
  touchStartX = t.clientX; touchStartY = t.clientY;
}, {passive:true});
/* ---------- NAV MENU ---------- */
const navMenu = document.getElementById("navMenu");
const navToggle = document.getElementById("navToggle");

document.addEventListener('touchend', (e)=>{
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe){
    // horizontal swipe
    const active = document.querySelector('.page.active')?.id || 'dashboard';
    const idx = pages.indexOf(active);
    if(dx < 0 && idx < pages.length - 1) showPage(pages[idx+1]);
    if(dx > 0 && idx > 0) showPage(pages[idx-1]);
  }
}, {passive:true});
function closeMenu() { navMenu.classList.remove("open"); }

// Next/Prev header buttons
document.getElementById('menuNext').addEventListener('click', ()=>{
  const active = document.querySelector('.page.active')?.id || 'dashboard';
  const idx = pages.indexOf(active);
  if(idx < pages.length-1) showPage(pages[idx+1]);
navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
});
document.getElementById('menuPrev').addEventListener('click', ()=>{
  const active = document.querySelector('.page.active')?.id || 'dashboard';
  const idx = pages.indexOf(active);
  if(idx > 0) showPage(pages[idx-1]);
});

// ---------- Dashboard quick actions & daily info ----------
const dashWeight = document.getElementById('dashWeight');
const dashHeight = document.getElementById('dashHeight');
const dashNeck = document.getElementById('dashNeck');
const dashWaist = document.getElementById('dashWaist');
const dashHips = document.getElementById('dashHips');
const dashGender = document.getElementById('dashGender');
const bfDisplay = document.getElementById('bfDisplay');

function calcBodyfat(gender, height, neck, waist, hips){
  // US Navy formulas expect cm (height, neck, waist, hips)
  if(gender === 'male') {
    return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else {
    return 163.205 * Math.log10(waist + hips - neck) - 97.684 * Math.log10(height) - 78.387;
  }
}

document.getElementById('saveDailyInfo').addEventListener('click', ()=>{
  const weight = parseFloat(dashWeight.value) || 0;
  const height = parseFloat(dashHeight.value) || 0;
  const neck = parseFloat(dashNeck.value) || 0;
  const waist = parseFloat(dashWaist.value) || 0;
  const hips = parseFloat(dashHips.value) || 0;
  const gender = dashGender.value || 'male';
  if(!weight || !height || !neck || !waist){ return alert('Fill weight, height, neck and waist (hips for female).'); }
  if(gender === 'female' && !hips){ return alert('Hips required for female BF calc.'); }
/* ---------- SWIPE NAVIGATION ---------- */
let touchX = 0;

  const bf = parseFloat(calcBodyfat(gender, height, neck, waist, hips).toFixed(1));
  bfDisplay.textContent = bf.toFixed(1);
  const infoObj = { weight, height, neck, waist, hips, gender, bodyfat: bf, date: todayKey() };
  storage.saveDailyInfo(todayKey(), infoObj);
  updateCalculations();
  toast('Saved today');
document.addEventListener("touchstart", e => {
    touchX = e.changedTouches[0].screenX;
});

// quick +/- weight
document.getElementById('quickWeightPlus').addEventListener('click', ()=> {
  dashWeight.value = (parseFloat(dashWeight.value || 0) + 0.1).toFixed(1);
});
document.getElementById('quickWeightMinus').addEventListener('click', ()=> {
  dashWeight.value = Math.max(0, (parseFloat(dashWeight.value || 0) - 0.1)).toFixed(1);
});
document.addEventListener("touchend", e => {
    let diff = e.changedTouches[0].screenX - touchX;

// quick add meal
document.getElementById('quickAddMeal').addEventListener('click', ()=>{
  const name = document.getElementById('quickMealName').value.trim() || 'Quick meal';
  const calories = parseInt(document.getElementById('quickMealCalories').value) || 0;
  const protein = parseInt(document.getElementById('quickMealProtein').value) || 0;
  if(!calories && !protein) return toast('Add calories or protein first');
  const arr = storage.getMeals(); arr.push({ name, calories, protein, date: todayKey() }); storage.saveMeals(arr);
  toast('Meal added'); updateCalculations();
    if (diff > 70) navMenu.classList.add("open");
    if (diff < -70) closeMenu();
});

// quick add workout
document.getElementById('quickAddWorkout').addEventListener('click', ()=>{
  const ex = document.getElementById('quickExName').value.trim() || 'Quick';
  const wt = parseFloat(document.getElementById('quickExWeight').value) || 0;
  const reps = parseInt(document.getElementById('quickExReps').value) || 0;
  if(!wt || !reps) return toast('Enter weight and reps');
  const arr = storage.getWorkouts(); arr.push({ exercise: ex, weight: wt, reps, date: todayKey() }); storage.saveWorkouts(arr);
  toast('Workout added'); updateCalculations();
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

// quick open pages
document.getElementById('quickOpenMeals').addEventListener('click', ()=> showPage('meals'));
document.getElementById('quickOpenWorkouts').addEventListener('click', ()=> showPage('workouts'));
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

// ---------- Workouts form ----------
const workoutForm = document.getElementById('workoutForm');
const workoutList = document.getElementById('workoutList');
/* ---------- WORKOUTS ---------- */
function addWorkout() {
    let name = woName.value;
    let w = Number(woWeight.value);
    if (!name || !w) return;

function renderWorkouts(){
  const arr = storage.getWorkouts();
  if(!arr.length) { workoutList.innerHTML = '<p class="muted">No workouts logged.</p>'; return; }
  workoutList.innerHTML = arr.map((w,i)=>`
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${escapeHtml(w.exercise)}</strong><br/>
          <small class="muted">${w.date}</small>
        </div>
        <div style="text-align:right">
          <div>${w.weight} kg × ${w.reps}</div>
          <div style="margin-top:6px">
            <button data-i="${i}" class="btn del-work">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.del-work').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const i = parseInt(btn.dataset.i);
      const arr = storage.getWorkouts(); arr.splice(i,1); storage.saveWorkouts(arr); renderWorkouts(); updateCalculations();
    });
  });
    workouts.push({ name, w });
    saveAll();
    renderWorkouts();
}
workoutForm.addEventListener('submit', e=>{
  e.preventDefault();
  const ex = document.getElementById('exName').value.trim();
  const wt = parseFloat(document.getElementById('exWeight').value) || 0;
  const reps = parseInt(document.getElementById('exReps').value) || 0;
  if(!ex || !wt || !reps) return toast('Fill workout fields');
  const arr = storage.getWorkouts(); arr.push({ exercise: ex, weight: wt, reps, date: nowDate() }); storage.saveWorkouts(arr);
  workoutForm.reset(); renderWorkouts(); updateCalculations(); toast('Workout saved');
});
document.getElementById('clearWorkouts').addEventListener('click', ()=> { if(confirm('Clear all workouts?')){ storage.saveWorkouts([]); renderWorkouts(); updateCalculations(); } });
renderWorkouts();

// ---------- Meals form ----------
const mealForm = document.getElementById('mealForm');
const mealList = document.getElementById('mealList');

function renderMeals(){
  const arr = storage.getMeals();
  if(!arr.length){ mealList.innerHTML = '<p class="muted">No meals logged.</p>'; return; }
  mealList.innerHTML = arr.map((m,i)=>`
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><strong>${escapeHtml(m.name)}</strong><br/><small class="muted">${m.date}</small></div>
        <div style="text-align:right">
          <div>${m.calories} kcal</div>
          <div>${m.protein} g</div>
          <div style="margin-top:6px"><button data-i="${i}" class="btn del-meal">Delete</button></div>
        </div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.del-meal').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const i = parseInt(btn.dataset.i);
      const arr = storage.getMeals(); arr.splice(i,1); storage.saveMeals(arr); renderMeals(); updateCalculations();
function renderWorkouts() {
    workoutList.innerHTML = "";
    workouts.forEach(w => {
        let li = document.createElement("li");
        li.textContent = `${w.name}: ${w.w} kg`;
        workoutList.appendChild(li);
    });
  });
}
mealForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('mealName').value.trim();
  const cal = parseInt(document.getElementById('mealCalories').value) || 0;
  const prot = parseInt(document.getElementById('mealProtein').value) || 0;
  if(!name || (!cal && !prot)) return toast('Fill meal fields');
  const arr = storage.getMeals(); arr.push({ name, calories: cal, protein: prot, date: nowDate() }); storage.saveMeals(arr);
  mealForm.reset(); renderMeals(); updateCalculations(); toast('Meal saved');
});
document.getElementById('clearMeals').addEventListener('click', ()=> { if(confirm('Clear all meals?')){ storage.saveMeals([]); renderMeals(); updateCalculations(); } });
renderMeals();
renderWorkouts();

// ---------- Calculations & Charts ----------
let chartWeight=null, chartCalories=null, chartProtein=null;
/* ---------- DIET ---------- */
function addFood() {
    let name = foodName.value;
    let p = Number(foodProtein.value);
    if (!name || !p) return;

function buildDateArray(days=30){
  const a=[];
  const today = new Date();
  for(let i=days-1;i>=0;i--){
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    a.push(d.toISOString().split('T')[0]);
  }
  return a;
    diet.push({ name, p });
    saveAll();
    renderDiet();
}

function aggregateByDate(arr, dateKey='date', valueKey){
  // returns map date -> sum of valueKey
  const map = {};
  (arr||[]).forEach(item=>{
    const date = item[dateKey] || item.date || todayKey();
    const val = Number(item[valueKey]||0);
    map[date] = (map[date] || 0) + val;
  });
  return map;
function renderDiet() {
    dietList.innerHTML = "";
    diet.forEach(f => {
        let li = document.createElement("li");
        li.textContent = `${f.name}: ${f.p}g protein`;
        dietList.appendChild(li);
    });
}
renderDiet();

function updateCharts(){
  const dates = buildDateArray(30);
  const dailyInfo = storage.getDailyInfo();
  const meals = storage.getMeals();
  const mealsCals = aggregateByDate(meals, 'date', 'calories');
  const mealsProt = aggregateByDate(meals, 'date', 'protein');
/* ---------- DAILY WEIGHT ---------- */
function addWeight() {
    let w = Number(weightInput.value);
    if (!w) return;

  const wData = dates.map(d=>{
    const info = dailyInfo[d];
    return info ? (info.weight || null) : null;
  });

  const cData = dates.map(d=> mealsCals[d] || 0);
  const pData = dates.map(d=> mealsProt[d] || 0);

  // weight chart
  if(!chartWeight){
    chartWeight = new Chart(document.getElementById('chartWeight').getContext('2d'), {
      type:'line',
      data:{
        labels:dates,
        datasets:[{
          label:'Weight (kg)',
          data:wData,
          borderColor:getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00eaff',
          backgroundColor:'transparent',
          tension:0.25,
          pointRadius:2
        }]
      },
      options:{scales:{x:{display:false}}, plugins:{legend:{display:false}}}
    });
  } else {
    chartWeight.data.labels = dates;
    chartWeight.data.datasets[0].data = wData;
    chartWeight.update();
  }

  // calories chart
  if(!chartCalories){
    chartCalories = new Chart(document.getElementById('chartCalories').getContext('2d'), {
      type:'bar',
      data:{ labels:dates, datasets:[{ label:'Calories', data:cData, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent2').trim() || '#ff2a2a' }] },
      options:{scales:{x:{display:false}}, plugins:{legend:{display:false}}}
    });
  } else {
    chartCalories.data.labels = dates;
    chartCalories.data.datasets[0].data = cData;
    chartCalories.update();
  }
    weight.push(w);
    saveAll();
    renderWeight();
}

  // protein chart
  if(!chartProtein){
    chartProtein = new Chart(document.getElementById('chartProtein').getContext('2d'), {
      type:'bar',
      data:{ labels:dates, datasets:[{ label:'Protein (g)', data:pData, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00eaff' }] },
      options:{scales:{x:{display:false}}, plugins:{legend:{display:false}}}
function renderWeight() {
    weightList.innerHTML = "";
    weight.forEach(w => {
        let li = document.createElement("li");
        li.textContent = `${w} kg`;
        weightList.appendChild(li);
    });
  } else {
    chartProtein.data.labels = dates;
    chartProtein.data.datasets[0].data = pData;
    chartProtein.update();
  }
}
renderWeight();

function updateCalculations(){
  const info = storage.getInfoByDate(todayKey()) || {};
  const weight = info.weight || 0;
  document.getElementById('calcWeight').textContent = weight || '-';
  const bf = info.bodyfat || 0;
  document.getElementById('calcBF').textContent = bf || '-';
  const lean = weight ? (weight * (1 - bf/100)).toFixed(1) : '-';
  const fat = weight ? (weight * (bf/100)).toFixed(1) : '-';
  document.getElementById('calcLean').textContent = lean;
  document.getElementById('calcFat').textContent = fat;

  const meals = storage.getMeals();
  const totalCals = meals.reduce((s,m)=> s + (m.calories||0), 0);
  const totalProt = meals.reduce((s,m)=> s + (m.protein||0), 0);
  document.getElementById('calcCalories').textContent = totalCals;
  document.getElementById('calcProtein').textContent = totalProt;
  document.getElementById('calcProteinPerKg').textContent = (lean !== '-' && lean != 0) ? ( (totalProt / parseFloat(lean)).toFixed(1) ) : '-';

  const workouts = storage.getWorkouts();
  const totalVol = workouts.reduce((s,w)=> s + ((w.weight||0) * (w.reps||0)), 0);
  const maxLift = workouts.length ? Math.max(...workouts.map(w=>w.weight)) : 0;
  document.getElementById('calcVolume').textContent = totalVol;
  document.getElementById('calcMax').textContent = maxLift;

  // today's summary
  document.getElementById('todayCalories').textContent = meals.filter(m => m.date === todayKey()).reduce((s,m)=> s + m.calories, 0);
  document.getElementById('todayProtein').textContent = meals.filter(m => m.date === todayKey()).reduce((s,m)=> s + m.protein, 0);
  document.getElementById('todayVolume').textContent = workouts.filter(w => w.date === todayKey()).reduce((s,w)=> s + (w.weight * w.reps), 0);
  document.getElementById('todayMax').textContent = workouts.filter(w => w.date === todayKey()).reduce((s,w)=> Math.max(s, w.weight || 0), 0);

  updateCharts();
/* ---------- DASHBOARD ---------- */
function updateDashboard() {
    latestWeight.textContent = `Last Weight: ${weight.at(-1) || "—"}`;
    proteinToday.textContent = `Protein Today: ${diet.reduce((x, y) => x + y.p, 0)}g`;
    totalWorkouts.textContent = `Workouts Logged: ${workouts.length}`;
}
updateDashboard();

// ---------- Export CSV ----------
function exportCSV(){
  // combine meals, workouts, dailyInfo into CSV lines
  const meals = storage.getMeals();
  const workouts = storage.getWorkouts();
  const info = storage.getDailyInfo();
/* ---------- CALCULATIONS ---------- */
function calcBF() {
    let h = height.value;
    let n = neck.value;
    let w = waist.value;

  let rows = [['type','date','name','calories','protein','exercise','weight','reps','weight_kg','bodyfat']];
  meals.forEach(m => rows.push(['meal', m.date, m.name, m.calories, m.protein, '', '', '', '', '']));
  workouts.forEach(w => rows.push(['workout', w.date, '', '', '', w.exercise, w.weight, w.reps, '', '']));
  Object.keys(info).forEach(d => {
    const it = info[d];
    rows.push(['daily', d, '', '', '', '', '', '', it.weight || '', it.bodyfat || '']);
  });
    if (!h || !n || !w) return;

  const csv = rows.map(r=> r.map(v=> `"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'sand_six_data.csv'; a.click();
  URL.revokeObjectURL(url);
    let bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    bfResult.textContent = `Bodyfat: ${bf.toFixed(1)}%`;
}
document.getElementById('exportCSV').addEventListener('click', exportCSV);

// ---------- Clear All ----------
document.getElementById('clearAll').addEventListener('click', ()=>{
  if(!confirm('Clear all Sand-Six data? This cannot be undone.')) return;
  localStorage.removeItem('ss_workouts'); localStorage.removeItem('ss_meals'); localStorage.removeItem('ss_dailyInfo');
  renderMeals(); renderWorkouts(); updateCalculations(); toast('Cleared all data');
});

// ---------- small UI helpers ----------
function toast(msg){
  // tiny transient message: use alert for simplicity or implement small toast UI
  // here we'll use console + ephemeral title flash
  console.log('TOAST:', msg);
  const old = document.title;
  document.title = msg;
  setTimeout(()=> document.title = old, 1200);
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// ---------- prefill daily values if exist ----------
(function prefill(){
  const info = storage.getInfoByDate(todayKey()) || {};
  if(info.weight) dashWeight.value = info.weight;
  if(info.height) dashHeight.value = info.height;
  if(info.neck) dashNeck.value = info.neck;
  if(info.waist) dashWaist.value = info.waist;
  if(info.hips) dashHips.value = info.hips;
  if(info.gender) dashGender.value = info.gender;
  if(info.bodyfat) bfDisplay.textContent = info.bodyfat;
  renderMeals(); renderWorkouts(); updateCalculations();
})();
function calcProtein() {
    let bw = Number(bodyWeightProtein.value);
    if (!bw) return;

// ---------- service worker register (optional file) ----------
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/service-worker.js').catch(()=>{ /* ignore */ });
    proteinResult.textContent = `Recommended: ${Math.round(bw * 1.6)}g`;
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, child, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbYznd_wEyJPr_r1mnvUEy651QPhhk4TI",
  authDomain: "teknova-3688d.firebaseapp.com",
  databaseURL: "https://teknova-3688d-default-rtdb.firebaseio.com",
  projectId: "teknova-3688d",
  storageBucket: "teknova-3688d.firebasestorage.app",
  messagingSenderId: "1030215294939",
  appId: "1:1030215294939:web:4d82493402600f4285d1fe"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// FUNCTION YA KUONYESHA/FICHA FORM
function showDashboard(show){
  const loginDiv = document.getElementById('loginInputs');
  const dashDiv = document.getElementById('dashboard');
  const header = document.querySelector('.admin-header');
  
  if(show){
    if(loginDiv) loginDiv.style.display = 'none';
    if(dashDiv) dashDiv.style.display = 'block';
    if(header) header.style.display = 'none'; // Ficha "Admin Login" pia
  } else {
    if(loginDiv) loginDiv.style.display = 'block';
    if(dashDiv) dashDiv.style.display = 'none';
    if(header) header.style.display = 'block';
  }
}

window.handleSearch = function(){
  const val = document.getElementById('searchInput').value.toLowerCase().trim();
  if(val === 'admin login' || val === 'admin'){
    document.getElementById('adminModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

window.login = async function(){
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('pass').value;
  alert("Inaingia...");

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    showDashboard(true);
    alert("Umeingia!");
  } catch (error) {
    if(error.code === 'auth/user-not-found'){ alert("User hayupo"); }
    else if(error.code === 'auth/wrong-password'){ alert("Password si sahihi"); }
    else { alert("Error: " + error.message); }
  }
}

window.logout = async function(){
  await signOut(auth);
  showDashboard(false);
  document.getElementById('email').value = '';
  document.getElementById('pass').value = '';
}

// HII NDIO MUHIMU: KAMA AKO LOGIN ALREADY, ONYESHA DASHBOARD DIRECT
onAuthStateChanged(auth, (user) => {
  if (user) {
    showDashboard(true);
  } else {
    showDashboard(false);
  }
});

window.saveEneo = async function(){
  if(!auth.currentUser){ alert("Tafadhali ingia kwanza"); return; }
  const id = document.getElementById('jina').value.toLowerCase().replace(/ /g, "-");
  await set(ref(db, 'maeneo/' + id), {
    jina: document.getElementById('jina').value, mkoa: document.getElementById('mkoa').value, aina: document.getElementById('aina').value,
    pichaKuu: document.getElementById('picha').value, video: document.getElementById('video').value,
    maelezoFupi: document.getElementById('fupi').value, maelezoKamili: document.getElementById('kamili').value, active: true
  });
  alert("✓ Imehifadhiwa!");
  document.querySelectorAll('.form-box input,.form-box textarea').forEach(i => i.value = '');
}

async function loadMaeneo() {
  const snapshot = await get(child(ref(db), `maeneo`));
  const maeneoGrid = document.getElementById('maeneoGrid');
  if(!maeneoGrid) return;
  maeneoGrid.innerHTML = "";
  if(snapshot.exists()){
    snapshot.forEach((childSnapshot) => {
      const eneo = childSnapshot.val(); const id = childSnapshot.key;
      if(eneo.active){ maeneoGrid.innerHTML += `<div class="eneo-card" onclick="openEneo('${id}')"><img src="${eneo.pichaKuu}" class="eneo-img"><div class="eneo-tag">${eneo.aina}</div><h3>${eneo.jina}</h3><p class="eneo-excerpt">${eneo.maelezoFupi}</p><p class="eneo-mkoa"><i class="fa-solid fa-location-dot"></i> ${eneo.mkoa}</p></div>`; }
    });
  }
}
loadMaeneo();

window.openEneo = async function(id) {
  const snapshot = await get(child(ref(db), `maeneo/${id}`));
  if(snapshot.exists()){
    const eneo = snapshot.val();
    document.getElementById('eneoFullContent').innerHTML = `${eneo.video? `<iframe src="${eneo.video}" class="video-frame" allowfullscreen></iframe>` : `<img src="${eneo.pichaKuu}" class="blog-full-img">`}<div class="blog-full-body"><div class="blog-tag">${eneo.aina}</div><h1>${eneo.jina}</h1><p class="eneo-mkoa"><i class="fa-solid fa-location-dot"></i> ${eneo.mkoa}</p><p style="white-space: pre-line">${eneo.maelezoKamili}</p></div>`;
    document.getElementById('eneoModal').classList.add('active'); document.body.style.overflow = 'hidden';
  }
}

window.closeEneo = function(){ document.getElementById('eneoModal').classList.remove('active'); document.body.style.overflow = 'auto'; }
window.closeAdmin = function(){ document.getElementById('adminModal').classList.remove('active'); document.body.style.overflow = 'auto'; }

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

// 1. SEARCH + ADMIN POPUP
window.handleSearch = function(){
  const val = document.getElementById('searchInput').value.toLowerCase().trim();
  if(val === 'admin login' || val === 'admin'){
    document.getElementById('adminModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    alert("Tafuta: " + val);
  }
}

// 2. TEMPLATES
window.loadTemplate = function(type){
  const templates = {
    hifadhi: `**Mahali:** [Andika Mkoa]\n**Shughuli:** Safari, Camping, Wildlife\n**Muda Bora:** Juni - Oktoba\n**Ada:** [Andika]\n\n[Andika maelezo kamili hapa. Eleza wanyama, mandhari, na uzoefu]`,
    pwani: `**Mahali:** [Andika Mkoa / Kisiwa]\n**Shughuli:** Kuogelea, Snorkeling, Dhow Cruise\n**Muda Bora:** Julai - Februari\n**Ada:** [Andika]\n\n[Andika maelezo kamili hapa. Eleza mchanga, bahari, na utamaduni]`,
    mlima: `**Mahali:** [Andika Mkoa]\n**Shughuli:** Kupanda Mlima, Camping\n**Muda Bora:** Januari - Machi, Juni - Oktoba\n**Ada:** [Andika]\n\n[Andika maelezo kamili hapa. Eleza urefu, njia, na changamoto]`
  };
  document.getElementById('kamili').value = templates[type] || "";
}

// 3. LOGIN KWA FIREBASE AUTH
window.login = async function(){
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('pass').value;
  const errorMsg = document.getElementById('loginError');

  errorMsg.innerText = "Inaingia...";
  errorMsg.style.color = "#FCD116";

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    errorMsg.innerText = "";
    document.querySelector('.login-inputs').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
  } catch (error) {
    console.error("Login Error:", error.code);
    if(error.code === 'auth/user-not-found'){
      errorMsg.innerText = "User huyu hayupo. Ongeza kwenye Authentication";
    } else if(error.code === 'auth/wrong-password'){
      errorMsg.innerText = "Password si sahihi";
    } else if(error.code === 'auth/invalid-email'){
      errorMsg.innerText = "Email sio sahihi";
    } else {
      errorMsg.innerText = error.message;
    }
    errorMsg.style.color = "red";
  }
}

// 4. LOGOUT
window.logout = async function(){
  await signOut(auth);
  document.getElementById('dashboard').style.display = 'none';
  document.querySelector('.login-inputs').style.display = 'block';
  document.getElementById('email').value = '';
  document.getElementById('pass').value = '';
  document.getElementById('loginError').innerText = '';
}

// 5. KAMA AKO LOGIN ALREADY
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.querySelector('.login-inputs').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
  }
});

// 6. SAVE ENEO
window.saveEneo = async function(){
  if(!auth.currentUser){ alert("Tafadhali ingia kwanza"); return; }
  if(document.getElementById('jina').value === ""){ alert("Tafadhali jaza jina"); return; }
  if(document.getElementById('picha').value === ""){ alert("Tafadhali weka link ya picha"); return; }

  const id = document.getElementById('jina').value.toLowerCase().replace(/ /g, "-");
  await set(ref(db, 'maeneo/' + id), {
    jina: document.getElementById('jina').value,
    mkoa: document.getElementById('mkoa').value,
    aina: document.getElementById('aina').value,
    pichaKuu: document.getElementById('picha').value,
    video: document.getElementById('video').value,
    maelezoFupi: document.getElementById('fupi').value,
    maelezoKamili: document.getElementById('kamili').value,
    active: true
  });
  document.getElementById('saveMsg').innerText = "✓ Imehifadhiwa! Nenda homepage uone";
  document.querySelectorAll('.form-box input,.form-box textarea').forEach(i => i.value = '');
}

// 7. LOAD MAENEO
async function loadMaeneo() {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `maeneo`));
  const maeneoGrid = document.getElementById('maeneoGrid');
  maeneoGrid.innerHTML = "";
  if(snapshot.exists()){
    snapshot.forEach((childSnapshot) => {
      const eneo = childSnapshot.val();
      const id = childSnapshot.key;
      if(eneo.active){
        maeneoGrid.innerHTML += `
          <div class="eneo-card" onclick="openEneo('${id}')">
            <img src="${eneo.pichaKuu}" class="eneo-img" onerror="this.src='https://via.placeholder.com/400x200/00A859/fff?text=Tembea+TZ'">
            <div class="eneo-tag">${eneo.aina}</div>
            <h3>${eneo.jina}</h3>
            <p class="eneo-excerpt">${eneo.maelezoFupi}</p>
            <p class="eneo-mkoa"><i class="fa-solid fa-location-dot"></i> ${eneo.mkoa}</p>
          </div>
        `;
      }
    });
  } else {
    maeneoGrid.innerHTML = "<p style='color:#aaa; grid-column: 1/-1'>Bado hakuna vivutio. Ongeza kutoka dashboard</p>"
  }
}
loadMaeneo();

// 8. POPUP YA MAELEZO
window.openEneo = async function(id) {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `maeneo/${id}`));
  if(snapshot.exists()){
    const eneo = snapshot.val();
    document.getElementById('eneoFullContent').innerHTML = `
      ${eneo.video? `<iframe src="${eneo.video}" class="video-frame" allowfullscreen></iframe>` : `<img src="${eneo.pichaKuu}" class="blog-full-img" onerror="this.src='https://via.placeholder.com/800x300/00A859/fff?text=Tembea+TZ'">`}
      <div class="blog-full-body">
        <div class="blog-tag">${eneo.aina}</div>
        <h1>${eneo.jina}</h1>
        <p class="eneo-mkoa"><i class="fa-solid fa-location-dot"></i> ${eneo.mkoa}</p>
        <p style="white-space: pre-line; line-height:1.8">${eneo.maelezoKamili}</p>
      </div>
    `;
    document.getElementById('eneoModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

window.closeEneo = function(){
  document.getElementById('eneoModal').classList.remove('active');
  document.body.style.overflow = 'auto';
}

window.closeAdmin = function(){
  document.getElementById('adminModal').classList.remove('active');
  document.body.style.overflow = 'auto';
  logout();
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbYznd_wEyJPr_r1mnvUEy651QPhhk4TI",
  authDomain: "teknova-3688d.firebaseapp.com",
  databaseURL: "https://teknova-3688d-default-rtdb.us-central1.firebasedatabase.app", // <-- HII HAPA NDIO FIX
  projectId: "teknova-3688d",
  storageBucket: "teknova-3688d.firebasestorage.app",
  messagingSenderId: "1030215294939",
  appId: "1:1030215294939:web:4d82493402600f4285d1fe"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
let allPrompts = [];
let editingId = null; 
let currentLang = 'sw';
let likedPosts = JSON.parse(localStorage.getItem('novaLikes')) || [];

window.openAdmin = () => document.getElementById('adminModal').style.display = 'flex';
window.closeAdmin = () => document.getElementById('adminModal').style.display = 'none';
window.login = async () => {const email = document.getElementById('email').value;const pass = document.getElementById('pass').value;try { await signInWithEmailAndPassword(auth, email, pass); } catch(e){ document.getElementById('loginError').innerText = "Email au Password si sahihi"; }}
window.logout = async () => { await signOut(auth); }

onAuthStateChanged(auth, user => {if(user){ document.getElementById('loginBox').style.display = 'none'; document.getElementById('dashboard').style.display = 'block'; loadAllData();} else {document.getElementById('loginBox').style.display = 'block'; document.getElementById('dashboard').style.display = 'none';}});

function loadAllData(){
  const promptsRef = ref(db, 'prompts');
  onValue(promptsRef, (snapshot) => {
    allPrompts = [];
    if(snapshot.exists()){ snapshot.forEach(c => allPrompts.push({id: c.key, ...c.val()})); }
    loadFiltersAndCounts();loadPrompts();loadHighlights();loadAdminList();
  });
}

function loadFiltersAndCounts(){let categories = {};allPrompts.forEach(p => categories[p.cat] = (categories[p.cat] || 0) + 1);const select = document.getElementById('cat');select.innerHTML = '';Object.keys(categories).forEach(c => {let option = document.createElement('option');option.value = c;option.text = `Aina: ${c.toUpperCase()}`;select.appendChild(option);});const filterDiv = document.getElementById('filterSection');filterDiv.innerHTML = `<button class="filter-btn active" onclick="filterPrompts('all')">ZOTE (${allPrompts.length})</button>`;Object.keys(categories).forEach(c => {filterDiv.innerHTML += `<button class="filter-btn" onclick="filterPrompts('${c}')">${c.toUpperCase()} (${categories[c]})</button>`;});}
function loadHighlights(){const latest = [...allPrompts].sort((a,b) => b.id - a.id).slice(0,4);document.getElementById('latestList').innerHTML = latest.map(p => `<a href="#${p.id}" class="highlight-item">${p.text.substring(0,40)}...</a>`).join('');}
function loadPrompts(filter = 'all'){const grid = document.getElementById('promptGrid'); grid.innerHTML = '';let filtered = filter === 'all' ? allPrompts : allPrompts.filter(p => p.cat === filter);if(filtered.length > 0) filtered.forEach(p => {grid.innerHTML += `<div class="prompt-card" id="${p.id}"><img src="${p.img}" class="prompt-img" onerror="this.src='https://placehold.co/400x400/000/00F5FF'"><div class="prompt-body"><span class="prompt-tag">${p.cat}</span><p class="prompt-text">${p.text}</p><div class="btn-group"><button class="btn-copy-full" onclick="navigator.clipboard.writeText(\`${p.text.replace(/`/g, "\\`")}\`)">NAKILI</button><button class="btn-chatgpt-full" onclick="window.open('https://chat.openai.com/?q=${encodeURIComponent(p.text)}', '_blank')">OPEN IN CHATGPT</button></div></div>`;});else grid.innerHTML = `<p style='text-align:center; grid-column:1/-1; color:#aaa'>Hakuna prompts. Jumla: ${allPrompts.length}</p>`;}
window.savePrompt = async () => {const catSelect = document.getElementById('cat').value;const catInput = document.getElementById('newCatTemp').value.toLowerCase().trim();const finalCat = catInput !== "" ? catInput : catSelect;const data = { cat: finalCat, text: document.getElementById('promptText').value, img: document.getElementById('imgLink').value, likes: 25 };if(data.text === "" || data.img === ""){ alert("Jaza yote"); return; }if(editingId){ await update(ref(db, 'prompts/' + editingId), data); editingId = null; } else { const id = Date.now(); await set(ref(db, 'prompts/' + id), data); }document.getElementById('promptText').value = ''; document.getElementById('imgLink').value = '';document.getElementById('newCatTemp').value = '';alert("Imehifadhiwa!");}
window.editPrompt = (id) => {const p = allPrompts.find(x => x.id === id); if(p){ editingId = id; document.getElementById('cat').value = p.cat; document.getElementById('promptText').value = p.text; document.getElementById('imgLink').value = p.img; }};
async function loadAdminList(){const list = document.getElementById('adminPromptList'); list.innerHTML = '';allPrompts.slice().reverse().forEach(p => {list.innerHTML += `<div class="admin-item"><span><b>${p.cat.toUpperCase()}</b>: ${p.text.substring(0,35)}...</span> <div><button onclick="editPrompt('${p.id}')">Edit</button><button onclick="delPrompt('${p.id}')">Del</button></div></div>`;});}
window.delPrompt = async (id) => { if(confirm("Una uhakika?")){ await remove(ref(db, 'prompts/' + id)); } }
window.filterPrompts = (cat) => { loadPrompts(cat); }

loadAllData();
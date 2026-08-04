import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, child, set, remove, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {apiKey: "AIzaSyDbYznd_wEyJPr_r1mnvUEy651QPhhk4TI",authDomain: "teknova-3688d.firebaseapp.com",databaseURL: "https://teknova-3688d-default-rtdb.firebaseio.com",projectId: "teknova-3688d",storageBucket: "teknova-3688d.firebasestorage.app",messagingSenderId: "1030215294939",appId: "1:1030215294939:web:4d82493402600f4285d1fe"};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
let allPrompts = [];
let editingId = null; 
let currentLang = 'sw';
let likedPosts = JSON.parse(localStorage.getItem('novaLikes')) || [];

window.openAdmin = () => document.getElementById('adminModal').style.display = 'flex';
window.closeAdmin = () => document.getElementById('adminModal').style.display = 'none';

window.login = async () => {const email = document.getElementById('email').value;const pass = document.getElementById('pass').value;document.getElementById('loginError').innerText = currentLang === 'sw' ? "Inaingia..." : "Logging in...";try { await signInWithEmailAndPassword(auth, email, pass); } catch(e){ document.getElementById('loginError').innerText = currentLang === 'sw' ? "Email au Password si sahihi" : "Email or Password is incorrect"; }}
window.logout = async () => { await signOut(auth); }

onAuthStateChanged(auth, user => {if(user){ document.getElementById('loginBox').style.display = 'none'; document.getElementById('dashboard').style.display = 'block'; loadAllData();} else {document.getElementById('loginBox').style.display = 'block'; document.getElementById('dashboard').style.display = 'none'; resetForm();}});

async function loadAllData(){
  const snap = await get(child(ref(db), 'prompts'));
  allPrompts = [];
  if(snap.exists()) snap.forEach(c => allPrompts.push({id: c.key, likes: 25, ...c.val()}));
  loadFiltersAndCounts();loadPrompts();loadHighlights();loadAdminList();
}

function loadFiltersAndCounts(){
  let categories = {};allPrompts.forEach(p => categories[p.cat] = (categories[p.cat] || 0) + 1);
  const select = document.getElementById('cat');select.innerHTML = '';
  Object.keys(categories).forEach(c => {let option = document.createElement('option');option.value = c;option.text = `Aina: ${c.toUpperCase()}`;select.appendChild(option);});
  const filterDiv = document.getElementById('filterSection');const allText = currentLang === 'sw' ? 'ZOTE' : 'ALL';
  filterDiv.innerHTML = `<button class="filter-btn active" onclick="filterPrompts('all')"><i class="fa-solid fa-border-all"></i> ${allText} (${allPrompts.length})</button>`;
  Object.keys(categories).forEach(c => {filterDiv.innerHTML += `<button class="filter-btn" onclick="filterPrompts('${c}')">${c.toUpperCase()} (${categories[c]})</button>`;});
}

function loadHighlights(){
  const trendingDiv = document.getElementById('trendingList');const latestDiv = document.getElementById('latestList');
  const latest = [...allPrompts].sort((a,b) => b.id - a.id).slice(0,4);
  latestDiv.innerHTML = latest.map(p => `<a href="#${p.id}" class="highlight-item">${p.text.substring(0,40)}...</a>`).join('') || `<p>${currentLang === 'sw' ? 'Hakuna' : 'None'}</p>`;
  const trending = [...allPrompts].sort((a,b) => b.likes - a.likes).slice(0,4);
  trendingDiv.innerHTML = trending.map(p => `<a href="#${p.id}" class="highlight-item">${p.text.substring(0,40)}...</a>`).join('') || `<p>${currentLang === 'sw' ? 'Hakuna' : 'None'}</p>`;
}

function loadPrompts(filter = 'all', searchTerm = ''){
  const grid = document.getElementById('promptGrid'); grid.innerHTML = '';
  let filtered = allPrompts;
  if(filter !== 'all') filtered = filtered.filter(p => p.cat === filter);
  if(searchTerm !== '') filtered = filtered.filter(p => p.text.toLowerCase().includes(searchTerm.toLowerCase()));
  
  if(filtered.length > 0) filtered.forEach(p => {
    const safeText = p.text.replace(/`/g, "\\`");
    const promptURL = `${window.location.origin}/#${p.id}`;
    const isLiked = likedPosts.includes(p.id);
    const copyText = currentLang === 'sw' ? 'NAKILI' : 'COPY';
    const chatText = 'OPEN IN CHATGPT';
    const readMore = currentLang === 'sw' ? 'SOMA ZAIDI' : 'READ MORE';
    
    grid.innerHTML += `
    <div class="prompt-card" id="${p.id}" data-cat="${p.cat}">
      <img src="${p.img}" class="prompt-img" onerror="this.src='https://placehold.co/400x400/000/00F5FF?text=NOVA+SOFT'">
      <div class="prompt-body">
        <span class="prompt-tag">${p.cat}</span>
        <p class="prompt-text" id="text-${p.id}">${p.text}</p>
        <button class="btn-readmore" onclick="toggleReadMore('${p.id}')"><i class="fa-solid fa-chevron-down"></i> ${readMore}</button>
        
        <div class="action-bar">
          <div class="action-left">
            <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" onclick="likePost('${p.id}')"><i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i> <span>${p.likes + (isLiked ? 1 : 0)}</span></button>
            <button class="action-btn" onclick="downloadImage('${p.img}', '${p.id}')"><i class="fa-solid fa-download"></i></button>
            <button class="action-btn" onclick="sharePrompt('${promptURL}')"><i class="fa-solid fa-paper-plane"></i></button>
          </div>
        </div>

        <div class="btn-group">
          <button class="btn-copy-full" onclick="copyText(\`${safeText}\`)"><i class="fa-solid fa-copy"></i> ${copyText}</button>
          <button class="btn-chatgpt-full" onclick="sendToChatGPT(\`${safeText}\`)"><i class="fa-brands fa-openai"></i> ${chatText}</button>
        </div>
      </div>
    </div>`;
  });
  else grid.innerHTML = `<p style='text-align:center; grid-column:1/-1; color:#aaa'>${currentLang === 'sw' ? 'Hakuna prompt iliyopatikana' : 'No prompts found'}</p>`;
}

document.getElementById('searchInput').addEventListener('input', (e) => {loadPrompts('all', e.target.value);});

window.likePost = (id) => {if(likedPosts.includes(id)){ likedPosts = likedPosts.filter(x => x !== id); }else { likedPosts.push(id); }localStorage.setItem('novaLikes', JSON.stringify(likedPosts));loadPrompts();}
window.downloadImage = async (url, id) => {try{const response = await fetch(url);const blob = await response.blob();const link = document.createElement('a');link.href = URL.createObjectURL(blob);link.download = `nova-soft-${id}.jpg`;link.click();} catch(e){ alert(currentLang === 'sw' ? 'Imeshindikana kupakua picha' : 'Failed to download image') }}
window.sharePrompt = async (url) => {if(navigator.share){ await navigator.share({title: 'Nova Soft Prompt', text: currentLang === 'sw' ? 'Angalia prompt hii nzuri:' : 'Check this cool prompt:', url: url});}else { navigator.clipboard.writeText(url); alert(currentLang === 'sw' ? "✓ Link imenakiliwa" : "✓ Link copied"); }}

window.savePrompt = async () => {
  const btn = document.querySelector('.btn-save');const catSelect = document.getElementById('cat').value;const catInput = document.getElementById('newCatTemp').value.toLowerCase().trim();const finalCat = catInput !== "" ? catInput : catSelect;
  const data = { cat: finalCat, text: document.getElementById('promptText').value, img: document.getElementById('imgLink').value, likes: 25 };
  if(data.text === "" || data.img === ""){ document.getElementById('saveMsg').innerText = currentLang === 'sw' ? "Jaza prompt na link ya picha" : "Fill prompt and image link"; return; }
  if(editingId){ btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + (currentLang === 'sw' ? 'Inasasisha...' : 'Updating...'); await update(ref(db, 'prompts/' + editingId), data); document.getElementById('saveMsg').innerText = "✓ " + (currentLang === 'sw' ? 'Imesasishwa!' : 'Updated!'); editingId = null; } 
  else { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + (currentLang === 'sw' ? 'Inahifadhi...' : 'Saving...'); const id = Date.now(); await set(ref(db, 'prompts/' + id), data); document.getElementById('saveMsg').innerText = "✓ " + (currentLang === 'sw' ? 'Imehifadhiwa!' : 'Saved!'); }
  btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> ' + (currentLang === 'sw' ? 'HAZIFA PROMPT' : 'SAVE PROMPT'); resetForm(); loadAllData();
}

function resetForm(){document.getElementById('promptText').value = ''; document.getElementById('imgLink').value = '';document.getElementById('newCatTemp').value = '';document.getElementById('saveMsg').innerText = '';}
window.editPrompt = async (id) => {const p = allPrompts.find(x => x.id === id); if(p){ editingId = id; document.getElementById('cat').value = p.cat; document.getElementById('promptText').value = p.text; document.getElementById('imgLink').value = p.img; document.querySelector('.btn-save').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> ' + (currentLang === 'sw' ? 'SASISHA PROMPT' : 'UPDATE PROMPT'); document.getElementById('saveMsg').innerText = currentLang === 'sw' ? "Unahariri prompt hii..." : "Editing this prompt..."; window.scrollTo({top: 0, behavior: 'smooth'}); }}
async function loadAdminList(){const list = document.getElementById('adminPromptList'); list.innerHTML = '';if(allPrompts.length > 0) allPrompts.slice().reverse().forEach(p => {list.innerHTML += `<div class="admin-item"><span><b>${p.cat.toUpperCase()}</b>: ${p.text.substring(0,35)}...</span> <div><button class="btn-edit" onclick="editPrompt('${p.id}')"><i class="fa-solid fa-pen"></i></button><button class="btn-del" onclick="delPrompt('${p.id}')"><i class="fa-solid fa-trash"></i></button></div></div>`;});else list.innerHTML = `<p style='color:#aaa'>${currentLang === 'sw' ? 'Bado hakuna prompts' : 'No prompts yet'}</p>`;}
window.delPrompt = async (id) => { if(confirm(currentLang === 'sw' ? "Una uhakika?" : "Are you sure?")){ await remove(ref(db, 'prompts/' + id)); loadAllData(); } }
window.toggleReadMore = (id) => { const textEl = document.getElementById(`text-${id}`); const btnEl = event.target.closest('.btn-readmore'); textEl.classList.toggle('expanded'); const up = currentLang === 'sw' ? 'ONYESHA KIDOGO' : 'SHOW LESS'; const down = currentLang === 'sw' ? 'SOMA ZAIDI' : 'READ MORE'; btnEl.innerHTML = textEl.classList.contains('expanded') ? `<i class="fa-solid fa-chevron-up"></i> ${up}` : `<i class="fa-solid fa-chevron-down"></i> ${down}`; }
window.copyText = (text) => { navigator.clipboard.writeText(text); alert(currentLang === 'sw' ? "✓ Prompt imenakiliwa!" : "✓ Prompt copied!"); }
window.sendToChatGPT = (prompt) => { window.open(`https://chat.openai.com/?q=${encodeURIComponent(prompt)}`, '_blank'); }
window.filterPrompts = (cat) => { document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); loadPrompts(cat); }
window.toggleLanguage = () => {currentLang = currentLang === 'sw' ? 'en' : 'sw';document.getElementById('langText').innerText = currentLang === 'sw' ? 'EN' : 'SW';document.querySelectorAll('[data-sw]').forEach(el => {el.innerHTML = el.getAttribute(`data-${currentLang}`);});document.querySelectorAll('[data-sw-placeholder]').forEach(el => {el.placeholder = el.getAttribute(`data-${currentLang}-placeholder`);});loadAllData();}

loadAllData();
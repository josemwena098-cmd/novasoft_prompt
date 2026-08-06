// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbYznd_wEyJPr_r1mnvUEy651QPhhk4TI",
  authDomain: "teknova-3688d.firebaseapp.com",
  databaseURL: "https://teknova-3688d-default-rtdb.firebaseio.com",
  projectId: "teknova-3688d",
  storageBucket: "teknova-3688d.firebasestorage.app",
  messagingSenderId: "1030215294939",
  appId: "1:1030215294939:web:4d82493402600f4285d1fe",
  measurementId: "G-XTL8QCFMWW"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// LUGHA
let lang = localStorage.getItem('lang') || 'sw';
const texts = {
  sw: {
    lib:"LIBRARY",
    wa:"WhatsApp",
    fb:"Facebook",
    rights:"© 2026 Nova Soft. Haki Zote Zimehifadhiwa. Inaendeshwa na AI",
    lang:"🌍 EN",
    readMore:"SOMA ZAIDI",
    like:"❤️",
    copy:"📋 NAKILI",
    open:"OPEN IN CHATGPT",
    noPrompts:"Hakuna prompts bado"
  },
  en: {
    lib:"LIBRARY",
    wa:"WhatsApp",
    fb:"Facebook",
    rights:"© 2026 Nova Soft. All Rights Reserved. Powered by AI",
    lang:"🌍 SW",
    readMore:"READ MORE",
    like:"❤️",
    copy:"📋 COPY",
    open:"OPEN IN CHATGPT",
    noPrompts:"No prompts yet"
  }
}

// FUNCTION YA KUBADILISHA LUGHA
function applyLangPublic(){
  const libText = document.getElementById('libText');
  const langBtn = document.getElementById('langBtn');
  const footerText = document.getElementById('footerText');

  if(libText) libText.innerText = texts[lang].lib;
  if(document.querySelector('.wa')) document.querySelector('.wa').innerText = texts[lang].wa;
  if(document.querySelector('.fb')) document.querySelector('.fb').innerText = texts[lang].fb;
  if(footerText) footerText.innerText = texts[lang].rights;
  if(langBtn) langBtn.innerText = texts[lang].lang;

  loadPrompts(); // reload prompts na lugha mpya
}

function changeLang(){
  lang = lang === 'sw'? 'en' : 'sw';
  localStorage.setItem('lang', lang);
  applyLangPublic();
}

// KUSOMA PROMPTS KUTOKA FIREBASE
function loadPrompts() {
  const container = document.getElementById('promptsList');
  if(!container) return;

  db.ref('prompts').orderByChild('createdAt').on('value', (snapshot) => {
    const data = snapshot.val();
    container.innerHTML = "";
    if(data){
      Object.keys(data).reverse().forEach(key => {
        const item = data[key];
        const shortText = item.prompt.length > 120? item.prompt.substring(0,120)+"..." : item.prompt;
        const safePrompt = item.prompt.replace(/`/g, "'").replace(/"/g, '&quot;');

        container.innerHTML += `
          <div class="card">
            ${item.image? `<img src="${item.image}" class="card-img" alt="prompt image">` : ""}
            <span class="badge">${item.category}</span>
            <p class="prompt-text" id="text-${key}">${shortText}</p>
            ${item.prompt.length > 120? `<a onclick="toggleText('${key}', \`${safePrompt}\`)">${texts[lang].readMore}</a>` : ""}

            <div class="actions">
              <button onclick="likePrompt('${key}', ${item.likes})">${texts[lang].like} ${item.likes}</button>
              <button onclick="copyPrompt(\`${safePrompt}\`)">${texts[lang].copy}</button>
              <button onclick="openChatGPT(\`${safePrompt}\`)">${texts[lang].open}</button>
            </div>
          </div>
        `;
      });
    } else {
      container.innerHTML = `<p style='text-align:center; color:#666; margin-top:20px;'>${texts[lang].noPrompts}</p>`;
    }
  });
}

// KUPENDEZA
function likePrompt(id, current){
  db.ref('prompts/'+id+'/likes').set(current + 1);
}

// KUNAKILI
function copyPrompt(text){
  navigator.clipboard.writeText(text).then(()=>{
    alert(lang==='sw'? "Imenakiliwa!" : "Copied!");
  });
}

// KUFUNGUA CHATGPT
function openChatGPT(text){
  window.open('https://chat.openai.com/?q='+encodeURIComponent(text), '_blank');
}

// KUONYESHA TEXT YOTE
function toggleText(id, full){
  document.getElementById('text-'+id).innerText = full;
}

// RUN MARA YA KWANZA UKURASA UKIFUNGUKA
document.addEventListener('DOMContentLoaded', applyLangPublic);
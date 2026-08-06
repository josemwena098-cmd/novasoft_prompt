// WEKA FIREBASE CONFIG YAKO HAPA
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "teknova-3688d.firebaseapp.com",
  databaseURL: "https://teknova-3688d-default-rtdb.firebaseio.com",
  projectId: "teknova-3688d",
  storageBucket: "teknova-3688d.appspot.com",
  messagingSenderId: "...",
  appId: "..."
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
    open:"OPEN IN CHATGPT"
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
    open:"OPEN IN CHATGPT"
  }
}

function applyLangPublic(){
  document.getElementById('libText').innerText = texts[lang].lib;
  document.querySelector('.wa').innerText = texts[lang].wa;
  document.querySelector('.fb').innerText = texts[lang].fb;
  document.getElementById('footerText').innerText = texts[lang].rights;
  document.getElementById('langBtn').innerText = texts[lang].lang;
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
        container.innerHTML += `
          <div class="card">
            ${item.image? `<img src="${item.image}" class="card-img">` : ""}
            <span class="badge">${item.category}</span>
            <p class="prompt-text" id="text-${key}">${shortText}</p>
            ${item.prompt.length > 120? `<a onclick="toggleText('${key}', \`${item.prompt.replace(/`/g, "'")}\`)">${texts[lang].readMore}</a>` : ""}

            <div class="actions">
              <button onclick="likePrompt('${key}', ${item.likes})">${texts[lang].like} ${item.likes}</button>
              <button onclick="copyPrompt(\`${item.prompt.replace(/`/g, "'")}\`)">${texts[lang].copy}</button>
              <button onclick="window.open('https://chat.openai.com/?q='+encodeURIComponent(\`${item.prompt.replace(/`/g, "'")}\`))">${texts[lang].open}</button>
            </div>
          </div>
        `;
      });
    } else {
      container.innerHTML = "<p style='text-align:center; color:#666;'>Hakuna prompts bado</p>";
    }
  });
}

function likePrompt(id, current){
  db.ref('prompts/'+id+'/likes').set(current+1);
}

function copyPrompt(text){
  navigator.clipboard.writeText(text);
  alert(lang==='sw'? "Imenakiliwa!" : "Copied!");
}

function toggleText(id, full){
  document.getElementById('text-'+id).innerText = full;
}

// RUN
applyLangPublic();
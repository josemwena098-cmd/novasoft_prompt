const firebaseConfig = {
  apiKey: "AIzaSyAUiJdxQ4Z1oQ1t-jSJ7pRU2Rif2I1ZsUU",
  authDomain: "teknova-b248b.firebaseapp.com",
  databaseURL: "https://teknova-b248b-default-rtdb.firebaseio.com",
  projectId: "teknova-b248b",
  storageBucket: "teknova-b248b.firebasestorage.app",
  messagingSenderId: "603617582887",
  appId: "1:603617582887:web:b07ec173acf94767d6d302"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let lang = localStorage.getItem('lang') || 'sw';
const texts = {
  sw: {
    lib:"LIBRARY", 
    rights:"© 2026 Nova Soft. Haki Zote Zimehifadhiwa. Inaendeshwa na AI", 
    lang:"🌍 EN", 
    readMore:"SOMA ZAIDI", 
    like:"❤️", 
    copy:"📋", 
    share:"📤", 
    open:"Open on ChatGPT", 
    gemini:"Gemini", 
    noPrompts:"Hakuna prompts bado", 
    copied:"Ime-Nakiliwa!", 
    liked:"Umeshaipenda", 
    shared:"Ime-Share!"
  },
  en: {
    lib:"LIBRARY", 
    rights:"© 2026 Nova Soft. All Rights Reserved. Powered by AI", 
    lang:"🌍 SW", 
    readMore:"READ MORE", 
    like:"❤️", 
    copy:"📋", 
    share:"📤", 
    open:"Open on ChatGPT", 
    gemini:"Gemini", 
    noPrompts:"No prompts yet", 
    copied:"Copied!", 
    liked:"Already Liked", 
    shared:"Shared!"
  }
}

function showToast(msg){
  const toast = document.createElement('div');
  toast.innerText = msg;
  toast.style.cssText = `position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#10B981; color:white; padding:12px 20px; border-radius:8px; z-index:9999; font-size:14px; animation: fadeInUp 0.3s ease;`;
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(), 2000);
}

function applyLangPublic(){
  if(document.getElementById('libText')) document.getElementById('libText').innerText = texts[lang].lib;
  if(document.getElementById('footerText')) document.getElementById('footerText').innerText = texts[lang].rights;
  if(document.getElementById('langBtn')) document.getElementById('langBtn').innerText = texts[lang].lang;
  loadPrompts();
}
function changeLang(){ lang = lang === 'sw'? 'en' : 'sw'; localStorage.setItem('lang', lang); applyLangPublic(); }

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
        const liked = localStorage.getItem('liked_'+key)? 'disabled' : "";
        const currentUrl = window.location.href + '#prompt-' + key;

        container.innerHTML += `
          <div class="card" id="prompt-${key}">
            ${item.image? `
              <div class="card-img-container">
                <img src="${item.image}" class="card-img" alt="prompt">
                <div class="img-text-overlay">${item.category}</div>
              </div>
            ` : ""}
            <div style="padding-top:15px;">
              <span class="badge">${item.category}</span>
              <p class="prompt-text" id="text-${key}">${shortText}</p>
              ${item.prompt.length > 120? `<a onclick="toggleText('${key}', \`${safePrompt}\`)">${texts[lang].readMore}</a>` : ""}
            </div>
            <div class="actions">
              <button class="btn-like" ${liked} onclick="likePrompt('${key}', ${item.likes})">${texts[lang].like} ${item.likes}</button>
              <button class="btn-copy" onclick="copyPrompt(\`${safePrompt}\`)">${texts[lang].copy}</button>
              <button class="btn-share" onclick="sharePrompt(\`${safePrompt}\`, '${currentUrl}')">${texts[lang].share}</button>
              <button class="btn-gpt" onclick="openChatGPT(\`${safePrompt}\`)">${texts[lang].open}</button>
              <button class="btn-gemini" onclick="openGemini(\`${safePrompt}\`)">${texts[lang].gemini}</button>
            </div>
          </div>
        `;
      });
    } else {
      container.innerHTML = `<p style='text-align:center; color:#666; margin-top:20px;'>${texts[lang].noPrompts}</p>`;
    }
  });
}

function likePrompt(id, current){
  if(localStorage.getItem('liked_'+id)) { showToast(texts[lang].liked); return; }
  db.ref('prompts/'+id+'/likes').set(current + 1);
  localStorage.setItem('liked_'+id, 'true');
  showToast(texts[lang].like);
}

function copyPrompt(text){ 
  navigator.clipboard.writeText(text).then(()=>{ 
    showToast(texts[lang].copied); 
  }); 
}

function sharePrompt(text, url){
  if (navigator.share) {
    navigator.share({
      title: 'Nova Soft Prompt',
      text: text,
      url: url
    }).then(() => showToast(texts[lang].shared))
   .catch(() => {});
  } else {
    copyPrompt(text);
  }
}

function openChatGPT(text){ window.open('https://chat.openai.com/?q='+encodeURIComponent(text), '_blank'); }
function openGemini(text){ window.open('https://gemini.google.com/app?q='+encodeURIComponent(text), '_blank'); }
function toggleText(id, full){ document.getElementById('text-'+id).innerText = full; }
document.addEventListener('DOMContentLoaded', applyLangPublic);
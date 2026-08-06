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
    lib:"LIBRARY", rights:"© 2026 Nova Soft. All Rights Reserved. Powered by AI",
    lang:"🌍 EN", readMore:"Soma zaidi", copy:"Copy", open:"Open on ChatGPT",
    gemini:"Gemini", noPrompts:"Hakuna prompts bado", copied:"Ime-Nakiliwa!",
    liked:"Umeshaipenda", shared:"Ime-Share!", downloaded:"Ime-Download!"
  },
  en: {
    lib:"LIBRARY", rights:"© 2026 Nova Soft. All Rights Reserved. Powered by AI",
    lang:"🌍 SW", readMore:"Read more", copy:"Copy", open:"Open on ChatGPT",
    gemini:"Gemini", noPrompts:"No prompts yet", copied:"Copied!",
    liked:"Already Liked", shared:"Shared!", downloaded:"Downloaded!"
  }
}

function showToast(msg){
  const toast = document.createElement('div');
  toast.innerText = msg;
  toast.style.cssText = `position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#111; color:white; padding:10px 16px; border-radius:8px; z-index:9999; font-size:13px; font-weight:500;`;
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
        const shortText = item.prompt.length > 150? item.prompt.substring(0,150)+"..." : item.prompt;
        const safePrompt = item.prompt.replace(/`/g, "'").replace(/"/g, '&quot;');
        const liked = localStorage.getItem('liked_'+key)? 'liked' : "";
        const likes = item.likes || 0;
        const currentUrl = window.location.href + '#prompt-' + key;

        container.innerHTML += `
          <div class="card" id="prompt-${key}">
            ${item.image? `
              <div class="card-img-container">
                <img src="${item.image}" class="card-img" alt="prompt">
              </div>
            ` : ""}
            <div class="card-body">
              <span class="badge">${item.category}</span>
              <p class="prompt-text" id="text-${key}">${shortText}</p>
              ${item.prompt.length > 150? `<a onclick="toggleText('${key}', \`${safePrompt}\`)">${texts[lang].readMore}</a>` : ""}
            </div>
            <div class="actions">
              <button class="action-btn like-btn ${liked}" onclick="likePrompt('${key}', ${likes})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                ${likes > 0? likes : ''}
              </button>
              <button class="action-btn" onclick="downloadImage('${item.image}', '${key}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
              <button class="action-btn" onclick="sharePrompt(\`${safePrompt}\`, '${currentUrl}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
              <button class="action-btn copy-btn" onclick="copyPrompt(\`${safePrompt}\`)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                ${texts[lang].copy}
              </button>
            </div>
            <div class="ai-buttons">
              <button class="btn-gpt" onclick="openChatGPT(\`${safePrompt}\`)">${texts[lang].open}</button>
              <button class="btn-gemini" onclick="openGemini(\`${safePrompt}\`)">${texts[lang].gemini}</button>
            </div>
          </div>
        `;
      });
    } else {
      container.innerHTML = `<p style='text-align:center; color:#999; margin-top:20px;'>${texts[lang].noPrompts}</p>`;
    }
  }, (error)=>{
    console.error(error);
    container.innerHTML = `<p style='text-align:center; color:red;'>Error: Hakuna ruhusa ya kusoma data. Angalia Firebase Rules</p>`;
  });
}

function likePrompt(id, current){
  if(localStorage.getItem('liked_'+id)) { showToast(texts[lang].liked); return; }
  db.ref('prompts/'+id+'/likes').set(current + 1);
  localStorage.setItem('liked_'+id, 'true');
  showToast("❤️");
}

function downloadImage(url, id){
  if(!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nova-prompt-'+id+'.jpg';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(texts[lang].downloaded);
}

function copyPrompt(text){
  navigator.clipboard.writeText(text).then(()=>{ showToast(texts[lang].copied); });
}

function sharePrompt(text, url){
  if (navigator.share) {
    navigator.share({ title: 'Nova Soft Prompt', text: text, url: url })
   .then(() => showToast(texts[lang].shared))
   .catch(() => {});
  } else {
    copyPrompt(text + "\n" + url);
  }
}

function openChatGPT(text){ window.open('https://chat.openai.com/?q='+encodeURIComponent(text), '_blank'); }
function openGemini(text){ window.open('https://gemini.google.com/app?q='+encodeURIComponent(text), '_blank'); }
function toggleText(id, full){ document.getElementById('text-'+id).innerText = full; }
document.addEventListener('DOMContentLoaded', applyLangPublic);
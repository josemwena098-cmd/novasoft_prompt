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

// FUNCTION YA KUHIFADHI - INATUMIKA ADMIN.HTML TU
function savePrompt() {
  const category = document.getElementById('category').value;
  const prompt = document.getElementById('prompt').value;
  const imageLink = document.getElementById('imageLink').value;

  if(!category ||!prompt) { alert("Jaza Category na Prompt"); return; }

  db.ref('prompts').push({
    category: category,
    prompt: prompt,
    image: imageLink,
    likes: 25, // automatic like 25
    createdAt: Date.now()
  }).then(() => {
    alert("Prompt Imehifadhiwa!");
    document.getElementById('category').value = "";
    document.getElementById('prompt').value = "";
    document.getElementById('imageLink').value = "";
  });
}

// FUNCTION YA KUSOMA - INATUMIKA INDEX.HTML
function loadPrompts() {
  const container = document.getElementById('promptsList');
  if(!container) return; // kama uko admin.html isirun

  db.ref('prompts').on('value', (snapshot) => {
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
            ${item.prompt.length > 120? `<a onclick="toggleText('${key}', \`${item.prompt}\`)">SOMA ZAIDI</a>` : ""}

            <div class="actions">
              <button onclick="likePrompt('${key}', ${item.likes})">❤️ ${item.likes}</button>
              <button onclick="copyPrompt(\`${item.prompt}\`)">📋 NAKILI</button>
              <button onclick="window.open('https://chat.openai.com/?q='+encodeURIComponent(\`${item.prompt}\`))">OPEN IN CHATGPT</button>
            </div>
          </div>
        `;
      });
    }
  });
}

function likePrompt(id, current){
  db.ref('prompts/'+id+'/likes').set(current+1);
}

function copyPrompt(text){
  navigator.clipboard.writeText(text);
  alert("Imenakiliwa!");
}

function toggleText(id, full){
  document.getElementById('text-'+id).innerText = full;
}

loadPrompts();
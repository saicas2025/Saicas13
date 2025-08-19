// pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Tabs
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

const { BACKEND_URL } = window.APP_CONFIG || {};
const pdfInput  = document.getElementById('pdfInput');
const rawText   = document.getElementById('rawText');
const eurKg     = document.getElementById('eurKg');
const eurH      = document.getElementById('eurH');
const eurMq     = document.getElementById('eurMq');
const extractBtn= document.getElementById('extractBtn');
const quoteBtn  = document.getElementById('quoteBtn');
const exportBtn = document.getElementById('exportBtn');
const result    = document.getElementById('result');
const statusEl  = document.getElementById('status');

const chatBox   = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendBtn   = document.getElementById('sendBtn');
const chatStatus= document.getElementById('chatStatus');

function setStatus(m){ statusEl.textContent = m || ''; }
function setChatStatus(m){ chatStatus.textContent = m || ''; }

// Estrai testo dal PDF lato client
async function extractPdfText(file){
  if(!file) throw new Error('Nessun PDF selezionato');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
  let out = '';
  for(let i=1;i<=pdf.numPages;i++){
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const textItems = content.items.map(it => it.str).join(' ');
    out += textItems + '\n';
  }
  return out.trim().slice(0, 8000);
}

extractBtn.addEventListener('click', async () => {
  try{
    setStatus('📖 Lettura PDF in corso…');
    const file = pdfInput.files?.[0];
    const text = await extractPdfText(file);
    rawText.value = (rawText.value ? rawText.value + '\n\n' : '') + text;
    setStatus('✅ PDF letto.');
  }catch(e){ setStatus('❌ ' + e.message); }
});

quoteBtn.addEventListener('click', async () => {
  if(!BACKEND_URL || BACKEND_URL.includes('INSERISCI')){
    alert('Config mancante: apri config.js e imposta BACKEND_URL (Replit/Vercel/Netlify Function).');
    return;
  }
  try{
    setStatus('🤖 Calcolo preventivo…');
    quoteBtn.disabled = true;
    const payload = {
      text: (rawText.value || '').trim(),
      eurKg: parseFloat(eurKg.value||0),
      eurH:  parseFloat(eurH.value||0),
      eurMq: parseFloat(eurMq.value||0)
    };
    const r = await fetch(BACKEND_URL + '/quote', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if(!r.ok) throw new Error(data.error || 'Errore server');
    result.value = data.answer || '';
    setStatus('✅ Fatto.');
  }catch(e){ setStatus('❌ ' + e.message); }
  finally{ quoteBtn.disabled = false; }
});

exportBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'pt', format:'a4' });
  const lines = (result.value || '').split('\n');
  let y = 40;
  doc.setFont('helvetica',''); doc.setFontSize(12);
  for(const line of lines){
    const wrapped = doc.splitTextToSize(line, 520);
    for(const wl of wrapped){
      if(y > 780){ doc.addPage(); y = 40; }
      doc.text(40, y, wl);
      y += 16;
    }
    y += 4;
  }
  doc.save('preventivo_ai.pdf');
});

// Chat
sendBtn.addEventListener('click', async () => {
  if(!BACKEND_URL || BACKEND_URL.includes('INSERISCI')){
    alert('Config mancante: apri config.js e imposta BACKEND_URL (Replit/Vercel/Netlify Function).');
    return;
  }
  const msg = chatInput.value.trim();
  if(!msg) return;
  chatBox.innerHTML += `<div><b>Tu:</b> ${msg}</div>`;
  chatInput.value = '';
  setChatStatus('✉️ Invio…');
  try{
    const r = await fetch(BACKEND_URL + '/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message: msg })
    });
    const data = await r.json();
    if(!r.ok) throw new Error(data.error || 'Errore server');
    chatBox.innerHTML += `<div><b>AI:</b> ${data.reply}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    setChatStatus('');
  }catch(e){
    setChatStatus('❌ ' + e.message);
  }
});

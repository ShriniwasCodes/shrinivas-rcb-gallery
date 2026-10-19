const input = document.getElementById('file-input');
const grid = document.getElementById('gallery-grid');
const empty = document.getElementById('empty-state');
const notice = document.getElementById('notice');
const clearButton = document.getElementById('clear-button');
const viewer = document.getElementById('viewer');
const viewerImage = document.getElementById('viewer-image');
const viewerCaption = document.getElementById('viewer-caption');
let drawings = [];

document.getElementById('year').textContent = new Date().getFullYear();

function loadDrawings() {
  try { drawings = JSON.parse(localStorage.getItem('shrinivas_gallery_drawings') || '[]'); }
  catch { drawings = []; }
  render();
}
function saveDrawings() {
  try {
    localStorage.setItem('shrinivas_gallery_drawings', JSON.stringify(drawings));
    notice.textContent = 'Your drawings are saved in this browser only. They are not uploaded to a server or visible to other visitors.';
  } catch {
    notice.textContent = 'Browser storage is full. Try smaller images or remove a few drawings, then upload again.';
  }
}
function render() {
  grid.innerHTML = '';
  empty.hidden = drawings.length > 0;
  drawings.forEach((drawing, index) => {
    const card = document.createElement('article');
    card.className = 'art-card';
    const wrap = document.createElement('div');
    wrap.className = 'art-image-wrap';
    const img = document.createElement('img');
    img.src = drawing.data;
    img.alt = drawing.title;
    img.loading = 'lazy';
    wrap.appendChild(img);
    wrap.addEventListener('click', () => {
      viewerImage.src = drawing.data;
      viewerCaption.textContent = drawing.title;
      viewer.showModal();
    });
    const meta = document.createElement('div');
    meta.className = 'art-meta';
    const title = document.createElement('span');
    title.className = 'art-title';
    title.textContent = drawing.title;
    const date = document.createElement('span');
    date.className = 'art-date';
    date.textContent = drawing.date;
    meta.append(title, date);
    const remove = document.createElement('button');
    remove.className = 'delete-art';
    remove.type = 'button';
    remove.title = 'Remove this drawing';
    remove.setAttribute('aria-label', 'Remove ' + drawing.title);
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      if (confirm('Remove "' + drawing.title + '" from this browser?')) {
        drawings.splice(index, 1); saveDrawings(); render();
      }
    });
    card.append(wrap, meta, remove);
    grid.appendChild(card);
  });
}
input.addEventListener('change', async event => {
  const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/'));
  for (const file of files) {
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    drawings.unshift({
      title: file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
      data,
      date: new Date().toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'})
    });
  }
  saveDrawings(); render(); input.value = '';
});
clearButton.addEventListener('click', () => {
  if (drawings.length && confirm('Remove every drawing saved in this browser?')) {
    drawings = []; saveDrawings(); render();
  }
});
document.getElementById('close-viewer').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
loadDrawings();

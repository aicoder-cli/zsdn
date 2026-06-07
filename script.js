const root = document.documentElement;
const progress = document.getElementById('progress');
const toc = document.getElementById('toc');
const links = [...document.querySelectorAll('.toc-link')];
const backTop = document.getElementById('backTop');
let fontSize = Number(localStorage.getItem('readerFontSize') || 19);

function applyFontSize() {
  root.style.setProperty('--reader-font-size', `${fontSize}px`);
  localStorage.setItem('readerFontSize', String(fontSize));
}

function applyTheme() {
  const dark = localStorage.getItem('theme') === 'dark';
  root.classList.toggle('dark', dark);
  document.getElementById('themeToggle').textContent = dark ? '浅色模式' : '深色模式';
}

function updateProgress() {
  const max = document.body.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  backTop.classList.toggle('show', window.scrollY > 600);
}

const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  const heading = visible.target.querySelector('h2, h3');
  if (!heading) return;
  links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${heading.id}`));
}, { rootMargin: '-12% 0px -70% 0px', threshold: [0.01, 0.2, 0.6] });

document.querySelectorAll('.article-section').forEach(section => observer.observe(section));
document.getElementById('themeToggle').addEventListener('click', () => {
  localStorage.setItem('theme', root.classList.contains('dark') ? 'light' : 'dark');
  applyTheme();
});
document.getElementById('increaseFont').addEventListener('click', () => {
  fontSize = Math.min(24, fontSize + 1);
  applyFontSize();
});
document.getElementById('decreaseFont').addEventListener('click', () => {
  fontSize = Math.max(16, fontSize - 1);
  applyFontSize();
});
document.getElementById('toggleToc').addEventListener('click', () => toc.classList.toggle('open'));
toc.addEventListener('click', (event) => {
  if (event.target.closest('a')) toc.classList.remove('open');
});
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
window.addEventListener('scroll', updateProgress, { passive: true });
applyFontSize();
applyTheme();
updateProgress();

function ensureLightbox() {
  let box = document.querySelector('.image-lightbox');
  if (!box) {
    box = document.createElement('div');
    box.className = 'image-lightbox';
    box.innerHTML = '<button type="button" class="lightbox-close" aria-label="关闭图片预览">×</button><img alt="">';
    document.body.appendChild(box);
  }
  return box;
}

function openLightbox(image) {
  const box = ensureLightbox();
  const preview = box.querySelector('img');
  preview.src = image.currentSrc || image.src;
  preview.alt = image.alt || '图片预览';
  box.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeLightbox() {
  const box = document.querySelector('.image-lightbox');
  if (!box) return;
  box.classList.remove('open');
  const preview = box.querySelector('img');
  if (preview) preview.removeAttribute('src');
  document.body.classList.remove('no-scroll');
}

document.addEventListener('click', (event) => {
  const image = event.target.closest('.pdf-figure img');
  if (image) {
    event.preventDefault();
    openLightbox(image);
    return;
  }
  if (event.target.closest('.image-lightbox')) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});

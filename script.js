const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navLinks.classList.toggle('open', !open);
});
document.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', () => {
  navLinks.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false');
}));
document.querySelector('#year').textContent = new Date().getFullYear();
const studio = document.querySelector('.editor');
if (studio) {
  const layers = Array.from(studio.querySelectorAll('.layer'));
  const artboard = studio.querySelector('.artboard');
  const phone = studio.querySelector('.phone');
  const inspector = studio.querySelector('.inspector');
  const canvas = studio.querySelector('.canvas');
  const headline = studio.querySelector('.headline-preview');
  const topButtons = studio.querySelectorAll('.canvas-top button');
  let zoom = 1;
  let selected = 0;
  let platform = 'iphone';

  function hint(message) {
    const el = inspector.querySelector('.editor-hint');
    if (el) el.textContent = message;
  }
  function selectLayer(index) {
    selected = index;
    layers.forEach((layer, i) => layer.classList.toggle('selected', i === index));
    hint(['Product preview selected. Change the frame or platform.', 'Headline selected. Click the text on the canvas to edit it.', 'Background selected. Choose a color below.', 'Device shadow selected. Drag the phone to reposition it.'][index]);
  }
  layers.forEach((layer, index) => {
    layer.tabIndex = 0;
    layer.setAttribute('role', 'button');
    layer.addEventListener('click', () => selectLayer(index));
    layer.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectLayer(index); }
    });
  });
  const addLayer = studio.querySelector('.panel-heading button');
  addLayer.addEventListener('click', () => hint('New layers can be added in the full StoreShot app.'));

  inspector.innerHTML = "<div class='inspector-title'>Design <span>···</span></div><div class='field-label'>CANVAS</div><div class='segmented' role='group'><button class='platform chosen' data-platform='iphone'>iPhone</button><button class='platform' data-platform='android'>Android</button></div><div class='field-label'>BACKGROUND</div><label class='color-field'><input type='color' id='background-color' value='#6C5CE7' aria-label='Choose background color'><i></i><span id='background-name'>Electric violet</span><b id='background-hex'>#6C5CE7</b></label><div class='palette'><button data-color='#6C5CE7' aria-label='Electric violet'></button><button data-color='#0E8CCF' aria-label='Ocean blue'></button><button data-color='#E15F8D' aria-label='Rose pink'></button><button data-color='#20A780' aria-label='Mint green'></button></div><div class='field-label'>FRAME</div><div class='frame-row'><button class='frame-option chosen' data-frame='modern'><span>▯</span><small>Modern</small></button><button class='frame-option' data-frame='classic'><span>▢</span><small>Classic</small></button></div><div class='field-label'>EXPORT</div><div class='export-row'><span id='export-store'>App Store</span><b id='export-size'>6.7 in</b></div><button class='export-button' id='export-shot'>Export screenshot <span>→</span></button><p class='editor-hint' aria-live='polite'>Select a layer to edit it.</p>";

  const names = { '#6C5CE7': 'Electric violet', '#0E8CCF': 'Ocean blue', '#E15F8D': 'Rose pink', '#20A780': 'Mint green' };
  function background(color) {
    const rgb = color.match(/[A-Fa-f0-9]{2}/g).map(value => parseInt(value, 16));
    artboard.style.background = 'linear-gradient(150deg, rgb(' + Math.max(0, rgb[0] - 55) + ',' + Math.max(0, rgb[1] - 55) + ',' + Math.max(0, rgb[2] - 10) + '), ' + color + ' 48%, #e17ba8)';
    inspector.querySelector('#background-color').value = color;
    inspector.querySelector('#background-name').textContent = names[color] || 'Custom color';
    inspector.querySelector('#background-hex').textContent = color;
    hint('Background updated.');
  }
  inspector.querySelector('#background-color').addEventListener('input', event => background(event.target.value.toUpperCase()));
  inspector.querySelectorAll('.palette button').forEach(button => button.addEventListener('click', () => background(button.dataset.color)));
  inspector.querySelectorAll('.frame-option').forEach(button => button.addEventListener('click', () => {
    phone.classList.toggle('classic-frame', button.dataset.frame === 'classic');
    inspector.querySelectorAll('.frame-option').forEach(item => item.classList.toggle('chosen', item === button));
    hint(button.dataset.frame === 'classic' ? 'Classic device frame selected.' : 'Modern device frame selected.');
  }));
  inspector.querySelectorAll('.platform').forEach(button => button.addEventListener('click', () => {
    platform = button.dataset.platform;
    phone.classList.toggle('android-phone', platform === 'android');
    artboard.classList.toggle('android-canvas', platform === 'android');
    inspector.querySelectorAll('.platform').forEach(item => item.classList.toggle('chosen', item === button));
    inspector.querySelector('#export-store').textContent = platform === 'android' ? 'Google Play' : 'App Store';
    inspector.querySelector('#export-size').textContent = platform === 'android' ? '1080 × 1920' : '6.7 in';
    studio.querySelector('.layer small').textContent = platform === 'android' ? 'Android device' : 'iPhone 16 Pro';
    hint(platform === 'android' ? 'Android canvas selected.' : 'iPhone canvas selected.');
  }));

  headline.contentEditable = 'true';
  headline.spellcheck = false;
  headline.setAttribute('aria-label', 'Editable screenshot headline');
  headline.addEventListener('focus', () => hint('Edit the headline directly on the canvas.'));
  function applyZoom(next) {
    zoom = Math.max(.65, Math.min(1.3, next));
    artboard.style.transform = 'scale(' + zoom + ')';
    studio.querySelector('.canvas-footer b span').textContent = Math.round(zoom * 100) + '%';
  }
  const footer = studio.querySelector('.canvas-footer b');
  footer.innerHTML = "<button type='button' aria-label='Zoom out'>−</button><span>100%</span><button type='button' aria-label='Zoom in'>+</button>";
  footer.querySelectorAll('button')[0].addEventListener('click', () => applyZoom(zoom - .1));
  footer.querySelectorAll('button')[1].addEventListener('click', () => applyZoom(zoom + .1));
  canvas.addEventListener('wheel', event => { if (!event.ctrlKey && !event.metaKey) return; event.preventDefault(); applyZoom(zoom + (event.deltaY < 0 ? .08 : -.08)); }, { passive: false });

  let moving = false, originX = 0, originY = 0, offsetX = 0, offsetY = 0;
  phone.addEventListener('pointerdown', event => { moving = true; originX = event.clientX; originY = event.clientY; phone.setPointerCapture(event.pointerId); hint('Drag to position the device.'); });
  phone.addEventListener('pointermove', event => { if (!moving) return; offsetX += (event.clientX - originX) / zoom; offsetY += (event.clientY - originY) / zoom; originX = event.clientX; originY = event.clientY; phone.style.translate = offsetX + 'px ' + offsetY + 'px'; });
  phone.addEventListener('pointerup', () => { moving = false; });

  function exportShot() {
    const title = headline.innerText.replace(/[<>&]/g, '').split('\n');
    const text = title.map((line, index) => "<tspan x='110' dy='" + (index ? 165 : 0) + "'>" + line + "</tspan>").join('');
    const color = inspector.querySelector('#background-color').value;
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='1290' height='2796'><defs><linearGradient id='g' x2='1' y2='1'><stop stop-color='#4029ba'/><stop offset='.55' stop-color='" + color + "'/><stop offset='1' stop-color='#e17ba8'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='110' y='270' font-family='Arial, sans-serif' font-size='145' font-weight='700' fill='white'>" + text + "</text><rect x='520' y='900' width='480' height='1120' rx='75' fill='#15151e' stroke='#403d4a' stroke-width='18' transform='rotate(-8 760 1460)'/><rect x='550' y='930' width='420' height='1060' rx='52' fill='#cbe8ef' transform='rotate(-8 760 1460)'/><text x='100' y='2660' font-family='Arial' font-size='44' fill='white'>StoreShot Studio</text></svg>";
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    link.download = 'storeshot-screenshot.svg';
    link.click();
    URL.revokeObjectURL(link.href);
    hint('Your screenshot has been exported.');
  }
  inspector.querySelector('#export-shot').addEventListener('click', exportShot);
  topButtons[2].addEventListener('click', exportShot);
  topButtons[0].addEventListener('click', () => hint('Undo is available in the full editor.'));
  topButtons[1].addEventListener('click', () => hint('Redo is available in the full editor.'));
}
const featureCards = Array.from(document.querySelectorAll('.feature-card'));
if (featureCards.length) {
  const [deviceCard, designCard, exportCard] = featureCards;
  featureCards.forEach(card => {
    card.tabIndex = 0;
    card.setAttribute('role', 'group');
  });

  const deviceStack = deviceCard.querySelector('.device-stack');
  const deviceNames = ['iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro'];
  let deviceIndex = 0;
  deviceCard.setAttribute('aria-label', 'Device preview. Click to change device.');
  deviceCard.addEventListener('click', () => {
    deviceIndex = (deviceIndex + 1) % deviceNames.length;
    deviceStack.dataset.device = deviceIndex;
    deviceCard.classList.remove('device-swap');
    void deviceCard.offsetWidth;
    deviceCard.classList.add('device-swap');
    deviceCard.querySelector('p').textContent = deviceNames[deviceIndex] + ' preview selected. Tap again to switch devices.';
  });
  deviceCard.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); deviceCard.click(); } });

  const swatches = Array.from(designCard.querySelectorAll('.swatch-row span'));
  const colors = ['#745ce5', '#ef89ae', '#70d6e8', '#eec879', '#ad63df'];
  const designText = designCard.querySelector('p');
  swatches.forEach((swatch, index) => {
    swatch.tabIndex = 0;
    swatch.setAttribute('role', 'button');
    swatch.setAttribute('aria-label', 'Select design color ' + (index + 1));
    const choose = event => {
      event.stopPropagation();
      swatches.forEach(item => item.classList.remove('active'));
      swatch.classList.add('active');
      designCard.style.setProperty('--interactive-accent', colors[index]);
      designText.textContent = 'Accent ' + (index + 1) + ' applied. Your screenshot style updates instantly.';
    };
    swatch.addEventListener('click', choose);
    swatch.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(event); } });
  });

  const sizes = Array.from(exportCard.querySelectorAll('.export-sizes span'));
  const exportText = exportCard.querySelector('p');
  const feedback = document.createElement('div');
  feedback.className = 'export-feedback';
  feedback.setAttribute('aria-live', 'polite');
  exportCard.appendChild(feedback);
  sizes.forEach((size, index) => {
    size.tabIndex = 0;
    size.setAttribute('role', 'button');
    const chooseSize = event => {
      event.stopPropagation();
      sizes.forEach(item => item.classList.remove('active'));
      size.classList.add('active');
      exportCard.classList.remove('export-ready');
      void exportCard.offsetWidth;
      exportCard.classList.add('export-ready');
      const platform = index === 0 ? 'App Store 6.7″' : index === 1 ? 'App Store 6.5″' : 'App Store 5.5″';
      exportText.textContent = platform + ' selected and ready for export.';
      feedback.textContent = '✓ Ready';
    };
    size.addEventListener('click', chooseSize);
    size.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); chooseSize(event); } });
  });
}
const header = document.querySelector('.site-header');
const navSectionLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const observedSections = navSectionLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 18);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
if ('IntersectionObserver' in window && navSectionLinks.length) {
  const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navSectionLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + visible.target.id));
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.1, 0.35, 0.6] });
  observedSections.forEach(section => sectionObserver.observe(section));
}
/* Clear the feature colour selection when focus moves away from the design card. */
const designFeatureCard = document.querySelector('.feature-card.wide');
if (designFeatureCard) {
  const designFeatureText = designFeatureCard.querySelector('p');
  const defaultDesignFeatureText = designFeatureText.textContent;
  const clearDesignFeatureSelection = () => {
    designFeatureCard.querySelectorAll('.swatch-row span.active').forEach(swatch => swatch.classList.remove('active'));
    designFeatureCard.style.removeProperty('--interactive-accent');
    designFeatureText.textContent = defaultDesignFeatureText;
  };
  document.addEventListener('pointerdown', event => {
    if (!designFeatureCard.contains(event.target)) clearDesignFeatureSelection();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') clearDesignFeatureSelection();
  });
}
/* Use an explicit class for the middle-card selected state; an empty style="" must not count as selected. */
{
  const colorCard = document.querySelector('.feature-card.wide');
  if (colorCard) {
    colorCard.querySelectorAll('.swatch-row span').forEach(swatch => {
      swatch.addEventListener('click', () => colorCard.classList.add('is-color-selected'));
    });
    const resetColorCard = () => {
      colorCard.classList.remove('is-color-selected');
      colorCard.removeAttribute('style');
      if (colorCard.contains(document.activeElement)) document.activeElement.blur();
    };
    document.addEventListener('pointerdown', event => {
      if (!colorCard.contains(event.target)) resetColorCard();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') resetColorCard();
    });
  }
}
/* Clear export-size feedback when users move away from the export card. */
{
  const exportFeatureCard = document.querySelector('.feature-card:not(.tall):not(.wide)');
  if (exportFeatureCard) {
    const exportFeatureText = exportFeatureCard.querySelector('p');
    const defaultExportFeatureText = exportFeatureText.textContent;
    const clearExportFeatureSelection = () => {
      exportFeatureCard.querySelectorAll('.export-sizes span.active').forEach(size => size.classList.remove('active'));
      exportFeatureCard.classList.remove('export-ready');
      exportFeatureText.textContent = defaultExportFeatureText;
      if (exportFeatureCard.contains(document.activeElement)) document.activeElement.blur();
    };
    document.addEventListener('pointerdown', event => {
      if (!exportFeatureCard.contains(event.target)) clearExportFeatureSelection();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') clearExportFeatureSelection();
    });
  }
}

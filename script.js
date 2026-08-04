// Always start at the top of the page on every load/refresh
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

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
const studio = document.querySelector('#studio-window');
if (studio) {
  // State Store
  const state = {
    projectName: 'Untitled project',
    activeTool: 'design',
    selectedLayer: 'preview',
    hiddenLayers: new Set(),
    platform: 'iphone', // 'iphone' | 'ipad'
    frame: 'modern', // 'modern' | 'classic' | 'titanium'
    tilt: 'left', // 'dynamic' | 'left' | 'straight' | 'right' | 'perspective'
    shadow: 'soft', // 'soft' | 'dramatic' | 'glow' | 'none'
    bgName: 'Electric violet',
    bgColor: '#6C5CE7',
    activeTemplate: 'electric',
    mockupScreen: 'habits', // 'habits' | 'finance' | 'fitness' | 'music' | 'custom'
    customScreenSrc: null,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    isPlayingMusic: true,
    ringProgress: 72,
    taskDone: false
  };

  const history = [];
  let historyIdx = -1;

  function pushState() {
    // Snapshot current state
    const snapshot = {
      platform: state.platform,
      frame: state.frame,
      tilt: state.tilt,
      shadow: state.shadow,
      bgName: state.bgName,
      bgColor: state.bgColor,
      mockupScreen: state.mockupScreen,
      customScreenSrc: state.customScreenSrc,
      offsetX: state.offsetX,
      offsetY: state.offsetY,
      headline: headline?.innerHTML || '',
      tagline: artTag?.textContent || ''
    };
    if (historyIdx < history.length - 1) {
      history.splice(historyIdx + 1);
    }
    history.push(JSON.stringify(snapshot));
    historyIdx = history.length - 1;
    updateUndoRedoButtons();
  }

  function applySnapshot(jsonStr) {
    if (!jsonStr) return;
    const snap = JSON.parse(jsonStr);
    state.platform = snap.platform;
    state.frame = snap.frame;
    state.tilt = snap.tilt;
    state.shadow = snap.shadow;
    state.bgName = snap.bgName;
    state.bgColor = snap.bgColor;
    state.mockupScreen = snap.mockupScreen;
    state.customScreenSrc = snap.customScreenSrc;
    state.offsetX = snap.offsetX;
    state.offsetY = snap.offsetY;
    if (headline) headline.innerHTML = snap.headline;
    if (artTag) artTag.textContent = snap.tagline;
    renderAll();
  }

  // DOM Elements
  const artboard = studio.querySelector('#artboard');
  const phone = studio.querySelector('#phone');
  const headline = studio.querySelector('#headline-preview');
  const artTag = studio.querySelector('#art-tag');
  const layersList = studio.querySelector('#layers-list');
  const templatesList = studio.querySelector('#templates-list');
  const layersTitle = studio.querySelector('#layers-panel-title');
  const inspector = studio.querySelector('#inspector');
  const saveStatus = studio.querySelector('#save-status');
  const projectNameEdit = studio.querySelector('#project-name-edit');
  const zoomText = studio.querySelector('#zoom-text');
  const canvasHint = studio.querySelector('#canvas-hint');
  const dimBadge = studio.querySelector('#canvas-dim-badge');
  const deviceBadge = studio.querySelector('#canvas-device-badge');
  const btnUndo = studio.querySelector('#btn-undo');
  const btnRedo = studio.querySelector('#btn-redo');

  const paletteColors = {
    '#6C5CE7': 'Electric violet',
    '#0E8CCF': 'Ocean cyan',
    '#E15F8D': 'Rose pink',
    '#20A780': 'Cyber mint',
    '#E0A82E': 'Sunburst gold',
    '#181724': 'Midnight noir'
  };

  const templates = {
    electric: {
      name: 'Electric Launch',
      bg: '#6C5CE7',
      bgName: 'Electric violet',
      platform: 'iphone',
      frame: 'modern',
      tilt: 'left',
      shadow: 'soft',
      screen: 'habits',
      headline: 'Make it<br /><strong>remarkable.</strong>',
      tagline: '✦ StoreShot'
    },
    obsidian: {
      name: 'Obsidian Dark',
      bg: '#181724',
      bgName: 'Midnight noir',
      platform: 'iphone',
      frame: 'titanium',
      tilt: 'straight',
      shadow: 'dramatic',
      screen: 'finance',
      headline: 'Track wealth.<br /><strong>Seamlessly.</strong>',
      tagline: '★ 4.9 on App Store'
    },
    ocean: {
      name: 'Ocean Breeze',
      bg: '#0E8CCF',
      bgName: 'Ocean cyan',
      platform: 'iphone',
      frame: 'modern',
      tilt: 'dynamic',
      shadow: 'glow',
      screen: 'habits',
      headline: 'Build habits<br /><strong>that stick.</strong>',
      tagline: '⚡ Version 2.0'
    },
    sunset: {
      name: 'Sunset Horizon',
      bg: '#E15F8D',
      bgName: 'Rose pink',
      platform: 'iphone',
      frame: 'classic',
      tilt: 'right',
      shadow: 'soft',
      screen: 'music',
      headline: 'Sound meets<br /><strong>pure clarity.</strong>',
      tagline: '✦ Editor’s Choice'
    },
    mint: {
      name: 'Cyber Mint',
      bg: '#20A780',
      bgName: 'Cyber mint',
      platform: 'ipad',
      frame: 'modern',
      tilt: 'left',
      shadow: 'glow',
      screen: 'fitness',
      headline: 'Push limits.<br /><strong>Every day.</strong>',
      tagline: '🔥 App Store Top'
    }
  };

  function triggerSaveStatus() {
    if (!saveStatus) return;
    saveStatus.textContent = '● Saving...';
    saveStatus.classList.add('saving');
    setTimeout(() => {
      saveStatus.textContent = '● Saved';
      saveStatus.classList.remove('saving');
    }, 450);
  }

  function hint(message, isHighlight = false) {
    if (!canvasHint) return;
    canvasHint.textContent = message;
    canvasHint.classList.toggle('highlight', isHighlight);
    const inspectorHint = inspector?.querySelector('.editor-hint');
    if (inspectorHint) {
      inspectorHint.textContent = message;
      inspectorHint.classList.toggle('highlight', isHighlight);
    }
  }

  function updateUndoRedoButtons() {
    if (btnUndo) btnUndo.style.opacity = historyIdx > 0 ? '1' : '0.4';
    if (btnRedo) btnRedo.style.opacity = historyIdx < history.length - 1 ? '1' : '0.4';
  }

  // Render Visual Canvas State
  function renderCanvas() {
    // Background gradient calculation
    const hex = state.bgColor;
    const r = parseInt(hex.slice(1, 3), 16) || 108;
    const g = parseInt(hex.slice(3, 5), 16) || 92;
    const b = parseInt(hex.slice(5, 7), 16) || 231;
    const darkR = Math.max(8, Math.floor(r * 0.4));
    const darkG = Math.max(8, Math.floor(g * 0.35));
    const darkB = Math.max(16, Math.floor(b * 0.6));
    const lightR = Math.min(255, Math.floor(r * 1.3 + 40));
    const lightG = Math.min(255, Math.floor(g * 1.1 + 20));
    const lightB = Math.min(255, Math.floor(b * 1.0 + 30));

    artboard.style.background = `linear-gradient(150deg, rgb(${darkR},${darkG},${darkB}), ${hex} 48%, rgb(${lightR},${lightG},${lightB}))`;
    phone.style.setProperty('--glow-color', `rgba(${r},${g},${b},0.65)`);

    // Frame styling
    phone.classList.toggle('classic-frame', state.frame === 'classic');
    phone.classList.toggle('titanium-frame', state.frame === 'titanium');
    phone.classList.toggle('ipad-frame', state.platform === 'ipad');
    artboard.classList.toggle('ipad-canvas', state.platform === 'ipad');

    // Tilt angle
    phone.classList.remove('tilt-dynamic', 'tilt-left', 'tilt-straight', 'tilt-right', 'tilt-perspective');
    phone.classList.add(`tilt-${state.tilt}`);

    // Shadow
    phone.classList.remove('shadow-soft', 'shadow-dramatic', 'shadow-glow', 'shadow-none');
    phone.classList.add(`shadow-${state.shadow}`);

    // Position translate
    phone.style.translate = `${state.offsetX}px ${state.offsetY}px`;

    // Layer visibility
    phone.style.display = state.hiddenLayers.has('preview') ? 'none' : '';
    if (headline) headline.style.display = state.hiddenLayers.has('headline') ? 'none' : '';
    if (artTag) artTag.style.display = state.hiddenLayers.has('tagline') ? 'none' : '';
    const shadowArt = studio.querySelector('.art-noise');
    if (shadowArt) shadowArt.style.display = state.hiddenLayers.has('shadow') ? 'none' : '';

    // Mockup Screen UI
    studio.querySelectorAll('.phone-screen .app-ui').forEach(ui => ui.classList.remove('active'));
    const activeUi = studio.querySelector(`.phone-screen .app-ui-${state.mockupScreen}`);
    if (activeUi) {
      activeUi.classList.add('active');
    }

    // Platform badges
    if (dimBadge) {
      dimBadge.textContent = state.platform === 'ipad' ? '2048 × 2732' : '1290 × 2796';
    }
    if (deviceBadge) {
      deviceBadge.textContent = state.platform === 'ipad' ? 'iPad Pro 12.9″' : (state.frame === 'titanium' ? 'iPhone Titanium' : (state.frame === 'classic' ? 'iPhone Classic' : 'iPhone 16 Pro'));
    }

    // Layers panel updates
    const deviceName = studio.querySelector('#layer-device-name');
    if (deviceName) {
      deviceName.textContent = state.platform === 'ipad' ? 'iPad Pro 12.9″' : 'iPhone 16 Pro';
    }
    const bgNameEl = studio.querySelector('#layer-bg-name');
    if (bgNameEl) {
      bgNameEl.textContent = state.bgName;
    }
    const shadowNameEl = studio.querySelector('#layer-shadow-name');
    if (shadowNameEl) {
      shadowNameEl.textContent = state.shadow.charAt(0).toUpperCase() + state.shadow.slice(1);
    }
    const headlineLayerText = studio.querySelector('#layer-headline-text');
    if (headlineLayerText && headline) {
      headlineLayerText.textContent = headline.innerText.replace(/\n/g, ' ').slice(0, 22) + '...';
    }

    // Update zoom display
    artboard.style.transform = `scale(${state.zoom})`;
    if (zoomText) zoomText.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  // Render Inspector Panel based on active context
  function renderInspector() {
    if (!inspector) return;

    let html = `
      <div class="inspector-title">
        <span>Inspector</span>
        <span class="inspector-tab-badge">${state.activeTool.toUpperCase()}</span>
      </div>
    `;

    // 1. CANVAS & PLATFORM
    html += `
      <div class="insp-group">
        <span class="field-label">DEVICE & STORE</span>
        <div class="segmented" role="group">
          <button class="insp-btn-platform ${state.platform === 'iphone' ? 'chosen' : ''}" data-platform="iphone">iPhone 6.7&quot;</button>
          <button class="insp-btn-platform ${state.platform === 'ipad' ? 'chosen' : ''}" data-platform="ipad">iPad 12.9&quot;</button>
        </div>
      </div>
    `;

    // 2. BACKGROUND & PALETTE
    html += `
      <div class="insp-group">
        <span class="field-label">BACKGROUND COLOR</span>
        <label class="color-field" title="Click to pick custom color">
          <input type="color" id="insp-color-input" value="${state.bgColor}" aria-label="Custom background color">
          <i style="background:${state.bgColor}"></i>
          <span>${state.bgName}</span>
          <b>${state.bgColor}</b>
        </label>
        <div class="palette">
          ${Object.keys(paletteColors).map(color => `
            <button class="palette-swatch ${state.bgColor.toUpperCase() === color.toUpperCase() ? 'active' : ''}" 
                    data-color="${color}" 
                    title="${paletteColors[color]}" 
                    style="background:${color}"></button>
          `).join('')}
        </div>
      </div>
    `;

    // 3. MOCKUP APP UI
    html += `
      <div class="insp-group">
        <span class="field-label">APP SCREEN MOCKUP</span>
        <div class="mockup-chips">
          <button class="chip-btn insp-chip-screen ${state.mockupScreen === 'habits' ? 'chosen' : ''}" data-screen="habits">Habit</button>
          <button class="chip-btn insp-chip-screen ${state.mockupScreen === 'finance' ? 'chosen' : ''}" data-screen="finance">Vault</button>
          <button class="chip-btn insp-chip-screen ${state.mockupScreen === 'fitness' ? 'chosen' : ''}" data-screen="fitness">Stride</button>
          <button class="chip-btn insp-chip-screen ${state.mockupScreen === 'music' ? 'chosen' : ''}" data-screen="music">Audio</button>
        </div>
        <label class="btn-upload-screen" title="Upload custom screenshot PNG/JPG">
          <input type="file" id="insp-file-upload" accept="image/*" style="display:none">
          <span>📁 Upload Screenshot</span>
        </label>
      </div>
    `;

    // 4. 3D DEVICE FRAME & ANGLE
    html += `
      <div class="insp-group">
        <span class="field-label">DEVICE FRAME & TILT</span>
        <div class="segmented">
          <button class="insp-btn-frame ${state.frame === 'modern' ? 'chosen' : ''}" data-frame="modern">Modern</button>
          <button class="insp-btn-frame ${state.frame === 'classic' ? 'chosen' : ''}" data-frame="classic">Classic</button>
          <button class="insp-btn-frame ${state.frame === 'titanium' ? 'chosen' : ''}" data-frame="titanium">Titanium</button>
        </div>
        <div class="angle-chips">
          <button class="chip-btn insp-chip-tilt ${state.tilt === 'dynamic' ? 'chosen' : ''}" data-tilt="dynamic" title="-14° Dynamic">-14°</button>
          <button class="chip-btn insp-chip-tilt ${state.tilt === 'left' ? 'chosen' : ''}" data-tilt="left" title="-8° Natural">-8°</button>
          <button class="chip-btn insp-chip-tilt ${state.tilt === 'straight' ? 'chosen' : ''}" data-tilt="straight" title="0° Straight">0°</button>
          <button class="chip-btn insp-chip-tilt ${state.tilt === 'right' ? 'chosen' : ''}" data-tilt="right" title="+8° Counter">+8°</button>
        </div>
      </div>
    `;

    // 5. SHADOW & DEPTH
    html += `
      <div class="insp-group">
        <span class="field-label">3D SHADOW & GLOW</span>
        <div class="mockup-chips">
          <button class="chip-btn insp-chip-shadow ${state.shadow === 'soft' ? 'chosen' : ''}" data-shadow="soft">Soft</button>
          <button class="chip-btn insp-chip-shadow ${state.shadow === 'dramatic' ? 'chosen' : ''}" data-shadow="dramatic">Deep</button>
          <button class="chip-btn insp-chip-shadow ${state.shadow === 'glow' ? 'chosen' : ''}" data-shadow="glow">Glow</button>
          <button class="chip-btn insp-chip-shadow ${state.shadow === 'none' ? 'chosen' : ''}" data-shadow="none">None</button>
        </div>
      </div>
    `;

    // 6. EXPORT
    html += `
      <div class="insp-group">
        <span class="field-label">EXPORT SETTINGS</span>
        <div class="export-row">
          <span>Target</span>
          <b>${state.platform === 'ipad' ? 'App Store (12.9″)' : 'App Store (6.7″)'}</b>
        </div>
        <button class="export-button" id="insp-btn-export">
          <span>Export screenshot</span>
          <span class="export-btn-arrow" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
      </div>
      
    `;

    inspector.innerHTML = html;
    bindInspectorEvents();
  }

  function bindInspectorEvents() {
    if (!inspector) return;

    // Platform toggle
    inspector.querySelectorAll('.insp-btn-platform').forEach(btn => {
      btn.addEventListener('click', () => {
        state.platform = btn.dataset.platform;
        pushState();
        renderAll();
        hint(state.platform === 'ipad' ? 'Switched to App Store iPad 12.9″ canvas' : 'Switched to App Store iPhone 6.7″ canvas');
        triggerSaveStatus();
      });
    });

    // Custom Color picker
    const colorInput = inspector.querySelector('#insp-color-input');
    if (colorInput) {
      colorInput.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase();
        state.bgColor = val;
        state.bgName = paletteColors[val] || 'Custom Gradient';
        renderCanvas();
        triggerSaveStatus();
      });
      colorInput.addEventListener('change', () => {
        pushState();
        renderInspector();
      });
    }

    // Palette swatches
    inspector.querySelectorAll('.palette-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = btn.dataset.color;
        state.bgColor = c;
        state.bgName = paletteColors[c] || 'Custom';
        pushState();
        renderAll();
        hint(`Applied ${state.bgName} background`);
        triggerSaveStatus();
      });
    });

    // Screen selector
    inspector.querySelectorAll('.insp-chip-screen').forEach(btn => {
      btn.addEventListener('click', () => {
        state.mockupScreen = btn.dataset.screen;
        pushState();
        renderAll();
        hint(`Switched app screen to ${btn.textContent}`);
        triggerSaveStatus();
      });
    });

    // File Upload
    const fileUpload = inspector.querySelector('#insp-file-upload');
    if (fileUpload) {
      fileUpload.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            state.customScreenSrc = event.target.result;
            state.mockupScreen = 'custom';
            const customImg = studio.querySelector('#custom-screen-img');
            if (customImg) customImg.src = state.customScreenSrc;
            pushState();
            renderAll();
            hint('Custom screenshot loaded into device mockup!', true);
            triggerSaveStatus();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Frame option
    inspector.querySelectorAll('.insp-btn-frame').forEach(btn => {
      btn.addEventListener('click', () => {
        state.frame = btn.dataset.frame;
        pushState();
        renderAll();
        hint(`Selected ${btn.textContent} device frame`);
        triggerSaveStatus();
      });
    });

    // Tilt angle
    inspector.querySelectorAll('.insp-chip-tilt').forEach(btn => {
      btn.addEventListener('click', () => {
        state.tilt = btn.dataset.tilt;
        pushState();
        renderAll();
        hint(`3D tilt adjusted to ${btn.textContent}`);
        triggerSaveStatus();
      });
    });

    // Shadow depth
    inspector.querySelectorAll('.insp-chip-shadow').forEach(btn => {
      btn.addEventListener('click', () => {
        state.shadow = btn.dataset.shadow;
        pushState();
        renderAll();
        hint(`Shadow depth set to ${btn.textContent}`);
        triggerSaveStatus();
      });
    });

    // Export button
    const exportBtn = inspector.querySelector('#insp-btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', handleExportScreenshot);
    }
  }

  function renderAll() {
    renderCanvas();
    renderInspector();
  }

  // Sidebar Tool Buttons
  studio.querySelectorAll('.editor-sidebar .tool').forEach(toolBtn => {
    toolBtn.addEventListener('click', () => {
      studio.querySelectorAll('.editor-sidebar .tool').forEach(t => t.classList.remove('active'));
      toolBtn.classList.add('active');
      state.activeTool = toolBtn.dataset.tool;

      if (state.activeTool === 'templates') {
        if (layersList) layersList.style.display = 'none';
        if (templatesList) templatesList.style.display = 'flex';
        if (layersTitle) layersTitle.textContent = 'Templates';
        hint('Choose a one-click designer template.');
      } else {
        if (layersList) layersList.style.display = 'flex';
        if (templatesList) templatesList.style.display = 'none';
        if (layersTitle) layersTitle.textContent = 'Layers';
        hint(`${state.activeTool.charAt(0).toUpperCase() + state.activeTool.slice(1)} tool active.`);
      }
      renderInspector();
    });
  });

  // Help Button in Sidebar
  const infoBtn = studio.querySelector('#btn-studio-info');
  infoBtn?.addEventListener('click', () => {
    hint('Shortcuts: Drag phone to move · Double click phone to center · Cmd+Z to undo', true);
  });

  // Layer Item Selection & Visibility Toggles
  studio.querySelectorAll('.layers-list .layer').forEach(layerEl => {
    const layerType = layerEl.dataset.layer;
    layerEl.addEventListener('click', (e) => {
      if (e.target.closest('.layer-eye')) return;
      state.selectedLayer = layerType;
      studio.querySelectorAll('.layers-list .layer').forEach(l => l.classList.remove('selected'));
      layerEl.classList.add('selected');
      hint(`Selected ${layerType} layer. Edit in inspector or directly on canvas.`);
    });
  });

  studio.querySelectorAll('.layer-eye').forEach(eyeBtn => {
    eyeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = eyeBtn.dataset.toggle;
      const layerEl = eyeBtn.closest('.layer');
      if (state.hiddenLayers.has(target)) {
        state.hiddenLayers.delete(target);
        eyeBtn.textContent = '◉';
        layerEl?.classList.remove('layer-hidden');
        hint(`Layer "${target}" is now visible.`);
      } else {
        state.hiddenLayers.add(target);
        eyeBtn.textContent = '◎';
        layerEl?.classList.add('layer-hidden');
        hint(`Layer "${target}" hidden.`);
      }
      pushState();
      renderCanvas();
      triggerSaveStatus();
    });
  });

  // One-Click Template Card Selection
  studio.querySelectorAll('.tpl-card').forEach(tplBtn => {
    tplBtn.addEventListener('click', () => {
      const tplKey = tplBtn.dataset.template;
      const tpl = templates[tplKey];
      if (!tpl) return;

      studio.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('active'));
      tplBtn.classList.add('active');

      state.activeTemplate = tplKey;
      state.bgColor = tpl.bg;
      state.bgName = tpl.bgName;
      state.platform = tpl.platform;
      state.frame = tpl.frame;
      state.tilt = tpl.tilt;
      state.shadow = tpl.shadow;
      state.mockupScreen = tpl.screen;
      if (headline) headline.innerHTML = tpl.headline;
      if (artTag) artTag.textContent = tpl.tagline;

      pushState();
      renderAll();
      hint(`Applied template "${tpl.name}"!`, true);
      triggerSaveStatus();
    });
  });

  // Add Layer Button
  const btnAddLayer = studio.querySelector('#btn-add-layer');
  btnAddLayer?.addEventListener('click', () => {
    // Cycle a fun tagline badge or preset headline
    const presets = ['Make it remarkable.', 'Design at lightspeed.', 'Your product, elevated.', 'Ship 10x faster.'];
    const currentText = headline?.innerText || '';
    const nextIdx = (presets.indexOf(currentText) + 1) % presets.length;
    if (headline) headline.innerHTML = presets[nextIdx].replace(' ', '<br /><strong>') + '</strong>';
    pushState();
    renderCanvas();
    hint('Added custom copy headline preset.', true);
    triggerSaveStatus();
  });

  // Traffic Light Buttons
  const trafficReset = studio.querySelector('#traffic-reset');
  trafficReset?.addEventListener('click', () => {
    state.offsetX = 0;
    state.offsetY = 0;
    state.zoom = 1;
    const tpl = templates.electric;
    state.bgColor = tpl.bg;
    state.bgName = tpl.bgName;
    state.platform = 'iphone';
    state.frame = 'modern';
    state.tilt = 'left';
    state.shadow = 'soft';
    state.mockupScreen = 'habits';
    if (headline) headline.innerHTML = tpl.headline;
    if (artTag) artTag.textContent = tpl.tagline;
    pushState();
    renderAll();
    hint('Canvas reset to default state.', true);
    triggerSaveStatus();
  });

  const trafficTheme = studio.querySelector('#traffic-theme');
  trafficTheme?.addEventListener('click', () => {
    const screens = ['habits', 'finance', 'fitness', 'music'];
    const currIdx = screens.indexOf(state.mockupScreen);
    const nextScreen = screens[(currIdx + 1) % screens.length];
    state.mockupScreen = nextScreen;
    pushState();
    renderAll();
    hint(`Cycled app screen to: ${nextScreen}`, true);
    triggerSaveStatus();
  });

  const trafficExpand = studio.querySelector('#traffic-expand');
  trafficExpand?.addEventListener('click', () => {
    studio.classList.toggle('focus-mode');
    hint(studio.classList.contains('focus-mode') ? 'Studio Focus Mode enabled' : 'Studio Normal Mode');
  });

  // Editable Project Name
  projectNameEdit?.addEventListener('input', () => {
    state.projectName = projectNameEdit.textContent.trim() || 'Untitled project';
    triggerSaveStatus();
  });

  // Editable Headline & Tagline
  headline?.addEventListener('input', () => {
    triggerSaveStatus();
  });
  headline?.addEventListener('blur', () => {
    pushState();
    renderCanvas();
  });

  // Zoom Controls
  function setZoom(next) {
    state.zoom = Math.max(0.6, Math.min(1.4, Number(next.toFixed(2))));
    renderCanvas();
  }
  studio.querySelector('#btn-zoom-out')?.addEventListener('click', () => setZoom(state.zoom - 0.1));
  studio.querySelector('#btn-zoom-in')?.addEventListener('click', () => setZoom(state.zoom + 0.1));
  studio.querySelector('#btn-zoom-reset')?.addEventListener('click', () => setZoom(1));

  studio.querySelector('.canvas-viewport')?.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(state.zoom + (e.deltaY < 0 ? 0.06 : -0.06));
  }, { passive: false });

  // Recenter Device Button
  const btnRecenter = studio.querySelector('#btn-recenter');
  btnRecenter?.addEventListener('click', () => {
    state.offsetX = 0;
    state.offsetY = 0;
    pushState();
    renderCanvas();
    hint('Phone mockup recentered.', true);
  });

  // Dragging the Phone Mockup
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  phone?.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    phone.setPointerCapture(e.pointerId);
    hint('Dragging phone · Release to lock position');
  });

  phone?.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - startX) / state.zoom;
    const dy = (e.clientY - startY) / state.zoom;
    state.offsetX += dx;
    state.offsetY += dy;
    startX = e.clientX;
    startY = e.clientY;
    phone.style.translate = `${state.offsetX}px ${state.offsetY}px`;
  });

  phone?.addEventListener('pointerup', (e) => {
    if (isDragging) {
      isDragging = false;
      pushState();
      triggerSaveStatus();
      hint('Position saved.');
    }
  });

  phone?.addEventListener('dblclick', () => {
    state.offsetX = 0;
    state.offsetY = 0;
    pushState();
    renderCanvas();
    hint('Phone returned to home center.');
    triggerSaveStatus();
  });

  // Interactive Elements inside the Phone Screen
  // 1. Habit Ring
  const interactiveRing = studio.querySelector('#interactive-ring');
  interactiveRing?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.ringProgress = state.ringProgress >= 100 ? 54 : state.ringProgress + 14;
    const ringPercent = studio.querySelector('#ring-percent');
    if (ringPercent) {
      ringPercent.innerHTML = `${state.ringProgress}<small>%</small>`;
    }
    interactiveRing.style.borderColor = state.ringProgress >= 100 ? '#4fe0b5' : '#75bccf';
    hint(`Goal progress: ${state.ringProgress}% complete! 🎉`, true);
  });

  // 2. Habit Task Card
  const interactiveTask = studio.querySelector('#interactive-task');
  interactiveTask?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.taskDone = !state.taskDone;
    interactiveTask.classList.toggle('completed', state.taskDone);
    const icon = studio.querySelector('#task-icon');
    const title = studio.querySelector('#task-title');
    if (icon) icon.textContent = state.taskDone ? '✓' : '↗';
    if (title) title.textContent = state.taskDone ? 'Update Shipped!' : 'Ship the update';
    hint(state.taskDone ? 'Task completed! Good job.' : 'Task reopened.', true);
  });

  // 3. Audio Play Button
  const musicPlayBtn = studio.querySelector('#music-play-btn');
  const musicWave = studio.querySelector('#music-wave');
  musicPlayBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.isPlayingMusic = !state.isPlayingMusic;
    musicPlayBtn.textContent = state.isPlayingMusic ? '❚❚' : '▶';
    if (musicWave) {
      musicWave.querySelectorAll('span').forEach(bar => {
        bar.style.animationPlayState = state.isPlayingMusic ? 'running' : 'paused';
      });
    }
    hint(state.isPlayingMusic ? 'Playing audio track' : 'Audio paused', true);
  });

  // Undo / Redo
  btnUndo?.addEventListener('click', () => {
    if (historyIdx > 0) {
      historyIdx--;
      applySnapshot(history[historyIdx]);
      updateUndoRedoButtons();
      hint('Action undone (↶)');
    }
  });

  btnRedo?.addEventListener('click', () => {
    if (historyIdx < history.length - 1) {
      historyIdx++;
      applySnapshot(history[historyIdx]);
      updateUndoRedoButtons();
      hint('Action redone (↷)');
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ignore if typing in text inputs or contenteditable
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.isContentEditable)) {
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        btnRedo?.click();
      } else {
        btnUndo?.click();
      }
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      btnRedo?.click();
    } else if (e.key === ' ') {
      e.preventDefault();
      btnRecenter?.click();
    }
  });

  // Export Screenshot Engine
  function handleExportScreenshot() {
    const exportBtns = [studio.querySelector('#btn-quick-export'), studio.querySelector('#insp-btn-export')].filter(Boolean);
    exportBtns.forEach(btn => {
      btn.style.filter = 'brightness(1.3)';
      btn.textContent = 'Exporting...';
    });

    setTimeout(() => {
      const title = headline?.innerText.replace(/[<>&]/g, '').split('\n') || ['Make it', 'remarkable.'];
      const textSvg = title.map((line, idx) => `<tspan x="110" dy="${idx ? 165 : 0}">${line}</tspan>`).join('');
      const color = state.bgColor;
      
      const width = state.platform === 'ipad' ? 2048 : 1290;
      const height = state.platform === 'ipad' ? 2732 : 2796;

      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <defs>
            <linearGradient id="storeshotBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#19152b" />
              <stop offset="50%" stop-color="${color}" />
              <stop offset="100%" stop-color="#e17ba8" />
            </linearGradient>
            <filter id="cardShadow" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="-10" dy="25" stdDeviation="30" flood-color="#000000" flood-opacity="0.6"/>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#storeshotBg)" />
          <text x="110" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="140" font-weight="800" fill="#ffffff" letter-spacing="-4">
            ${textSvg}
          </text>
          <!-- Phone Mockup Container -->
          <g transform="translate(${width * 0.45}, ${height * 0.35}) rotate(-8)" filter="url(#cardShadow)">
            <rect width="580" height="1180" rx="80" fill="#12111b" stroke="#2f2d3d" stroke-width="20"/>
            <rect x="25" y="25" width="530" height="1130" rx="60" fill="#eff7fa"/>
            <!-- Camera pill -->
            <rect x="200" y="45" width="180" height="36" rx="18" fill="#0b0b0e"/>
            <!-- App Screen Graphics -->
            <text x="70" y="180" font-family="sans-serif" font-size="34" font-weight="700" fill="#18323e">myday</text>
            <text x="70" y="270" font-family="sans-serif" font-size="52" font-weight="800" fill="#12242c">Good morning, Alex.</text>
            <circle cx="290" cy="520" r="160" stroke="#70b7ce" stroke-width="36" fill="none"/>
            <text x="290" y="540" font-family="sans-serif" font-size="76" font-weight="800" text-anchor="middle" fill="#18323e">${state.ringProgress}%</text>
            <rect x="70" y="740" width="440" height="140" rx="28" fill="#ffffff" opacity="0.9"/>
            <text x="110" y="800" font-family="sans-serif" font-size="24" font-weight="700" fill="#677b81">TODAY'S FOCUS</text>
            <text x="110" y="845" font-family="sans-serif" font-size="36" font-weight="800" fill="#18323e">${state.taskDone ? 'Update Shipped!' : 'Ship the update'}</text>
          </g>
          <text x="110" y="${height - 90}" font-family="sans-serif" font-size="44" font-weight="600" fill="#ffffff" opacity="0.8">✦ StoreShot Studio</text>
        </svg>
      `;

      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `${state.projectName.toLowerCase().replace(/\s+/g, '-')}-storeshot.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      exportBtns.forEach(btn => {
        btn.style.filter = '';
        btn.textContent = '✓ Exported!';
        setTimeout(() => {
          btn.textContent = btn.id === 'btn-quick-export' ? 'Export' : 'Export screenshot';
        }, 2000);
      });
      hint('Screenshot exported successfully! Check your downloads.', true);
    }, 350);
  }

  studio.querySelector('#btn-quick-export')?.addEventListener('click', handleExportScreenshot);

  // Initialize
  pushState();
  renderAll();
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

/* ---------------------------------------------------------------------------
   Waitlist signup
   ---------------------------------------------------------------------------
   CONFIGURE ME: paste your form endpoint below to collect addresses properly.
   Works as-is with any service that accepts a POST (Formspree, Buttondown,
   ConvertKit, a Vercel serverless function, etc.).

     const WAITLIST_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';

   While it is left empty the form still confirms to the visitor and parks the
   address in localStorage under 'storeshot:waitlist', so no signup is lost
   before a real endpoint is connected. Recover them from the browser console:

     JSON.parse(localStorage.getItem('storeshot:waitlist'))

   WAITLIST_FALLBACK_EMAIL is only surfaced if a configured endpoint errors.
--------------------------------------------------------------------------- */
{
  const WAITLIST_ENDPOINT = '';
  const WAITLIST_FALLBACK_EMAIL = 'support@storeshotstudio.app';

  const form = document.getElementById('waitlist-form');
  if (form) {
    const input = document.getElementById('waitlist-email');
    const status = document.getElementById('waitlist-status');
    const submit = form.querySelector('.waitlist-submit');
    const isValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

    const setStatus = (message, kind) => {
      status.textContent = message;
      status.className = 'waitlist-status' + (kind ? ' is-' + kind : '');
    };

    // Toasts carry the feedback, but if that module ever fails to load we still
    // owe the visitor an answer — fall back to the inline status line.
    const notify = ({ variant, title, message, duration, fallback }) => {
      if (typeof window.showToast === 'function') {
        window.showToast({ variant, title, message, duration });
      } else {
        setStatus(fallback || title + ' — ' + message, variant === 'error' ? 'error' : 'ok');
      }
    };

    // Until WAITLIST_ENDPOINT is set there is no server to receive the address,
    // so park it in localStorage. Nothing is transmitted; it simply means the
    // early signups aren't lost and can be exported once a backend exists.
    const QUEUE_KEY = 'storeshot:waitlist';
    const queueLocally = email => {
      try {
        const queued = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        if (!queued.some(entry => entry.email === email)) {
          queued.push({ email, at: new Date().toISOString() });
          localStorage.setItem(QUEUE_KEY, JSON.stringify(queued));
        }
      } catch (error) {
        /* private browsing or a full quota — the confirmation still stands */
      }
    };

    // One shared confirmation so every success path looks and reads the same.
    const confirmSignup = email => {
      const row = form.querySelector('.waitlist-row');
      if (row) row.hidden = true;
      setStatus('Saved ' + email + '. We\u2019ll be in touch the day we launch.', 'ok');
      notify({
        variant: 'success',
        title: 'You\u2019re on the list',
        message: 'Your email\u2019s locked in. We\u2019ll send one note the day StoreShot Studio hits the App Store — nothing before it.',
        duration: 6500,
        fallback: 'You\u2019re on the list. We\u2019ll email you the day StoreShot Studio launches.'
      });
    };

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const email = input.value.trim();

      if (!isValid(email)) {
        setStatus('', '');
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        notify({
          variant: 'error',
          title: 'That email looks off',
          message: 'Check the address and try again — we only need a valid inbox.',
          fallback: 'Please enter a valid email address.'
        });
        return;
      }
      input.removeAttribute('aria-invalid');

      // No endpoint configured yet — confirm to the visitor and hold the address
      // locally so it can be recovered once a real endpoint is wired up.
      if (!WAITLIST_ENDPOINT) {
        queueLocally(email);
        confirmSignup(email);
        return;
      }

      submit.disabled = true;
      setStatus('Adding you to the list…', '');

      try {
        const response = await fetch(WAITLIST_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email })
        });
        if (!response.ok) throw new Error('Request failed: ' + response.status);
        confirmSignup(email);
      } catch (error) {
        setStatus('', '');
        submit.disabled = false;
        notify({
          variant: 'error',
          title: 'That didn\u2019t go through',
          message: 'Something went wrong on our end. Email ' + WAITLIST_FALLBACK_EMAIL + ' and we\u2019ll add you manually.',
          duration: 8000,
          fallback: 'Something went wrong. Please email ' + WAITLIST_FALLBACK_EMAIL + ' instead.'
        });
      }
    });

    input.addEventListener('input', () => {
      if (status.textContent) setStatus('', '');
      input.removeAttribute('aria-invalid');
    });
  }
}

/* ---------------------------------------------------------------------------
   Toast notifications
   ---------------------------------------------------------------------------
   Injects its own viewport, so every page gets toasts without markup changes.

     showToast({ title, message, variant, duration })

   variant: 'success' | 'error' | 'info'   (default 'info')
   duration: ms before auto-dismiss, or 0 to keep it until dismissed.

   The viewport is a persistent aria-live region — the most reliable way to get
   dynamically injected messages announced — so individual toasts intentionally
   carry no role of their own, which would double-announce.
--------------------------------------------------------------------------- */
(function () {
  const DEFAULT_DURATION = 5200;
  const MAX_VISIBLE = 3;

  const ICONS = {
    success: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 4.5V9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="11.75" r="1" fill="currentColor"/></svg>',
    info: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 11.5V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="4.5" r="1" fill="currentColor"/></svg>'
  };

  const reduceMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let viewport = null;
  function getViewport() {
    if (viewport && document.body.contains(viewport)) return viewport;
    viewport = document.createElement('div');
    viewport.className = 'toast-viewport';
    viewport.setAttribute('aria-live', 'polite');
    viewport.setAttribute('aria-atomic', 'false');
    document.body.appendChild(viewport);
    return viewport;
  }

  function dismiss(toast) {
    if (!toast || toast.dataset.leaving === 'true') return;
    toast.dataset.leaving = 'true';
    clearTimeout(toast._timer);
    toast.classList.remove('is-visible');
    toast.classList.add('is-leaving');
    const remove = () => toast.remove();
    if (reduceMotion()) return remove();
    toast.addEventListener('transitionend', remove, { once: true });
    setTimeout(remove, 600); // belt-and-braces if transitionend never fires
  }

  function showToast(options) {
    const opts = typeof options === 'string' ? { message: options } : options || {};
    const variant = ICONS[opts.variant] ? opts.variant : 'info';
    const duration = opts.duration === 0 ? 0 : Number(opts.duration) || DEFAULT_DURATION;
    const host = getViewport();

    while (host.children.length >= MAX_VISIBLE) dismiss(host.firstElementChild);

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + variant;
    toast.style.setProperty('--toast-duration', duration + 'ms');

    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.innerHTML = ICONS[variant];

    const body = document.createElement('div');
    body.className = 'toast-body';
    if (opts.title) {
      const title = document.createElement('strong');
      title.className = 'toast-title';
      title.textContent = opts.title;
      body.appendChild(title);
    }
    if (opts.message) {
      const message = document.createElement('p');
      message.className = 'toast-message';
      message.textContent = opts.message;
      body.appendChild(message);
    }

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.innerHTML = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 3L9 9M9 3L3 9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';
    close.addEventListener('click', () => dismiss(toast));

    toast.append(icon, body, close);

    if (duration > 0) {
      const bar = document.createElement('span');
      bar.className = 'toast-progress';
      bar.appendChild(document.createElement('i'));
      toast.appendChild(bar);
    }

    host.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-visible')));

    if (duration > 0) {
      let remaining = duration;
      let startedAt = Date.now();
      const start = () => { startedAt = Date.now(); toast._timer = setTimeout(() => dismiss(toast), remaining); };
      const pause = () => { clearTimeout(toast._timer); remaining -= Date.now() - startedAt; };
      toast.addEventListener('mouseenter', pause);
      toast.addEventListener('mouseleave', start);
      toast.addEventListener('focusin', pause);
      toast.addEventListener('focusout', start);
      start();
    }

    return toast;
  }

  window.showToast = showToast;
  window.dismissToasts = () => {
    if (viewport) Array.from(viewport.children).forEach(dismiss);
  };

  // Escape dismisses the most recent toast.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && viewport && viewport.lastElementChild) {
      dismiss(viewport.lastElementChild);
    }
  });
})();

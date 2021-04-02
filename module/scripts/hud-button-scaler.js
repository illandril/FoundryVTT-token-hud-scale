import Settings, { SETTINGS_UPDATED } from './settings.js';
import { CSS_PREFIX } from './module.js';

const CSS_HUD_BUTTON_SCALE = `${CSS_PREFIX}hud-button-scale`;

const refresh = () => {
  let scale = Settings.HUDButtonScale.get();
  if (Settings.EnableStaticSizedHUD.get()) {
    if(!canvas || !canvas.stage) {
      return;
    }
    const canvasScale = canvas.stage.scale.x;
    scale = scale / canvasScale;
  }
  if (scale === 1) {
    document.body.classList.remove(CSS_HUD_BUTTON_SCALE);
  } else {
    document.body.classList.add(CSS_HUD_BUTTON_SCALE);
    document.documentElement.style.setProperty(`--${CSS_HUD_BUTTON_SCALE}`, `${scale}`);
  }
};
Hooks.on('init', refresh);
Hooks.on(SETTINGS_UPDATED, refresh);
Hooks.on('canvasPan', refresh);

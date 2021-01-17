import Settings, { SETTINGS_UPDATED } from './settings.js';
import { CSS_PREFIX } from './module.js';

const CSS_HUD_BUTTON_BG = `${CSS_PREFIX}darken-hud-button-bg`;

const refresh = () => {
  if(Settings.DarkenHUDButtonBG.get()) {
    document.body.classList.add(CSS_HUD_BUTTON_BG);
  } else {
    document.body.classList.remove(CSS_HUD_BUTTON_BG);
  }
};
Hooks.on('init', refresh);
Hooks.on(SETTINGS_UPDATED, refresh);

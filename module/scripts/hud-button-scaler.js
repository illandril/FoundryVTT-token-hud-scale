import Settings, { SETTINGS_UPDATED } from './settings.js';
import { CSS_PREFIX } from './module.js';

const CSS_HUD_BUTTON_SCALE = `${CSS_PREFIX}hud-button-scale`;

const refresh = () => {
  if(Settings.EnableHUDButtonScale.get()) {
    document.body.classList.add(CSS_HUD_BUTTON_SCALE);
  } else {
    document.body.classList.remove(CSS_HUD_BUTTON_SCALE);
  }
};
Hooks.on('init', refresh);
Hooks.on(SETTINGS_UPDATED, refresh);

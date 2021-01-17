import Settings, { SETTINGS_UPDATED } from './settings.js';
import { CSS_PREFIX } from './module.js';

const CSS_STATUS_SLECTOR_SCALE = `${CSS_PREFIX}status-selector-scale`;

const refresh = () => {
  if(Settings.EnableStatusSelectorScale.get()) {
    document.body.classList.add(CSS_STATUS_SLECTOR_SCALE);
  } else {
    document.body.classList.remove(CSS_STATUS_SLECTOR_SCALE);
  }
};
Hooks.on('init', refresh);
Hooks.on(SETTINGS_UPDATED, refresh);

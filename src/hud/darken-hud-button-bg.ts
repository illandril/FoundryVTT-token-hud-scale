import module from '../module';
import './darken-hud-button-bg.scss';

const CSS_HUD_BUTTON_BG = module.cssPrefix.child('darken-hud-button-bg');

const refresh = () => {
  if (darkenHUDSetting.get()) {
    document.body.classList.add(CSS_HUD_BUTTON_BG);
  } else {
    document.body.classList.remove(CSS_HUD_BUTTON_BG);
  }
};

const darkenHUDSetting = module.settings.register('darkenHUDButtonBG', Boolean, true, { hasHint: true, onChange: refresh });

Hooks.on('init', refresh);

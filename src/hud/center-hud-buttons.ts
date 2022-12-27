import module from '../module';
import './center-hud-buttons.scss';

const CSS_CENTER_HUD_BUTTONS = module.cssPrefix.child('center-hud-buttons');

const refresh = () => {
  if (centerHUDButtonsSetting.get()) {
    document.body.classList.add(CSS_CENTER_HUD_BUTTONS);
  } else {
    document.body.classList.remove(CSS_CENTER_HUD_BUTTONS);
  }
};

const centerHUDButtonsSetting = module.settings.register('centerHUDButtons', Boolean, true, { onChange: refresh });

Hooks.on('init', refresh);

import module from './module';

const CSS_STATUS_SLECTOR_SCALE = module.cssPrefix.child('status-selector-scale');

const refresh = () => {
  if (enableStatusSelectorScale.get()) {
    document.body.classList.add(CSS_STATUS_SLECTOR_SCALE);
  } else {
    document.body.classList.remove(CSS_STATUS_SLECTOR_SCALE);
  }
};

const enableStatusSelectorScale = module.settings.register('enableStatusSelectorScale', Boolean, true, { hasHint: true, onChange: refresh });

Hooks.on('init', refresh);

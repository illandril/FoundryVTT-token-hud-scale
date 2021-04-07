import Settings, { SETTINGS_UPDATED } from './settings.js';

const baselineSetPosition = TokenHUD.prototype.setPosition;
const rescaleSetPosition = function () {
  const td = this.object.data;
  const ratio = canvas.dimensions.size / 100;
  let scale = Settings.HUDButtonScale.get();
  if (Settings.EnableStaticSizedHUD.get()) {
    scale /= canvas.stage.scale.x;
  }
  scale *= ratio;
  const offset = td.width * (scale - ratio) * -50;
  const position = {
    width: td.width * 100,
    height: td.height * 100,
    left: this.object.x + offset,
    top: this.object.y + offset,
  };
  if (scale !== 1) position.transform = `scale(${scale})`;
  this.element.css(position);
};

const refresh = debounce(() => {
  if (canvas.hud.token.rendered) {
    canvas.hud.token.setPosition();
  }
}, 100);

const updateSetPosition = () => {
  if (Settings.EnableStaticSizedHUD.get() || Settings.HUDButtonScale.get() !== 1) {
    TokenHUD.prototype.setPosition = rescaleSetPosition;
  } else {
    TokenHUD.prototype.setPosition = baselineSetPosition;
  }
};
Hooks.on('init', updateSetPosition);
Hooks.on(SETTINGS_UPDATED, () => {
  updateSetPosition();
  refresh();
});
Hooks.on('canvasPan', refresh);

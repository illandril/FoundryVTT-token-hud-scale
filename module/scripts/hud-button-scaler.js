import Settings, { SETTINGS_UPDATED } from './settings.js';

const baselineSetPosition = TokenHUD.prototype.setPosition;
const rescaleSetPosition = function () {
  const hudButtonScale = Settings.HUDButtonScale.get()
  const staticSizedHUD = Settings.EnableStaticSizedHUD.get();
  const oneByOneHUD = Settings.EnableOneXOneHUD.get();

  const td = this.object.document;
  const ratio = canvas.dimensions.size / 100;
  let scale = hudButtonScale;
  if (staticSizedHUD) {
    scale /= canvas.stage.scale.x;
  } else {
    scale *= ratio;
  }

  const tokenCenterX = this.object.x + td.width * ratio * 50;
  const tokenCenterY = this.object.y + td.height * ratio * 50;
  const widthInTiles = oneByOneHUD ? hudButtonScale : td.width;
  const heightInTiles = oneByOneHUD ? hudButtonScale : td.height;
  const width = widthInTiles * 100;
  const height = heightInTiles * 100;
  const left = tokenCenterX - widthInTiles * scale * 50;
  const top = tokenCenterY - heightInTiles * scale * 50;
  const position = {
    width,
    height,
    left,
    top,
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
  if (Settings.EnableStaticSizedHUD.get() || Settings.EnableOneXOneHUD.get() || Settings.HUDButtonScale.get() !== 1) {
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

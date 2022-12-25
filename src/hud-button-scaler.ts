import module from './module';

const onSettingsChange = () => {
  updateSetPosition();
  refresh();
};

const enableStaticSizedHUDSetting = module.settings.register('enableStaticSizedHUD', Boolean, true, {
  hasHint: true, onChange: onSettingsChange,
});

const enableOneXOneHUDSetting = module.settings.register('enableOneXOneHUD', Boolean, true, {
  hasHint: true, onChange: onSettingsChange,
});

const hudButtonScaleSetting = module.settings.register('hudButtonScale', Number, 1, {
  hasHint: true, onChange: onSettingsChange,
  range: { min: 0.25, max: 5, step: 0.25 },
});

const refresh = debounce(() => {
  if (game.canvas.hud.token.rendered) {
    game.canvas.hud.token.setPosition();
  }
  if (game.canvas.hud.tile.rendered) {
    game.canvas.hud.tile.setPosition();
  }
  if (game.canvas.hud.drawing.rendered) {
    game.canvas.hud.drawing.setPosition();
  }
}, 100);

const HUD_COLUMN_WIDTH = 70;
const UNSCALED_TILE_SIZE = 100;
const UNSCALED_HALF_TILE_SIZE = UNSCALED_TILE_SIZE / 2;

const baselineTokenSetPosition = TokenHUD.prototype.setPosition;
const baselineTileSetPosition = TileHUD.prototype.setPosition;
const baselineDrawingSetPosition = DrawingHUD.prototype.setPosition;

type Size = {
  width: number,
  height: number,
};

type Position = {
  x: number,
  y: number,
};

const scaleSize = ({ width, height }: Size, scale: number) => ({
  width: width / scale,
  height: height / scale,
});

const getCanvasTileSize = () => game.canvas.dimensions?.size || UNSCALED_TILE_SIZE;

const setPosition = (hud: BasePlaceableHUD, { x, y }: Position, { width, height }: Size, addColumnWidth?: boolean) => {
  const hudButtonScale = hudButtonScaleSetting.get();
  const staticSizedHUD = enableStaticSizedHUDSetting.get();
  const oneByOneHUD = enableOneXOneHUDSetting.get();

  const ratio = getCanvasTileSize() / UNSCALED_TILE_SIZE;
  let scale = hudButtonScale;
  if (staticSizedHUD) {
    scale /= game.canvas.stage?.scale?.x || 1;
  } else {
    scale *= ratio;
  }

  const tokenCenterX = x + width * ratio * UNSCALED_HALF_TILE_SIZE;
  const tokenCenterY = y + height * ratio * UNSCALED_HALF_TILE_SIZE;
  module.logger.info(tokenCenterX, tokenCenterY);
  const widthInTiles = oneByOneHUD ? hudButtonScale : width;
  const heightInTiles = oneByOneHUD ? hudButtonScale : height;

  const positionCSS = {
    width: widthInTiles * UNSCALED_TILE_SIZE,
    height: heightInTiles * UNSCALED_TILE_SIZE,
    left: tokenCenterX - widthInTiles * scale * UNSCALED_HALF_TILE_SIZE,
    top: tokenCenterY - heightInTiles * scale * UNSCALED_HALF_TILE_SIZE,
  };
  if (addColumnWidth) {
    positionCSS.width += HUD_COLUMN_WIDTH * 2;
    positionCSS.left -= HUD_COLUMN_WIDTH * scale;
  }
  if (scale !== 1) {
    positionCSS.transform = `scale(${scale})`;
  }
  hud.element.css(positionCSS);
};

const updateSetPosition = () => {
  if (enableStaticSizedHUDSetting.get() || enableOneXOneHUDSetting.get() || hudButtonScaleSetting.get() !== 1) {
    TokenHUD.prototype.setPosition = function() {
      setPosition(this, this.object /* position */, this.object.document /* scale */);
    };
    TileHUD.prototype.setPosition = function() {
      setPosition(this, this.object /* position */, scaleSize(this.object.document, getCanvasTileSize()), true /* addColumnWidth */);
    };
    DrawingHUD.prototype.setPosition = function() {
      setPosition(this, this.object /* position */, scaleSize(this.object.document.shape, getCanvasTileSize()), true /* addColumnWidth */);
    };
  } else {
    TokenHUD.prototype.setPosition = baselineTokenSetPosition;
    TileHUD.prototype.setPosition = baselineTileSetPosition;
    DrawingHUD.prototype.setPosition = baselineDrawingSetPosition;
  }
};

Hooks.on('init', updateSetPosition);
Hooks.on('canvasPan', refresh);

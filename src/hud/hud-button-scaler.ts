import module from '../module';

const refresh = foundry.utils.debounce(() => {
  if (game.canvas.hud?.token.rendered) {
    game.canvas.hud?.token.setPosition();
  }
  if (game.canvas.hud?.tile.rendered) {
    game.canvas.hud?.tile.setPosition();
  }
  if (game.canvas.hud?.drawing.rendered) {
    game.canvas.hud?.drawing.setPosition();
  }
}, 100);

const enableStaticSizedHUDSetting = module.settings.register('enableStaticSizedHUD', Boolean, true, {
  hasHint: true,
  onChange: refresh,
});

const enableOneXOneHUDSetting = module.settings.register('enableOneXOneHUD', Boolean, true, {
  hasHint: true,
  onChange: refresh,
});

const hudButtonScaleSetting = module.settings.register('hudButtonScale', Number, 1, {
  hasHint: true,
  onChange: refresh,
  range: { min: 0.25, max: 5, step: 0.25 },
});

const HUD_COLUMN_WIDTH = 70;
const BASE_TILE_SIZE = 100;
const HALF_BASE_TILE_SIZE = BASE_TILE_SIZE / 2;

type PositionCSS = {
  width: number;
  height: number;
  left: number;
  top: number;
  transform?: string;
};

const calculateScale = (hudButtonScale: number, staticSizedHUD: boolean, tileSize: number) => {
  let scale: number;
  if (staticSizedHUD) {
    scale = hudButtonScale / (game.canvas.stage?.scale?.x || 1);
  } else {
    scale = hudButtonScale * (tileSize / BASE_TILE_SIZE);
  }
  return scale;
};

const getPositionCSS = (
  center: PIXI.Point,
  widthInTiles: number,
  heightInTiles: number,
  scale: number,
  addColumnWidth?: boolean,
) => {
  const positionCSS: PositionCSS = {
    width: widthInTiles * BASE_TILE_SIZE,
    height: heightInTiles * BASE_TILE_SIZE,
    left: center.x - widthInTiles * scale * HALF_BASE_TILE_SIZE,
    top: center.y - heightInTiles * scale * HALF_BASE_TILE_SIZE,
  };

  if (addColumnWidth) {
    positionCSS.width += HUD_COLUMN_WIDTH * 2;
    positionCSS.left -= HUD_COLUMN_WIDTH * scale;
  }
  if (scale !== 1) {
    positionCSS.transform = `scale(${scale})`;
  }
  return positionCSS;
};

const extendSetPosition = <T extends typeof TokenHUD | typeof TileHUD | typeof DrawingHUD>(
  hudClass: T,
  addColumnWidth?: boolean,
) => {
  const originalSetPosition = hudClass.prototype.setPosition;

  hudClass.prototype.setPosition = function (...args) {
    const hudButtonScale = hudButtonScaleSetting.get();
    const staticSizedHUD = enableStaticSizedHUDSetting.get();
    const oneByOneHUD = enableOneXOneHUDSetting.get();

    if ((!oneByOneHUD && !staticSizedHUD && hudButtonScale === 1) || !this.object) {
      originalSetPosition.apply(this, args);
      return;
    }

    const tileSize = game.canvas.dimensions?.size || BASE_TILE_SIZE;
    const { width, height } = this.object.bounds;

    const scale = calculateScale(hudButtonScale, staticSizedHUD, tileSize);

    const widthInTiles = oneByOneHUD ? hudButtonScale : width / tileSize;
    const heightInTiles = oneByOneHUD ? hudButtonScale : height / tileSize;

    this.element.css(getPositionCSS(this.object.center, widthInTiles, heightInTiles, scale, addColumnWidth));
  };
};

Hooks.on('init', () => {
  extendSetPosition(TokenHUD);
  extendSetPosition(TileHUD, true);
  extendSetPosition(DrawingHUD, true);
});

Hooks.on('canvasPan', refresh);

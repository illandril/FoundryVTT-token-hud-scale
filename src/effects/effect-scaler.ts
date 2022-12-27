import module from '../module';

const refresh = () => {
  game.canvas?.tokens?.placeables.forEach((token) => {
    token.drawEffects();
  });
};

const effectIconsLayoutSetting = module.settings.register('effectIconsLayout', String, 'horizontal', {
  hasHint: true, onChange: refresh,
  choices: ['horizontal', 'vertical', 'above'],
});

const effectIconsPerRowSetting = module.settings.register('effectIconsPerRow', Number, 3, {
  hasHint: true, onChange: refresh,
  range: { min: 2, max: 10, step: 1 },
});

// eslint-disable-next-line @typescript-eslint/unbound-method
const origRefreshEffects = Token.prototype._refreshEffects;
Token.prototype._refreshEffects = function(...args) {
  // Draw the icons the way the system wants them drawn first. For most systems this is wasteful, but for some it might be
  // adjusting the icon positions based on something special, which we want to continue to respect.
  origRefreshEffects.apply(this, args);
  if (this) {
    updateEffectScales(this);
  }
};

const countEffects = (token: Token) => {
  if (!token) {
    return 0;
  }
  let numEffects = token.document.effects?.length || 0;
  token.actor?.temporaryEffects?.forEach((actorEffect) => {
    if (!actorEffect.getFlag('core', 'overlay')) {
      numEffects++;
    }
  });
  return numEffects;
};

const sortIcons = (e1: PIXI.DisplayObject, e2: PIXI.DisplayObject) => {
  if (e1.position.x === e2.position.x) {
    return e1.position.y - e2.position.y;
  }
  return e1.position.x - e2.position.x;
};

const updateIconSize = (effectIcon: PIXI.Sprite, width: number) => {
  effectIcon.width = width;
  effectIcon.height = width;
};

const updateIconPosition = (effectIcon: PIXI.Sprite, i: number, iconsPerRow: number, horizontal: boolean, above: boolean) => {
  const x = i % iconsPerRow * effectIcon.width;
  let y = Math.floor(i / iconsPerRow) * effectIcon.width;
  if (above) {
    y = y * -1 - effectIcon.width;
  }

  effectIcon.position.x = horizontal ? x : y;
  effectIcon.position.y = horizontal ? y : x;
};

const drawBG = (effectIcon: PIXI.Sprite, background: PIXI.Graphics) => {
  background.drawRoundedRect(
    effectIcon.position.x,
    effectIcon.position.y,
    effectIcon.width,
    effectIcon.width,
    2,
  );
};

const updateEffectScales = (token: Token) => {
  const numEffects = countEffects(token);
  if (numEffects > 0 && token.effects.children.length > 0) {
    const layout = effectIconsLayoutSetting.get();
    const above = layout === 'above';
    const horizontal = above || layout === 'horizontal';
    const iconsPerRow = Math.ceil(effectIconsPerRowSetting.get() * (horizontal ? token.document.width : token.document.height));

    const width = (horizontal ? token.bounds.width : token.bounds.height) / iconsPerRow;
    const background = token.effects.children[0];
    if (!(background instanceof PIXI.Graphics)) {
      module.logger.warn('token.effects.children[0] was not a PIXI.Graphics instance', background);
      return;
    }
    background
      .clear()
      .beginFill(0x000000, 0.6)
      .lineStyle(1.0, 0x000000);

    // Exclude the background and overlay
    const effectIcons = token.effects.children.slice(1, 1 + numEffects);

    // Effect icons aren't necessarily in the order they appear... sort them so they are
    // (Order is very important in some cases, like GURPS manuevers - see Issue #26)
    effectIcons.sort(sortIcons);

    // Reposition and scale them
    effectIcons.forEach((effectIcon, i) => {
      if (!(effectIcon instanceof PIXI.Sprite)) {
        module.logger.warn(`token.effects.children[${i + 1}] was not a PIXI.Sprite instance`, effectIcon);
        return;
      }
      updateIconSize(effectIcon, width);
      updateIconPosition(effectIcon, i, iconsPerRow, horizontal, above);
      drawBG(effectIcon, background);
    });
  }
};

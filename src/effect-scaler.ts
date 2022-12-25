import module from './module';

const refresh = () => {
  game.canvas?.tokens?.placeables.forEach((token) => {
    token.drawEffects();
  });
};

// TODO Add this to utils
// horizontal: `${MODULE_KEY}.setting.effectIconsLayout.choice_horizontal`,
// vertical: `${MODULE_KEY}.setting.effectIconsLayout.choice_vertical`,
// above: `${MODULE_KEY}.setting.effectIconsLayout.choice_above`,
const effectIconsLayout = module.settings.register('effectIconsLayout', String, 'horizontal', {
  hasHint: true, onChange: refresh,
  choices: ['horizontal', 'vertical', 'above'],
});

const effectIconsPerRow = module.settings.register('effectIconsPerRow', Number, 3, {
  hasHint: true, onChange: refresh,
  range: { min: 2, max: 10, step: 1 },
});

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

const updateEffectScales = (token: Token) => {
  const numEffects = countEffects(token);
  const effectsHUD = token.effects;
  if (numEffects > 0 && effectsHUD.children.length > 0) {
    const layout = effectIconsLayout.get();
    const above = layout === 'above';
    const horizontal = above || layout === 'horizontal';
    const iconsPerRow = Math.ceil(effectIconsPerRow.get() * (horizontal ? token.document.width : token.document.height));

    const width = (horizontal ? token.w : token.h) / iconsPerRow;
    const background = effectsHUD.children[0];
    background.clear();
    background.beginFill(0x000000, 0.6).lineStyle(1.0, 0x000000);

    // Exclude the background and overlay
    const effectIcons = effectsHUD.children.slice(1, 1 + numEffects);

    // Effect icons aren't necessarily in the order they appear... sort them so they are
    // (Order is very important in some cases, like GURPS manuevers - see Issue #26)
    effectIcons.sort((e1, e2) => {
      if (e1.position.x === e2.position.x) {
        return e1.position.y - e2.position.y;
      }
      return e1.position.x - e2.position.x;
    });

    // Reposition and scale them
    effectIcons.forEach((effectIcon, i) => {
      const x = i % iconsPerRow * width;
      let y = Math.floor(i / iconsPerRow) * width;
      if (above) {
        y = y * -1 - width;
      }
      effectIcon.width = effectIcon.height = width;
      effectIcon.position.x = horizontal ? x : y;
      effectIcon.position.y = horizontal ? y : x;
      background.drawRoundedRect(
        effectIcon.position.x,
        effectIcon.position.y,
        effectIcon.width,
        effectIcon.width,
        2,
      );
    });
  }
};

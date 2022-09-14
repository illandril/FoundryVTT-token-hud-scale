import Settings, { SETTINGS_UPDATED } from './settings.js';

const origRefreshEffects = Token.prototype._refreshEffects;
Token.prototype._refreshEffects = async function (...args) {
  // Draw the icons the way the system wants them drawn first. For most systems this is wasteful, but for some it might be
  // adjusting the icon positions based on something special, which we want to continue to respect.
  await origRefreshEffects.apply(this, args);
  updateEffectScales(this);
};

Hooks.on('canvasReady', (canvas) => {
  canvas.tokens.placeables.forEach((token) => {
    token.drawEffects();
  });
});

Hooks.on(SETTINGS_UPDATED, () => {
  if (canvas && canvas.tokens) {
    canvas.tokens.placeables.forEach((token) => {
      token.drawEffects();
    });
  }
});

function countEffects(token) {
  if (!token) {
    return 0;
  }
  const tokenEffects = token.document.effects;
  const actorEffects = (token.actor && token.actor.temporaryEffects) || [];
  let numEffects = tokenEffects.length;
  actorEffects.forEach((actorEffect) => {
    if (!actorEffect.getFlag('core', 'overlay')) {
      numEffects++;
    }
  });
  return numEffects;
}

function updateEffectScales(token) {
  const numEffects = countEffects(token);
  const effectsHUD = token.effects;
  if (numEffects > 0 && effectsHUD.children.length > 0) {
    const layout = Settings.EffectIconsLayout.get();
    const above = layout === 'above';
    const horizontal = above || layout === 'horizontal';
    const iconsPerRow = Math.ceil(Settings.EffectIconsPerRow.get() * (horizontal ? token.document.width : token.document.height));

    const w = (horizontal ? token.w : token.h) / iconsPerRow;
    const bg = effectsHUD.children[0];
    bg.clear();
    bg.beginFill(0x000000, 0.6).lineStyle(1.0, 0x000000);

    // Exclude the background and overlay
    const effectIcons = effectsHUD.children.slice(1, 1 + numEffects);

    // Effect icons aren't necessarily in the order they appear... sort them so they are
    // (Order is very important in some cases, like GURPS manuevers - see Issue #26)
    effectIcons.sort((e1, e2) => {
      if(e1.position.x === e2.position.x) {
        return e1.position.y - e2.position.y;
      }
      return e1.position.x - e2.position.x;
    });

    // Reposition and scale them
    effectIcons.forEach((effectIcon, i) => {
      const x = (i % iconsPerRow) * w;
      let y = Math.floor(i / iconsPerRow) * w;
      if(above) {
        y = y * -1 - w;
      }
      effectIcon.width = effectIcon.height = w;
      effectIcon.position.x = horizontal ? x : y;
      effectIcon.position.y = horizontal ? y : x;
      bg.drawRoundedRect(
        effectIcon.position.x,
        effectIcon.position.y,
        effectIcon.width,
        effectIcon.width,
        2
      );
    });
  }
}

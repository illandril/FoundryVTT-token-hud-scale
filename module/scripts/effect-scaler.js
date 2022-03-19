import { log } from './module.js';
import Settings, { SETTINGS_UPDATED } from './settings.js';

const origDrawEffects = Token.prototype.drawEffects;
Token.prototype.drawEffects = async function (...args) {
  await origDrawEffects.apply(this, args);
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
  const tokenEffects = token.data.effects;
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
  const effectsHUD = token.hud && token.hud.effects || token.effects;
  if (numEffects > 0 && effectsHUD.children.length > 0) {
    const layout = Settings.EffectIconsLayout.get();
    const above = layout === 'above';
    const horizontal = above || layout === 'horizontal';
    const iconsPerRow = Math.ceil(Settings.EffectIconsPerRow.get() * (horizontal ? token.data.width : token.data.height));

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

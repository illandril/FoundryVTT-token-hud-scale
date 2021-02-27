import { log } from './module.js';
import Settings, { SETTINGS_UPDATED } from './settings.js';

const origDrawEffects = Token.prototype.drawEffects;
Token.prototype.drawEffects = async function (...args) {
  await origDrawEffects.apply(this, args);
  updateEffectScales(this);
};

Hooks.on('canvasReady', (canvas) => {
  canvas.tokens.placeables.forEach((token) => {
    updateEffectScales(token);
  });
});

Hooks.on(SETTINGS_UPDATED, () => {
  if (canvas && canvas.tokens) {
    canvas.tokens.placeables.forEach((token) => {
      updateEffectScales(token);
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
  const iconsPerRow = Settings.EffectIconsPerRow.get();
  const numEffects = countEffects(token);
  if (numEffects > 0 && token.effects.children.length > 0) {
    const w = Math.floor(token.w / iconsPerRow);
    const bg = token.effects.children[0];
    bg.clear();
    bg.beginFill(0x000000, 0.6).lineStyle(1.0, 0x000000);
    token.effects.children.forEach((effectIcon, i) => {
      if (i === 0) {
        // BG
      } else if (i <= numEffects) {
        // Effect icon
        const ei = i - 1;
        const x = (ei % iconsPerRow) * w;
        const y = Math.floor(ei / iconsPerRow) * w;
        effectIcon.width = effectIcon.height = w;
        effectIcon.position.x = x;
        effectIcon.position.y = y;
        bg.drawRoundedRect(
          effectIcon.position.x,
          effectIcon.position.y,
          effectIcon.width,
          effectIcon.width,
          2
        );
      } else {
        // Overlay icon
      }
    });
  }
}

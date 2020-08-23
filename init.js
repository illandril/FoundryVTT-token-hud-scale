Hooks.on("canvasReady", canvas => {
  canvas.tokens.placeables.forEach(token => {
    token.effects.addListener("childAdded", child => {
      fixEffectScale(token, child);
    });
    updateEffectScales(token);
  });
});

Hooks.on("createToken", (parent, tokenData, options, userId) => {
  setTimeout(() => {
    const token = canvas.tokens.get(tokenData._id);
    token.effects.addListener("childAdded", child => {
      fixEffectScale(token, child);
    });
    updateEffectScales(token);
  }, 1000);
});

let pendingUpdates = {};

function fixEffectScale(token, child) {
  clearTimeout(pendingUpdates[token.id]);
  pendingUpdates[token.id] = setTimeout(() => {
    updateEffectScales(token);
  }, 10);
}

function updateEffectScales(token) {
  const numEffects = token.data.effects.length;
  if (numEffects > 0) {
    const w = Math.floor(token.width / 3)-1;
    const bg = token.effects.children[0];
    bg.clear();
    bg.beginFill(0x000000, 0.60).lineStyle(1.0, 0x000000);
    token.effects.children.forEach((effectIcon, i) => {
      if ( i === 0 ) {
        // BG
      } else if ( i <= numEffects ) {
        // Effect icon
        const ei = i-1;
        const x = (ei % 3) * w;
        const y = Math.floor(ei / 3) * w;
        effectIcon.width = effectIcon.height = w;
        effectIcon.position.x = x;
        effectIcon.position.y = y;
        bg.drawRoundedRect(effectIcon.position.x, effectIcon.position.y, effectIcon.width, effectIcon.width, 2);
      } else {
        // Overlay icon
      }
    });
  }
}

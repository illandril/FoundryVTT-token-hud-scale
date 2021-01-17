import { log, KEY as MODULE_KEY } from './module.js';

const settingsList = [];

export const SETTINGS_UPDATED = MODULE_KEY + '.SettingsUpdated';

const refresh = () => {
  Hooks.callAll(SETTINGS_UPDATED);
};

class Setting {
  constructor(type, key, defaultValue, options = {}) {
    this.type = type;
    this.key = key;
    this.hasHint = !!options.hasHint;
    this.defaultValue = defaultValue;
    this.choices = options.choices || undefined;
    this.range = options.range || undefined;
    this.scope = options.scope || 'world';
    settingsList.push(this);
  }

  register() {
    const name = game.i18n.localize(`${MODULE_KEY}.setting.${this.key}.label`);
    const hint = this.hasHint ? game.i18n.localize(`${MODULE_KEY}.setting.${this.key}.hint`) : null;
    game.settings.register(MODULE_KEY, this.key, {
      name,
      hint,
      scope: this.scope,
      config: true,
      default: this.defaultValue,
      type: this.type,
      choices: this.choices,
      range: this.range,
      onChange: refresh,
    });
  }

  get() {
    return game.settings.get(MODULE_KEY, this.key);
  }
}

class BooleanSetting extends Setting {
  constructor(key, defaultValue, options = {}) {
    super(Boolean, key, defaultValue, options);
  }
}

class RangeSetting extends Setting {
  constructor(key, defaultValue, min, max, step, options = {}) {
    super(
      Number,
      key,
      defaultValue,
      mergeObject(
        options,
        {
          range: {
            min,
            max,
            step,
          },
        },
        { inplace: false }
      )
    );
  }
}

const Settings = {
  EffectIconsPerRow: new RangeSetting('effectIconsPerRow', 3, 2, 10, 1, { hasHint: true }),
  EnableHUDButtonScale: new BooleanSetting('enableHUDButtonScale', true, { hasHint: true }),
  EnableStatusSelectorScale: new BooleanSetting('enableStatusSelectorScale', true, { hasHint: true }),
  DarkenHUDButtonBG: new BooleanSetting('darkenHUDButtonBG', true, { hasHint: true }),
};

Object.freeze(Settings);
export default Settings;

Hooks.once('init', () => {
  settingsList.forEach((setting) => {
    setting.register();
  });
});

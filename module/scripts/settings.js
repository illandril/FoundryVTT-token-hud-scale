import { log, KEY as MODULE_KEY } from './module.js';

const settingsList = [];

const SETTINGS_VERSION = 2;
const SETTINGS_VERSION_KEY = 'settingsVersion';

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
  EffectIconsHorizontal: new BooleanSetting('effectIconsHorizontal', true, { hasHint: true }),
  HUDButtonScale: new RangeSetting('hudButtonScale', 1.0, 0.25, 5, 0.25, { hasHint: true }),
  EnableStaticSizedHUD: new BooleanSetting('enableStaticSizedHUD', true, { hasHint: true }),
  EnableStatusSelectorScale: new BooleanSetting('enableStatusSelectorScale', true, {
    hasHint: true,
  }),
  DarkenHUDButtonBG: new BooleanSetting('darkenHUDButtonBG', true, { hasHint: true }),
};

Object.freeze(Settings);
export default Settings;

let upgradeNotificationKey = null;
Hooks.once('init', () => {
  settingsList.forEach((setting) => {
    setting.register();
  });

  game.settings.register(MODULE_KEY, SETTINGS_VERSION_KEY, {
    scope: 'world',
    config: false,
    type: Number,
    default: 0,
  });
});

Hooks.once('ready', () => {
  const previousVersion = game.settings.get(MODULE_KEY, SETTINGS_VERSION_KEY);
  if (previousVersion < SETTINGS_VERSION) {
    if (previousVersion < 1) {
      game.settings.register(MODULE_KEY, 'enableHUDButtonScale', {
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
      });
      if (!game.settings.get(MODULE_KEY, 'enableHUDButtonScale')) {
        log.info(`Migrating old enableHUDButtonScale setting - setting hudButtonScale to 1`);
        game.settings.set(MODULE_KEY, Settings.HUDButtonScale.key, 1);
      }
    }
    if (previousVersion < 2) {
      upgradeNotificationKey = 'v2';
    }
    game.settings.set(MODULE_KEY, SETTINGS_VERSION_KEY, SETTINGS_VERSION);
    log.info(`Settings Initialized - upgraded from v${previousVersion} to v${SETTINGS_VERSION}`);
  } else {
    log.info(`Settings Initialized - already on ${SETTINGS_VERSION}`);
  }

  if(upgradeNotificationKey !== null) {
    ui.notifications.info(game.i18n.localize(`${MODULE_KEY}.upgradeNotification.${upgradeNotificationKey}`));
  }
})

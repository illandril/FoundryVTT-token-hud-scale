
import Chance from 'chance';

const chance = new Chance();

const randomOtherClass = chance.string({ alpha: true });

const expectedCSSClass = 'illandril-token-hud-scale--darken-hud-button-bg';

let module: typeof import('./module').default;
let registerSpy: jest.SpyInstance;
const mockGet = jest.fn();
let refresh: () => void;

const loadModule = async (initialState: boolean) => {
  document.body.className = 'vtt game';
  document.body.classList.add(randomOtherClass);

  mockGet.mockReturnValue(initialState);
  module = (await import('./module')).default;
  registerSpy = jest.spyOn(module.settings, 'register').mockImplementation((_namespace, _type, _defaultValue, options) => {
    refresh = options?.onChange as () => void;
    return {
      get: mockGet,
    };
  });

  await import('./darken-hud-button-bg');

  jest.resetModules();
};

it('registers darkenHUDButtonBG setting', async () => {
  await loadModule(true);

  expect(registerSpy).toBeCalledWith('darkenHUDButtonBG', Boolean, true, {
    hasHint: true, onChange: expect.any(Function) as unknown,
  });
});

describe('when enabled', () => {
  beforeEach(async () => loadModule(true));

  it('does not set the body CSS class before init', () => {
    expect(document.body).not.toHaveClass(expectedCSSClass);
  });

  it('sets the body CSS class on init', () => {
    Hooks.callAll('init');
    expect(document.body).toHaveClass(expectedCSSClass);
  });

  it('does not remove other CSS classes on init', () => {
    Hooks.callAll('init');
    expect(document.body).toHaveClass('vtt', 'game', randomOtherClass);
  });

  it('clears the body CSS class on disable', () => {
    Hooks.callAll('init');
    expect(document.body).toHaveClass(expectedCSSClass);
    mockGet.mockReturnValueOnce(false);
    refresh();
    expect(document.body).not.toHaveClass(expectedCSSClass);
  });

  it('does not remove other CSS classes on disable', () => {
    Hooks.callAll('init');
    expect(document.body).toHaveClass(expectedCSSClass);
    mockGet.mockReturnValueOnce(false);
    refresh();
    expect(document.body).toHaveClass('vtt', 'game', randomOtherClass);
  });
});

describe('when disabled', () => {
  beforeEach(async () => loadModule(false));

  it('does not set the body CSS class before init', () => {
    expect(document.body).not.toHaveClass(expectedCSSClass);
  });

  it('does not set the body CSS class on init', () => {
    Hooks.callAll('init');
    expect(document.body).not.toHaveClass(expectedCSSClass);
  });

  it('adds the body CSS class on enable', () => {
    Hooks.callAll('init');
    expect(document.body).not.toHaveClass(expectedCSSClass);
    mockGet.mockReturnValueOnce(true);
    refresh();
    expect(document.body).toHaveClass(expectedCSSClass);
  });

  it('does not remove other CSS classes on enable', () => {
    Hooks.callAll('init');
    expect(document.body).not.toHaveClass(expectedCSSClass);
    mockGet.mockReturnValueOnce(true);
    refresh();
    expect(document.body).toHaveClass('vtt', 'game', randomOtherClass);
  });
});

// it('registers darkenHUDButtonBG setting', async () => {
//   await import('./darken-hud-button-bg');

//   expect(registerSpy).toBeCalledWith('darkenHUDButtonBG', Boolean, true, {
//     hasHint: true, onChange: expect.any(Function),
//   });
// });



// const CSS_HUD_BUTTON_BG = module.cssPrefix.child('darken-hud-button-bg');

// const refresh = () => {
//   if (darkenHUDSetting.get()) {
//     document.body.classList.add(CSS_HUD_BUTTON_BG);
//   } else {
//     document.body.classList.remove(CSS_HUD_BUTTON_BG);
//   }
// };

// const darkenHUDSetting = module.settings.register('darkenHUDButtonBG', Boolean, true, { hasHint: true, onChange: refresh });

// Hooks.on('init', refresh);

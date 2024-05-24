import Chance from 'chance';

const chance = new Chance();

const randomOtherClass = chance.string({ alpha: true });

const expectedCSSClass = 'illandril-token-hud-scale--center-hud-buttons';

let module: typeof import('../module').default;
let registerSpy: jest.SpyInstance;
const mockGet = jest.fn();
let refresh: () => void;

const loadModule = async (initialState: boolean) => {
  document.body.className = 'vtt game';
  document.body.classList.add(randomOtherClass);

  mockGet.mockReturnValue(initialState);
  module = (await import('../module')).default;
  registerSpy = jest
    .spyOn(module.settings, 'register')
    .mockImplementation((_namespace, _type, _defaultValue, options) => {
      refresh = options?.onChange as () => void;
      return {
        get: mockGet,
        set: () => {
          throw new Error('Not expected to be called');
        },
      };
    });

  await import('./center-hud-buttons');

  jest.resetModules();
};

it('registers darkenHUDButtonBG setting', async () => {
  await loadModule(true);

  expect(registerSpy).toBeCalledWith('centerHUDButtons', Boolean, true, {
    onChange: expect.any(Function) as unknown,
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

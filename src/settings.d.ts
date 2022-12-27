declare global {
  namespace ClientSettings {
    interface Values {
      'illandril-token-hud-scale.effectIconsPerRow': number
      'illandril-token-hud-scale.effectIconsLayout': 'horizontal' | 'vertical' | 'above'
      'illandril-token-hud-scale.hudButtonScale': number
      'illandril-token-hud-scale.enableStaticSizedHUD': boolean
      'illandril-token-hud-scale.enableOneXOneHUD': boolean
      'illandril-token-hud-scale.enableStatusSelectorScale': boolean
      'illandril-token-hud-scale.darkenHUDButtonBG': boolean
      'illandril-token-hud-scale.centerHUDButtons': boolean
    }
  }
}

export {};

export const BUTTON_MODE_KEY = 'buttonMode';

// Indicators
const BASIC_BUTTON_MODE_INDICATOR = 'Basic';
export const ADVANCED_BUTTON_MODE_INDICATOR = 'Advanced';

// Basic group button modes
export const SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE = 'scrollToTopOnlyBasic';

// Advanced group button modes
export const SCROLL_TO_TOP_ONLY_ADVANCED_BUTTON_MODE = 'scrollToTopOnlyAdvanced';
export const FLIP_ADVANCED_BUTTON_MODE = 'flipBetweenTopBottomAdvanced';
export const DUAL_ARROWS_ADVANCED_BUTTON_MODE = 'dualArrowsAdvanced';

// Expert group button modes
export const SCROLL_TO_TOP_ONLY_EXPERT_BUTTON_MODE = 'off';
export const FLIP_EXPERT_BUTTON_MODE = 'flip';
export const DUAL_ARROWS_EXPERT_BUTTON_MODE = 'dual';
export const KEYBOARD_ONLY_EXPERT_BUTTON_MODE = 'keys';

// All button modes
export const AVAILABLE_BUTTON_MODES = [
  SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE,

  SCROLL_TO_TOP_ONLY_ADVANCED_BUTTON_MODE,
  FLIP_ADVANCED_BUTTON_MODE,
  DUAL_ARROWS_ADVANCED_BUTTON_MODE,

  SCROLL_TO_TOP_ONLY_EXPERT_BUTTON_MODE,
  FLIP_EXPERT_BUTTON_MODE,
  DUAL_ARROWS_EXPERT_BUTTON_MODE,
  KEYBOARD_ONLY_EXPERT_BUTTON_MODE,
];

export function isBasicButtonMode( mode ) {
  return isButtonMode( mode, BASIC_BUTTON_MODE_INDICATOR );
}

export function isAdvancedButtonMode( mode ) {
  return isButtonMode( mode, ADVANCED_BUTTON_MODE_INDICATOR );
}

export function isExpertButtonMode( mode ) {
  // @todo Handle a case when the value is non-supported (corrupted for some reason).
  return ! isBasicButtonMode( mode ) && ! isAdvancedButtonMode( mode );
}

function isButtonMode( mode, modeIndicator ) {
  return window.poziworldExtension.utils.isNonEmptyString( mode ) && mode.includes( modeIndicator );
}

export function getExpertModeReplacement( mode ) {
  let replacementMode;

  switch ( mode ) {
    case SCROLL_TO_TOP_ONLY_EXPERT_BUTTON_MODE:
    {
      replacementMode = SCROLL_TO_TOP_ONLY_ADVANCED_BUTTON_MODE;

      break;
    }
    case FLIP_EXPERT_BUTTON_MODE:
    {
      replacementMode = FLIP_ADVANCED_BUTTON_MODE;

      break;
    }
    case DUAL_ARROWS_EXPERT_BUTTON_MODE:
    {
      replacementMode = DUAL_ARROWS_ADVANCED_BUTTON_MODE;

      break;
    }
    default:
    {
      replacementMode = SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE;

      break;
    }
  }

  return replacementMode;
}

export function extractButtonMode( settings ) {
  return settings[ BUTTON_MODE_KEY ];
}

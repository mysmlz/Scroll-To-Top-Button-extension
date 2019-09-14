import buttonSettings from '../button/settings';
import * as keyboard from '../button/settings/keyboard';
import * as scrollActions from '../button/scroll-actions';

/**
 * If user selected one of the predefined keyboard shortcuts, set them up.
 */

export function setKeyboardShortcuts() {
  const keyboardShortcuts = buttonSettings.keyboardShortcuts;

  if ( keyboardShortcuts === keyboard.KEYBOARD_SHORTCUTS_ALT_UP_DOWN_ARROWS ) {
    shortcut.add( 'Alt+Down', scrollActions.scrollDown );
    shortcut.add( 'Alt+Up', scrollActions.scrollUp );
  }
  else if ( keyboardShortcuts === keyboard.KEYBOARD_SHORTCUTS_ALT_T_B ) {
    shortcut.add( 'Alt+B', scrollActions.scrollDown );
    shortcut.add( 'Alt+T', scrollActions.scrollUp );
  }

  if ( buttonSettings.homeEndKeysControlledBy === keyboard.HOME_END_KEYS_CONTROLLED_BY_STTB ) {
    const options = {
      disable_in_input: true,
    };

    shortcut.add( 'End', scrollActions.scrollDown, options );
    shortcut.add( 'Home', scrollActions.scrollUp, options );
  }
}

import './styles.css';

import * as i18n from 'Shared/i18n';
import * as settingsHelpers from 'Shared/settings';

import * as linksModule from 'Options/links';
import * as statusMessage from 'Options/status-message';

const dialog = document.getElementById( 'exportedSettingsDialog' );
const previewTextarea = document.getElementById( 'exportedSettingsPreviewText' );
const copyToClipboardCta = document.getElementById( 'exportedSettingsCopyToClipboardCta' );
const saveToFileCta = document.getElementById( 'exportedSettingsSaveToFileCta' );
const closeModalCta = dialog?.querySelector( '.pwCloseModalCta' );

let exportedSettings = null;

export async function init( settings ) {
  await ensureReadiness( settings );
  setExportedSettings( settings );
  showExportedSettings( settings );
  toggleListeners( {
    adding: true,
  } );
  statusMessage?.init( document.getElementById( 'exportedSettingsStatusText' ) );
  dialog?.showModal();
}

async function ensureReadiness( settings ) {
  if ( ! settingsHelpers.isExpectedFormat( settings ) ) {
    throw new TypeError( await i18n.getMessage( 'exportedSettingsNotOfExpectedFormat', [
      linksModule.getGenericContactFormLink(),
    ] ) );
  }

  if ( ! previewTextarea ) {
    throw new Error( await i18n.getMessage( 'exportedSettingsPreviewElementMissing', [
      linksModule.getGenericContactFormLink(),
    ] ) );
  }
}

function setExportedSettings( settings ) {
  const JSON_INDENTATION_SPACES_COUNT = 2;

  exportedSettings = JSON.stringify( settings, null, JSON_INDENTATION_SPACES_COUNT );
}

function getExportedSettings() {
  return exportedSettings;
}

function showExportedSettings( settings ) {
  const JSON_CURLY_BRACES_LINES_COUNT = 2;

  previewTextarea.textContent = getExportedSettings();
  previewTextarea.rows = Object.keys( settings ).length + JSON_CURLY_BRACES_LINES_COUNT;
}

function toggleListeners( { adding } ) {
  const method = adding ?
    'addEventListener' :
    'removeEventListener';

  copyToClipboardCta[ method ]( 'click', copyToClipboard );
  saveToFileCta[ method ]( 'click', saveToFile );
  closeModalCta[ method ]( 'click', deinit );
}

function copyToClipboard( event ) {
  attemptExport( {
    event,
    handler: () => window.navigator.clipboard?.writeText( getExportedSettings() ),
    successMessage: 'copiedToClipboard',
    errorMessage: 'copyingToClipboardFailed',
  } );
}

function saveToFile( event ) {
  attemptExport( {
    event,
    handler: () => download( 'my-scroll-to-top-button-settings.json', getExportedSettings() ),
    successMessage: 'savedToFile',
    errorMessage: 'savingToFileFailed',
  } );
}

function attemptExport( { event, handler, successMessage, errorMessage } ) {
  event?.preventDefault();

  try {
    handler();
    statusMessage.show( successMessage );
  }
  catch ( error ) {
    window.alert( errorMessage );
  }
}

function download( filename, contents ) {
  const temporaryLink = document.createElement( 'a' );

  temporaryLink.setAttribute( 'href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( contents ) );
  temporaryLink.setAttribute( 'download', filename );
  temporaryLink.setAttribute( 'hidden', true );
  new DocumentFragment().append( temporaryLink );
  temporaryLink.click();
  temporaryLink.remove();
}

function deinit( event ) {
  event?.preventDefault();
  dialog?.close();
  resetElements();
}

function resetElements() {
  toggleListeners( {
    adding: false,
  } );
  statusMessage?.hide();
  previewTextarea.selectionStart = previewTextarea.selectionEnd;
}

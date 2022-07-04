const legacyI18n = window.poziworldExtension.i18n;

export async function getMessage( key, substitutions ) {
  await legacyI18n.init();

  return legacyI18n.getMessage( key, substitutions );
}

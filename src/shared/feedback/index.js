import * as i18n from 'Shared/i18n';
import * as tabs from 'Shared/tabs';

const ISSUE_TITLE_PLACEHOLDER = '$ISSUE_TITLE$';
const FEEDBACK_TEXT_PLACEHOLDER = '$FEEDBACK_TEXT$';
const ISSUE_REPORTING_URL_WITH_PLACEHOLDERS = `https://docs.google.com/forms/d/e/1FAIpQLSf0LEXunDXcHaBNd8diJRkVFrZp4FwvbHh86xZTfieK2rHxKg/viewform?entry.1591633300=__other_option__&entry.1591633300.other_option_response=${ ISSUE_TITLE_PLACEHOLDER }&entry.326955045=${ FEEDBACK_TEXT_PLACEHOLDER }`;

export async function requestToReportIssue( issueMessageJsonKey, issueTitle, debuggingInformation ) {
  const debuggingInformationConfirmation = await i18n.getMessage( 'debuggingInformationConfirmation', [ debuggingInformation ] );
  const dialogMessage = await i18n.getMessage( issueMessageJsonKey, [ debuggingInformationConfirmation ] );

  if ( window.confirm( dialogMessage ) ) {
    tabs.createOrUpdate( generateIssueReportingUrl( issueTitle, debuggingInformation ) );
  }
}

function generateIssueReportingUrl( issueTitle, feedbackText ) {
  return ISSUE_REPORTING_URL_WITH_PLACEHOLDERS
    .replace( ISSUE_TITLE_PLACEHOLDER, window.encodeURIComponent( issueTitle ) )
    .replace( FEEDBACK_TEXT_PLACEHOLDER, window.encodeURIComponent( feedbackText ) );
}

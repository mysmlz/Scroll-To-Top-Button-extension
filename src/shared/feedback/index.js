import * as i18n from 'Shared/i18n';

export async function requestToReportIssue( issueMessageJsonKey, issueTitle, debuggingInformation ) {
  const debuggingInformationConfirmation = await i18n.getMessage( 'debuggingInformationConfirmation', [ debuggingInformation ] );
  const dialogMessage = await i18n.getMessage( issueMessageJsonKey, [ debuggingInformationConfirmation ] );
  // Prompting user for email for a follow-up
  let email = window.prompt( dialogMessage );

  if ( email !== null ) {
    reportIssue( issueTitle, debuggingInformation, email );
  }
}

function reportIssue( issueTitle, feedbackText, email ) {
  const form = document.createElement( 'form' );
  const feedbackTypeInput = document.createElement( 'input' );
  const feedbackTypeOtherInput = document.createElement( 'input' );
  const feedbackInput = document.createElement( 'textarea' );
  const emailInput = document.createElement( 'input' );

  form.method = 'post';
  form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSf0LEXunDXcHaBNd8diJRkVFrZp4FwvbHh86xZTfieK2rHxKg/formResponse';
  form.target = '_blank';

  feedbackTypeInput.name = 'entry.1591633300';
  feedbackTypeInput.value = '__other_option__';

  feedbackTypeOtherInput.name = 'entry.1591633300.other_option_response';
  feedbackTypeOtherInput.value = issueTitle;

  feedbackInput.name = 'entry.326955045';
  feedbackInput.value = feedbackText;

  emailInput.name = 'entry.879531967';
  emailInput.value = email;

  form.append( feedbackTypeInput );
  form.append( feedbackTypeOtherInput );
  form.append( feedbackInput );
  form.append( emailInput );
  document.body.append( form );

  form.submit();
}

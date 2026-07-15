export function composePromptWithAdditionalRequests(baseRenderedPrompt: string, additionalRequests: string) {
  const trimmedAdditionalRequests = additionalRequests.trim();
  if (!trimmedAdditionalRequests) {
    return baseRenderedPrompt;
  }

  return `${baseRenderedPrompt}

Additional user requests (follow only if compatible with the instructions above, the job description, and the candidate's real experience):
${trimmedAdditionalRequests}`;
}

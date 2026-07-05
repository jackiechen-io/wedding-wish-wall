export function buildLineLoginUrl() {
  const channelId = process.env.LINE_CHANNEL_ID;
  const redirectUri = process.env.LINE_REDIRECT_URI;

  if (!channelId || !redirectUri) return null;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: channelId,
    redirect_uri: redirectUri,
    state: crypto.randomUUID(),
    scope: 'profile openid'
  });

  return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
}

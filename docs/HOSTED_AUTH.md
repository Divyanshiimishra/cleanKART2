# Hosted GitHub authentication

The GitHub OAuth App and the deployed environment must use the same production
origin.

For a site hosted at `https://your-domain.example`, configure:

- GitHub OAuth App homepage URL: `https://your-domain.example`
- GitHub OAuth App authorization callback URL:
  `https://your-domain.example/api/auth/callback/github`
- Hosted `NEXTAUTH_URL`: `https://your-domain.example`
- Hosted secrets: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and
  `NEXTAUTH_SECRET`

Do not add a trailing slash to `NEXTAUTH_URL`. GitHub's callback URL must match
the URL sent by the application exactly, including protocol, host, path, and
port.

Use a separate GitHub OAuth App for local development:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL:
  `http://localhost:3000/api/auth/callback/github`

Preview deployment domains change frequently. Use the stable production domain
for OAuth, or create a separate OAuth App for a preview domain that needs login.
Never commit OAuth credentials or other secret values.

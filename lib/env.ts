export const env = {
  appId: process.env.GITHUB_APP_ID!,
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  privateKey: process.env.GITHUB_PRIVATE_KEY!,
  encryption_password: process.env.ENCRYPTION_PASSWORD!,
} as const

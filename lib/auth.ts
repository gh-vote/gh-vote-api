import {createAppAuth} from '@octokit/auth-app'
import {env} from './env'
import {Octokit} from '@octokit/rest'

// TODO: caching
export async function obtainToken() {
  const auth = createAppAuth({
    appId: env.appId,
    privateKey: env.privateKey,
    clientId: env.clientId,
    clientSecret: env.clientSecret,
  })
  const {token} = await auth({type: 'app'})
  return token
}

export async function installationId(owner: string, repository: string): Promise<number | undefined> {
  let api = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.appId,
      privateKey: env.privateKey,
      clientId: env.clientId,
      clientSecret: env.clientSecret
    }
  })
  try {
    const {data} = await api.apps.getRepoInstallation({owner: owner, repo: repository})
    return data.id
  } catch (err) {
    return undefined
  }
}

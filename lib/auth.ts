import {createAppAuth} from '@octokit/auth-app'
import {env} from './env'
import {Octokit} from '@octokit/rest'
import {connect, findCache, setCache} from './db'

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

export async function jwt(): Promise<number | undefined> {
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
    const data = await api.auth({type: 'app'}) as any
    return data.token
  } catch (err) {
    return undefined
  }
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

export async function authApp(owner: string, repository: string) {
  const db = connect()
  const cache = await findCache(db, owner, repository).then(r => r.data)
  // TODO: check if expired
  if (cache) {
    console.debug(`using cached token for ${owner}/${repository}, expires at ${cache.expires_at}`)
    return authByToken(cache.access_token)
  } else {
    let {instId, api} = await authByInstId(owner, repository)

    const {token, expiresAt} = await api.auth({
      type: 'installation',
      installationId: instId
    }) as any

    setCache(db, owner, repository, instId, token, expiresAt).then()
    console.debug(`cached token for ${owner}/${repository}`)

    return api
  }
}

async function authByInstId(owner: string, repository: string) {
  let instId = await installationId(owner as string, repository as string)
  if (!instId) {
    throw Error(`gh-vote is not installed in ${owner}/${repository}`)
  }
  const api = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.appId,
      privateKey: env.privateKey,
      installationId: instId
    }
  })
  return {instId, api}
}

async function authByToken(token: string) {
  return new Octokit({
    auth: token
  })
}

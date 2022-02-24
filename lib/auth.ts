import {createAppAuth} from '@octokit/auth-app'
import {env} from './env'
import {Octokit} from '@octokit/rest'
import {connect, findCache, setCache} from './db'
import {SupabaseClient} from '@supabase/supabase-js'

export async function authApp(owner: string, repository: string) {
  const db = connect()
  const cache = await findCache(db, owner, repository).then(r => r.data)
  if (cache) {
    if (new Date(cache.expires_at) > new Date()) {
      console.debug(`using cached token for ${owner}/${repository}, expires at ${cache.expires_at}`)
      return authByToken(cache.access_token)
    } else {
      console.debug(`cached token for ${owner}/${repository} is expired, obtaining the new one`)
      return authByInstId(db, owner, repository)
    }
  } else {
    return authByInstId(db, owner, repository)
  }
}

async function authByInstId(db: SupabaseClient, owner: string, repository: string) {
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

  const {token, expiresAt} = await api.auth({
    type: 'installation',
    installationId: instId
  }) as any

  setCache(db, owner, repository, instId, token, expiresAt).then()
  console.debug(`cached token for ${owner}/${repository}`)

  return api
}

async function authByToken(token: string) {
  return new Octokit({
    auth: token
  })
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

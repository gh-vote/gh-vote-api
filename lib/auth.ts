import {createAppAuth} from '@octokit/auth-app'
import {env} from './env'

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

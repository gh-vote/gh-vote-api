import type {NextApiRequest, NextApiResponse} from 'next'
import {encodeState} from '../../lib/state'
import {env} from '../../lib/env'
import {cors} from './cors'

const GITHUB_OAUTH_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'

export default async function authorize(req: NextApiRequest, res: NextApiResponse) {
    await cors(req, res)
    const appReturnUrl = req.query.redirect_uri as string

    if (!appReturnUrl) {
        res.status(400).json({error: '`redirect_uri` is required.'})
        return
    }

    const proto = req.headers['x-forwarded-proto'] || 'http'
    const redirect_uri = `${proto}://${req.headers.host}/api/authorized`
    const state = await encodeState(appReturnUrl, env.encryption_password!)

    const oauthParams = new URLSearchParams({client_id: env.client_id!, redirect_uri, state})
    let url = `${GITHUB_OAUTH_AUTHORIZE_URL}?${oauthParams}`
    res.json({url: url})
}

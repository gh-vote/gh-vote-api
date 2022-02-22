import type {NextApiRequest, NextApiResponse} from 'next'
import {env} from '../../lib/env'
import {decodeState, encodeState} from '../../lib/state'
import {cors} from './cors'

const GITHUB_OAUTH_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const TOKEN_VALIDITY_PERIOD = 1000 * 60 * 60 * 24 * 365

export default async function authorized(req: NextApiRequest, res: NextApiResponse) {
    await cors(req, res)

    console.log(req.query)

    const code = req.query.code as string
    const state = req.query.state as string
    const error = req.query.error as string

    let appReturnUrl: string
    try {
        appReturnUrl = await decodeState(state, env.encryption_password!)
    } catch (err: any) {
        res.status(400).json({error: err.message})
        return
    }

    const returnUrl = new URL(decodeURIComponent(appReturnUrl))

    if (error && error === 'access_denied') {
        res.redirect(302, returnUrl.href)
        return
    }

    if (!code || !state) {
        res.status(400).json({error: '`code` and `state` are required.'})
        return
    }

    const init = {
        method: 'POST',
        body: new URLSearchParams({
            client_id: env.client_id!,
            client_secret: env.client_secret!,
            code,
            state
        }),
        headers: {
            Accept: 'application/json',
            'User-Agent': 'gh-vote',
        },
    }

    let accessToken: string
    try {
        const response = await fetch(GITHUB_OAUTH_ACCESS_TOKEN_URL, init)
        if (response.ok) {
            const data = await response.json()
            accessToken = data.access_token
        } else {
            throw new Error(`Access token response had status ${response.status}.`)
        }
    } catch (err: any) {
        res.status(503).json({error: err.message})
        return
    }

    const session = await encodeState(
        accessToken,
        env.encryption_password!,
        Date.now() + TOKEN_VALIDITY_PERIOD,
    )
    returnUrl.searchParams.set('session', session)

    res.redirect(302, returnUrl.href)
}

import {NextApiRequest, NextApiResponse} from 'next'
import {env} from '../../lib/env'
import {decodeState} from '../../lib/state'
import {cors} from '../../lib/cors'

export interface TokenRequest {
    session: string;
}

export default async function token(req: NextApiRequest, res: NextApiResponse) {
    await cors(req, res)

    const {session} = req.body as TokenRequest
    if (!session) {
        res.status(400).json({error: 'Unable to parse request body.'})
        return
    }

    try {
        const token = await decodeState(session, env.encryption_password!)
        res.status(200).json({value: token})
    } catch (err: any) {
        res.status(400).json({error: err.message})
        return
    }
}

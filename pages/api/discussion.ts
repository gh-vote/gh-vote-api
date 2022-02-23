import {NextApiRequest, NextApiResponse} from 'next'
import {obtainToken} from '../../lib/auth'
import {cors} from '../../lib/cors'

export default async function token(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res)
  const token = await obtainToken()
  console.log({token})
  res.status(200).json({ok: 'ok'})
}

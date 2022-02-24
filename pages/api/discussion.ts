import {NextApiRequest, NextApiResponse} from 'next'
import {cors} from '../../lib/cors'
import {authApp} from '../../lib/auth'

// TODO: cache installationId/personalToken
export default async function discussion(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res)

  console.debug(req.query)
  const {repository, owner, discussionId} = req.query
  if (!repository || !owner || !discussionId) {
    res.status(400).send({message: 'required parameters: repository owner discussionId'})
  }

  try {
    const api = await authApp(owner as string, repository as string)

    const query = `
    query {
      repository(name: "${repository}", owner: "${owner}") {
        discussions(first: 100) {
          nodes {
            id
            title
            body
            category {
              id
              name
            }
            reactionGroups {
              content
              reactors {
                totalCount
              }
            }
          }
        }
      }
    }
  `

    const discussionData: any = await api.graphql(query)

    const ds = discussionData.repository.discussions.nodes
    const filtered = ds.filter((d: any) => d.id === discussionId)[0]
    !!filtered
      ? res.status(200).json(filtered)
      : res.status(404).json({message: 'not found'})

  } catch (err) {
    console.error(err)
    res.status(500).json({err})
  }

}

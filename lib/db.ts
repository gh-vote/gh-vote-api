import {createClient, SupabaseClient} from '@supabase/supabase-js'
import {env} from './env'

export function connect(): SupabaseClient {
  return createClient(env.dbUrl, env.dbKey)
}

export async function findCache(db: SupabaseClient, owner: string, repo: string): Promise<any> {
  return await db
    .from('cache')
    .select()
    .eq('repo_id', owner + '/' + repo)
    .maybeSingle()
}

export async function setCache(db: SupabaseClient, owner: string, repo: string, instId: number, token: string, expiresAt: string): Promise<any> {
  return db
    .from('cache')
    .insert([{
      repo_id: owner + '/' + repo,
      installation_id: instId,
      access_token: token,
      expires_at: expiresAt
    }])
}


import './load-env'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.BOOTSTRAP_ADMIN_EMAIL
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD

if (!url || !key || !email || !password) {
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

async function main() {
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'M2M Owner' },
  })
  if (error && !error.message.includes('already')) {
    throw error
  }
  const userId = created?.user?.id
  if (userId) {
    await supabase.from('profiles').upsert({
      id: userId,
      full_name: 'M2M Owner',
      email,
      role: 'owner',
      approval_status: 'approved',
    })
    console.log('Created owner admin:', email)
  } else {
    const { data: list } = await supabase.auth.admin.listUsers()
    const user = list.users.find((u) => u.email === email)
    if (user) {
      await supabase
        .from('profiles')
        .update({ role: 'owner', approval_status: 'approved', email })
        .eq('id', user.id)
      console.log('Promoted existing user to owner:', email)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

import { randomBytes } from 'node:crypto'
import { argon2id } from 'hash-wasm'

const password = process.argv[2] ?? process.env.ADMIN_PASSWORD
const pepper = process.env.ADMIN_PEPPER

if (!password) {
  console.error('Usage: ADMIN_PEPPER="<pepper>" node scripts/generate-argon2id-hash.mjs "<password>"')
  process.exit(1)
}

if (!pepper) {
  console.error('Missing ADMIN_PEPPER. Generate one first, then keep it in Workers Secrets.')
  process.exit(1)
}

const hash = await argon2id({
  password: `${password}${pepper}`,
  salt: randomBytes(16),
  parallelism: 1,
  iterations: 3,
  memorySize: 65536,
  hashLength: 32,
  outputType: 'encoded',
})

console.log(hash)

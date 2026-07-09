import { createHash } from 'node:crypto'

const password = process.argv.slice(2).join(' ')

if (!password) {
  console.error('Usage: node scripts/generate-pseudo-admin-hash.mjs "<password>"')
  process.exit(1)
}

console.log(createHash('sha256').update(password).digest('hex'))

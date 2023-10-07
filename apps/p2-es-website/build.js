import { promises as fs } from 'fs'

console.log('Building p2-es-website')

console.log('Creating dist directories...')

await fs.mkdir('./dist/docs')
await fs.mkdir('./dist/examples')
await fs.mkdir('./dist/demos')

console.log('Copying files from p2-es-docs, p2-es-examples, p2-es-demos...')

await fs.cp('../p2-es-docs/dist', './dist/docs', { recursive: true })
await fs.cp('../p2-es-examples/dist', './dist/examples', { recursive: true })
await fs.cp('../p2-es-demos/dist', './dist/demos', { recursive: true })

console.log('Done!')

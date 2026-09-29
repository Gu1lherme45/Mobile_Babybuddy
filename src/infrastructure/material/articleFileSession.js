import { loadArticleFile, releaseArticleFile } from './articleFile'

// A screen owns a session; actions retain it until the system dialog finishes.
export function createArticleFileSession(material) {
  let file, pending, disposed = false, users = 0
  const cleanup = () => {
    if (disposed && users === 0 && file) {
      const stale = file
      file = null
      releaseArticleFile(stale)
    }
  }
  return {
    async get() {
      if (disposed) throw new Error('Este artigo foi fechado.')
      if (file) return file
      if (!pending) pending = loadArticleFile(material).then(value => {
        file = value
        cleanup()
        return value
      }).finally(() => { pending = null })
      return pending
    },
    async use(action) {
      users++
      try { return await action(await this.get()) }
      finally { users--; cleanup() }
    },
    dispose() { disposed = true; cleanup() },
  }
}

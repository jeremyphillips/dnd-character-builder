import { useEffect, useState } from 'react'

interface Character {
  _id: string
  name: string
  race: string
  class: string
  level: number
}

export default function CharactersRoute() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchCharacters()
  }, [])

  async function fetchCharacters() {
    try {
      const res = await fetch('/api/characters', { credentials: 'include' })
      const data = await res.json()
      setCharacters(data.characters ?? [])
    } catch {
      setCharacters([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    const name = prompt('Character name:')
    if (!name) return

    setCreating(true)
    try {
      await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })
      await fetchCharacters()
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <p>Loading characters...</p>

  return (
    <div>
      <div className="page-header">
        <h1>My Characters</h1>
        <button onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : '+ New Character'}
        </button>
      </div>

      {characters.length === 0 ? (
        <p className="empty-state">No characters yet. Create your first one!</p>
      ) : (
        <div className="item-list">
          {characters.map((c) => (
            <div key={c._id} className="item-card">
              <div className="item-card-info">
                <strong>{c.name}</strong>
                <span>
                  {[c.race, c.class, c.level ? `Lvl ${c.level}` : ''].filter(Boolean).join(' · ') || 'No details'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

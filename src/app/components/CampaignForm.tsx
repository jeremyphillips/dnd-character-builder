import { useEffect, useState } from 'react'
import { editions, settings } from '@/data'

export interface CampaignFormData {
  name: string
  edition: string
  setting: string
}

export default function CampaignForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  submittingLabel,
}: {
  initial: CampaignFormData
  onSubmit: (data: CampaignFormData) => Promise<void>
  onCancel: () => void
  submitLabel: string
  submittingLabel: string
}) {
  const [name, setName] = useState(initial.name)
  const [edition, setEdition] = useState(initial.edition)
  const [setting, setSetting] = useState(initial.setting)
  const [submitting, setSubmitting] = useState(false)

  const selectedEdition = editions.find(e => e.id === edition)
  const availableSettings = selectedEdition
    ? selectedEdition.campaigns
        .map(id => settings.find(s => s.id === id))
        .filter(Boolean)
    : []

  // Reset setting when edition changes (only if edition actually changed from initial)
  useEffect(() => {
    if (edition !== initial.edition) {
      setSetting('')
    }
  }, [edition, initial.edition])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !edition || !setting) return

    setSubmitting(true)
    try {
      await onSubmit({ name, edition, setting })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="create-form">
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Campaign name"
          required
          autoFocus
        />
      </label>

      <label>
        Edition
        <select
          value={edition}
          onChange={e => setEdition(e.target.value)}
          required
        >
          <option value="">Select edition…</option>
          {editions.map(ed => (
            <option key={ed.id} value={ed.id}>{ed.name}</option>
          ))}
        </select>
      </label>

      <label>
        Setting
        <select
          value={setting}
          onChange={e => setSetting(e.target.value)}
          required
          disabled={!edition}
        >
          <option value="">
            {edition ? 'Select setting…' : 'Choose an edition first'}
          </option>
          {availableSettings.map(s => (
            <option key={s!.id} value={s!.id}>{s!.name}</option>
          ))}
        </select>
      </label>

      <div className="form-actions">
        <button type="submit" disabled={submitting || !name || !edition || !setting}>
          {submitting ? submittingLabel : submitLabel}
        </button>
        <button type="button" className="btn-theme-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

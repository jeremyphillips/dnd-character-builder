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
  canEdit = true,
}: {
  initial: CampaignFormData
  onSubmit: (data: CampaignFormData) => Promise<void>
  onCancel: () => void
  submitLabel: string
  submittingLabel: string
  /** When false, fields are read-only and form actions are hidden. */
  canEdit?: boolean
}) {
  const [name, setName] = useState(initial.name)
  const [edition, setEdition] = useState(initial.edition)
  const [setting, setSetting] = useState(initial.setting)
  const [submitting, setSubmitting] = useState(false)

  const selectedEdition = editions.find(e => e.id === edition)
  const availableSettings = selectedEdition
    ? selectedEdition.settings
        .map((id: string) => settings.find(s => s.id === id))
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
    } catch (err) {
      console.error('Campaign form submit error:', err)
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
          disabled={!canEdit}
          readOnly={!canEdit}
        />
      </label>

      <label>
        Edition
        <select
          value={edition}
          onChange={e => setEdition(e.target.value)}
          required
          disabled={!canEdit}
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
          disabled={!edition || !canEdit}
        >
          <option value="">
            {edition ? 'Select setting…' : 'Choose an edition first'}
          </option>
          {availableSettings.map(s => (
            <option key={s!.id} value={s!.id}>{s!.name}</option>
          ))}
        </select>
      </label>

      {canEdit && (
        <div className="form-actions">
          <button type="submit" disabled={submitting || !name || !edition || !setting}>
            {submitting ? submittingLabel : submitLabel}
          </button>
          <button type="button" className="btn-theme-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </form>
  )
}

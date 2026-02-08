import { useEffect } from 'react'

/**
 * Auto-select the value if there is only one option available.
 *
 * @param options - array of objects with `id` property
 * @param selected - currently selected id
 * @param setSelected - setter function to update selection
 */
const useAutoSelect = <T extends { id: string }>(
  options: T[],
  selected: string | undefined,
  setSelected: (id: string) => void
) => {
  useEffect(() => {
    if (options.length === 1 && selected !== options[0].id) {
      setSelected(options[0].id)
    }
  }, [options, selected, setSelected])
}

export default useAutoSelect
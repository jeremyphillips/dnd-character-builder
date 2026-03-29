import Box from '@mui/material/Box'
import { makeGridCellId } from '@/shared/domain/grid'

export type GridCell = {
  cellId: string
  x: number
  y: number
}

export type GridEditorProps = {
  columns: number
  rows: number
  selectedCellId?: string | null
  onCellClick?: (cell: GridCell) => void
  getCellLabel?: (cell: GridCell) => string | undefined
  getCellClassName?: (cell: GridCell) => string | undefined
  className?: string
  disabled?: boolean
}

export default function GridEditor({
  columns,
  rows,
  selectedCellId,
  onCellClick,
  getCellLabel,
  getCellClassName,
  className,
  disabled,
}: GridEditorProps) {
  const safeCols = Math.max(0, Math.floor(columns))
  const safeRows = Math.max(0, Math.floor(rows))

  return (
    <Box
      className={className}
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${safeCols}, minmax(0, 1fr))`,
        gap: 0.5,
        width: '100%',
        maxWidth: '100%',
      }}
      role="grid"
      aria-colcount={safeCols}
      aria-rowcount={safeRows}
    >
      {Array.from({ length: safeRows * safeCols }, (_, i) => {
        const x = i % safeCols
        const y = Math.floor(i / safeCols)
        const cellId = makeGridCellId(x, y)
        const cell: GridCell = { cellId, x, y }
        const label = getCellLabel?.(cell)
        const extraClass = getCellClassName?.(cell)
        const selected = selectedCellId != null && selectedCellId === cellId

        return (
          <Box
            key={cellId}
            component="button"
            type="button"
            role="gridcell"
            aria-selected={selected}
            disabled={disabled}
            onClick={() => !disabled && onCellClick?.(cell)}
            className={extraClass}
            sx={{
              aspectRatio: '1',
              minWidth: 0,
              minHeight: 0,
              border: 1,
              borderColor: 'divider',
              borderRadius: 0.5,
              bgcolor: selected ? 'action.selected' : 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.25,
              cursor: disabled ? 'default' : 'pointer',
              fontSize: '0.65rem',
              lineHeight: 1.2,
              color: 'text.primary',
              '&:hover': disabled
                ? undefined
                : {
                    bgcolor: selected ? 'action.selected' : 'action.hover',
                  },
            }}
          >
            {label != null && label !== '' ? (
              <Box component="span" sx={{ px: 0.25, textAlign: 'center', wordBreak: 'break-word' }}>
                {label}
              </Box>
            ) : null}
          </Box>
        )
      })}
    </Box>
  )
}

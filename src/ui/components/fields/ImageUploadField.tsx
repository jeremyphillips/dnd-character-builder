import { useState, useCallback, useRef } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import ImageIcon from '@mui/icons-material/Image'

import { Lightbox } from '@/ui/elements'

interface ImageUploadFieldProps {
  /** Current image URL (local or remote) */
  value?: string | null
  /** Called with the uploaded URL from the server */
  onChange: (url: string | null) => void
  /** Label shown above the field */
  label?: string
  /** Whether the user can interact with the field */
  disabled?: boolean
  /** Max height for the image preview */
  maxHeight?: number
}

/**
 * Reusable drag-and-drop image upload field.
 *
 * - No image: shows drag-and-drop upload zone
 * - Has image: shows preview with Replace / Remove buttons
 * - Click image: opens full-size lightbox modal
 */
export default function ImageUploadField({
  value,
  onChange,
  label = 'Image',
  disabled = false,
  maxHeight = 280,
}: ImageUploadFieldProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          credentials: 'include',
          body: file,
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          console.error('Upload failed:', body.error)
          return
        }
        const data = await res.json()
        onChange(data.url)
      } catch (err) {
        console.error('Upload error:', err)
      } finally {
        setUploading(false)
      }
    },
    [onChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setDragActive(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (disabled) return
      const file = Array.from(e.dataTransfer.files).find((f) =>
        f.type.startsWith('image/')
      )
      if (file) uploadFile(file)
    },
    [disabled, uploadFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) uploadFile(file)
      e.target.value = ''
    },
    [uploadFile]
  )

  // ── Has image ──────────────────────────────────────────────────────────
  if (value) {
    return (
      <Box>
        {label && (
          <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {label}
          </Typography>
        )}

        {/* Clickable image preview */}
        <Box
          component="img"
          src={value}
          alt={label}
          onClick={() => setLightboxOpen(true)}
          sx={{
            width: '100%',
            maxHeight,
            objectFit: 'contain',
            borderRadius: 1,
            border: '1px solid var(--mui-palette-divider)',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
            '&:hover': { opacity: 0.85 },
          }}
        />

        {/* Replace / Remove buttons */}
        {!disabled && (
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onChange(null)}
            >
              Remove
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </Box>
        )}

        {/* Lightbox modal */}
        <Lightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          src={value}
          alt={label}
        />
      </Box>
    )
  }

  // ── No image: upload zone ──────────────────────────────────────────────
  return (
    <Box>
      {label && (
        <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          {label}
        </Typography>
      )}
      <Card
        variant="outlined"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : () => fileInputRef.current?.click()}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          cursor: disabled ? 'default' : 'pointer',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: dragActive
            ? 'var(--mui-palette-primary-main)'
            : 'var(--mui-palette-divider)',
          bgcolor: dragActive
            ? 'var(--mui-palette-primary-main)14'
            : 'transparent',
          transition: 'border-color 0.2s, background-color 0.2s',
          ...(!disabled && {
            '&:hover': {
              borderColor: 'var(--mui-palette-primary-light)',
              bgcolor: 'var(--mui-palette-action-hover)',
            },
          }),
        }}
      >
        {uploading ? (
          <CircularProgress size={36} />
        ) : (
          <>
            {dragActive ? (
              <CloudUploadIcon sx={{ fontSize: 40, color: 'var(--mui-palette-primary-main)' }} />
            ) : (
              <ImageIcon sx={{ fontSize: 40, color: 'var(--mui-palette-text-secondary)' }} />
            )}
            {!disabled ? (
              <>
                <Typography variant="body2" fontWeight={600}>
                  {dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PNG, JPG, WEBP supported
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No image uploaded.
              </Typography>
            )}
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Card>
    </Box>
  )
}

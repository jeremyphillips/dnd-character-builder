import Typography from '@mui/material/Typography';

type LocationMapEditorTraySectionHeadingProps = {
  label: string;
  /** Extra top padding when not the first section in the tray. */
  padTop?: boolean;
};

/**
 * Category / section label for grouped palette rows (e.g. placed-object palette categories).
 */
export function LocationMapEditorTraySectionHeading({
  label,
  padTop = false,
}: LocationMapEditorTraySectionHeadingProps) {
  return (
    <Typography
      component="div"
      variant="caption"
      sx={{
        alignSelf: 'stretch',
        textAlign: 'center',
        color: 'text.secondary',
        fontSize: 10,
        fontWeight: 600,
        lineHeight: 1.2,
        pt: padTop ? 0.75 : 0,
        px: 0.25,
      }}
    >
      {label}
    </Typography>
  );
}

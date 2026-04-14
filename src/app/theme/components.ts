import type { Components, Theme } from '@mui/material/styles'

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 20px',
        fontSize: '0.875rem',
      },
      sizeLarge: {
        padding: '12px 28px',
        fontSize: '1rem',
      },
      sizeSmall: {
        padding: '4px 12px',
        fontSize: '0.8rem',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'small',
    },
  },
  /** Match default `TextField` / `Select` medium density (~56px outlined control). */
  MuiSelect: {
    defaultProps: {
      size: 'medium',
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ ownerState }) => {
        if (ownerState.multiline || ownerState.size === 'small') {
          return {};
        }
        return { minHeight: 56 };
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '2px 8px',
        '&.Mui-selected': {
          fontWeight: 600,
        },
      },
    },
  },
}

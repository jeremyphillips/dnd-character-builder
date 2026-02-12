import type { PaletteOptions } from '@mui/material/styles'

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#8B0000',       // Deep Red — dragon fire, war banners
    light: '#B33030',
    dark: '#5C0000',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#D4AF37',       // Gold — treasure, divine light
    light: '#E0C566',
    dark: '#A68A2B',
    contrastText: '#1A1A1A',
  },
  background: {
    default: '#F5F0E8',    // Parchment
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
}

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#C04040',       // Ember Red — softer in the dark
    light: '#E06060',
    dark: '#8B0000',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#D4AF37',       // Gold stays consistent
    light: '#E0C566',
    dark: '#A68A2B',
    contrastText: '#1A1A1A',
  },
  background: {
    default: '#121212',    // Deep dungeon black
    paper: '#1E1E1E',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.60)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
}

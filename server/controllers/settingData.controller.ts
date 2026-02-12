import type { Request, Response } from 'express'
import * as settingDataService from '../services/settingData.service'

// GET /api/setting-data/:settingId
export async function getSettingData(req: Request, res: Response) {
  try {
    const { settingId } = req.params
    const data = await settingDataService.getSettingData(settingId)

    res.json({
      worldMapUrl: data?.worldMapUrl ?? null,
      customLocations: data?.customLocations ?? [],
      locationOverrides: data?.locationOverrides ?? {},
    })
  } catch (err) {
    console.error('Failed to get setting data:', err)
    res.status(500).json({ error: 'Failed to load setting data' })
  }
}

// PATCH /api/setting-data/:settingId/world-map
export async function updateWorldMap(req: Request, res: Response) {
  try {
    const { settingId } = req.params
    const { worldMapUrl } = req.body

    await settingDataService.updateWorldMapUrl(settingId, worldMapUrl ?? null)
    res.json({ worldMapUrl: worldMapUrl ?? null })
  } catch (err) {
    console.error('Failed to update world map:', err)
    res.status(500).json({ error: 'Failed to update world map' })
  }
}

// POST /api/setting-data/:settingId/locations
export async function createLocation(req: Request, res: Response) {
  try {
    const { settingId } = req.params
    const location = req.body

    if (!location.id || !location.name) {
      res.status(400).json({ error: 'Location id and name are required' })
      return
    }

    await settingDataService.addCustomLocation(settingId, {
      ...location,
      settingId,
      isCustom: true,
    })

    res.status(201).json({ location })
  } catch (err) {
    console.error('Failed to create location:', err)
    res.status(500).json({ error: 'Failed to create location' })
  }
}

// PATCH /api/setting-data/:settingId/locations/:locationId
export async function updateLocation(req: Request, res: Response) {
  try {
    const { settingId, locationId } = req.params
    const updates = req.body
    const isCustom = updates.isCustom

    if (isCustom) {
      await settingDataService.updateCustomLocation(settingId, locationId, updates)
    } else {
      // For data-defined locations, store as an override
      await settingDataService.setLocationOverride(settingId, locationId, updates)
    }

    res.json({ message: 'Location updated' })
  } catch (err) {
    console.error('Failed to update location:', err)
    res.status(500).json({ error: 'Failed to update location' })
  }
}

// DELETE /api/setting-data/:settingId/locations/:locationId
export async function deleteLocation(req: Request, res: Response) {
  try {
    const { settingId, locationId } = req.params
    await settingDataService.deleteCustomLocation(settingId, locationId)
    res.json({ message: 'Location deleted' })
  } catch (err) {
    console.error('Failed to delete location:', err)
    res.status(500).json({ error: 'Failed to delete location' })
  }
}

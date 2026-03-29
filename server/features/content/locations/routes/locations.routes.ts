import { Router } from 'express';
import { requireCampaignOwner } from '../../../../shared/middleware/requireCampaignRole';
import { asyncHandler } from '../../../../shared/middleware/asyncHandler';
import {
  listLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  listLocationMaps,
  createLocationMap,
  listMapTransitions,
  createMapTransition,
} from '../controllers/locations.controller';

const locationsRouter = Router({ mergeParams: true });

locationsRouter.get('/', asyncHandler(listLocations));
locationsRouter.post('/', requireCampaignOwner(), asyncHandler(createLocation));
locationsRouter.get('/:locationId', asyncHandler(getLocation));
locationsRouter.patch('/:locationId', requireCampaignOwner(), asyncHandler(updateLocation));
locationsRouter.delete('/:locationId', requireCampaignOwner(), asyncHandler(deleteLocation));

locationsRouter.get('/:locationId/maps', asyncHandler(listLocationMaps));
locationsRouter.post('/:locationId/maps', requireCampaignOwner(), asyncHandler(createLocationMap));

const locationMapTransitionsRouter = Router({ mergeParams: true });
locationMapTransitionsRouter.get('/transitions', asyncHandler(listMapTransitions));
locationMapTransitionsRouter.post('/transitions', requireCampaignOwner(), asyncHandler(createMapTransition));

export default locationsRouter;
export { locationMapTransitionsRouter };

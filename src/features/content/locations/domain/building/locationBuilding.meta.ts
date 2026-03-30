import type {
  LocationBuildingFunctionId,
  LocationBuildingPrimarySubtypeId,
  LocationBuildingPrimaryTypeId,
} from './locationBuilding.types';

export type LocationBuildingPrimaryTypeMeta = {
  label: string;
  description?: string;
};

export type LocationBuildingPrimarySubtypeMeta = {
  label: string;
  description?: string;
};

export type LocationBuildingFunctionMeta = {
  label: string;
  description?: string;
};

export const LOCATION_BUILDING_PRIMARY_TYPE_META = {
  residence: {
    label: 'Residence',
    description: 'Primarily living quarters.',
  },
  business: {
    label: 'Business',
    description: 'Commerce, retail, or services.',
  },
  temple: {
    label: 'Temple',
    description: 'Sacred or religious structure.',
  },
  civic: {
    label: 'Civic',
    description: 'Government, public works, or community space.',
  },
  industrial: {
    label: 'Industrial',
    description: 'Production, workshops, or storage at scale.',
  },
  military: {
    label: 'Military',
    description: 'Fortification, barracks, or guard posts.',
  },
  hospitality: {
    label: 'Hospitality',
    description: 'Lodging, food, drink, or entertainment venues.',
  },
  guild: {
    label: 'Guild',
    description: 'Guild hall or organized craft body.',
  },
  other: {
    label: 'Other',
    description: 'Does not fit the categories above.',
  },
} as const satisfies Record<LocationBuildingPrimaryTypeId, LocationBuildingPrimaryTypeMeta>;

export const LOCATION_BUILDING_PRIMARY_SUBTYPE_META = {
  house: { label: 'House', description: 'Single dwelling.' },
  manor: { label: 'Manor', description: 'Large estate or noble residence.' },
  apartment: { label: 'Apartment', description: 'Shared or multi-unit housing.' },
  blacksmith: { label: 'Blacksmith', description: 'Forge and metalwork.' },
  apothecary: { label: 'Apothecary', description: 'Herbs, medicine, and alchemy supplies.' },
  'general-store': { label: 'General store', description: 'Broad retail goods.' },
  bakery: { label: 'Bakery', description: 'Bread and baked goods.' },
  workshop: { label: 'Workshop', description: 'Craft or repair space.' },
  warehouse: { label: 'Warehouse', description: 'Bulk storage and logistics.' },
  tavern: { label: 'Tavern', description: 'Drinks and light fare; social hub.' },
  inn: { label: 'Inn', description: 'Lodging and meals for travelers.' },
  brothel: { label: 'Brothel', description: 'Adult entertainment establishment.' },
  shrine: { label: 'Shrine', description: 'Small sacred site.' },
  temple: { label: 'Temple', description: 'Dedicated place of worship.' },
  cathedral: { label: 'Cathedral', description: 'Major religious seat.' },
  'town-hall': { label: 'Town hall', description: 'Civic administration and assembly.' },
  'guard-post': { label: 'Guard post', description: 'Watch, patrol, or small garrison.' },
  'guild-house': { label: 'Guild house', description: 'Guild headquarters or meeting hall.' },
  other: { label: 'Other', description: 'Custom or uncategorized subtype.' },
} as const satisfies Record<LocationBuildingPrimarySubtypeId, LocationBuildingPrimarySubtypeMeta>;

export const LOCATION_BUILDING_FUNCTION_META = {
  lodging: { label: 'Lodging', description: 'Rooms or beds for overnight stays.' },
  'food-drink': { label: 'Food & drink', description: 'Prepared meals, drink service, or a kitchen.' },
  trade: { label: 'Trade', description: 'Buying and selling goods or services.' },
  craft: { label: 'Craft', description: 'Making or repairing goods by hand.' },
  worship: { label: 'Worship', description: 'Religious rites or prayer.' },
  administration: { label: 'Administration', description: 'Records, permits, or governance.' },
  storage: { label: 'Storage', description: 'Warehousing or stockpiling.' },
  security: { label: 'Security', description: 'Guards, watch, or enforcement.' },
  'guild-activity': { label: 'Guild activity', description: 'Guild business, training, or meetings.' },
  entertainment: { label: 'Entertainment', description: 'Performance, games, or leisure.' },
  residential: { label: 'Residential', description: 'Living space for occupants.' },
  manufacturing: { label: 'Manufacturing', description: 'Production at scale or industry.' },
  healing: { label: 'Healing', description: 'Medical care or divine healing.' },
  education: { label: 'Education', description: 'Teaching, training, or libraries.' },
  'hospitality-service': {
    label: 'Hospitality service',
    description: 'Guest-facing service beyond lodging alone.',
  },
  other: { label: 'Other', description: 'Additional or custom function.' },
} as const satisfies Record<LocationBuildingFunctionId, LocationBuildingFunctionMeta>;

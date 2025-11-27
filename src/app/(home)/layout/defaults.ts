import { CARD_SPACING } from '@/consts'

export const CARD_IDS = ['hi-card', 'art-card', 'clock-card', 'calendar-card', 'music-card', 'share-card', 'article-card', 'nav-card'] as const

export type CardId = (typeof CARD_IDS)[number]

export type LayoutOverride = {
	offsetX?: number
	offsetY?: number
	width?: number
	height?: number
	order?: number
}

export type LayoutConfigPayload = {
	overrides: Partial<Record<CardId, LayoutOverride>>
}

type LayoutDefaults = Record<
	CardId,
	{
		offsetX: number
		offsetY: number
		width: number
		height?: number
		order: number
	}
>

const HI_WIDTH = 360
const HI_HEIGHT = 288
const HI_HALF_WIDTH = HI_WIDTH / 2
const HI_HALF_HEIGHT = HI_HEIGHT / 2

const CLOCK_HEIGHT = 132
const CLOCK_OFFSET = 92
const CALENDAR_HEIGHT = 286
const SOCIAL_WIDTH = 315
const SOCIAL_HEIGHT = 48

export const CARD_DEFAULTS: LayoutDefaults = {
	'hi-card': {
		width: HI_WIDTH,
		height: HI_HEIGHT,
		order: 1,
		offsetX: 0,
		offsetY: 0
	},
	'art-card': {
		width: 360,
		height: 200,
		order: 3,
		offsetX: 0,
		offsetY: -(HI_HALF_HEIGHT + 100 + CARD_SPACING)
	},
	'clock-card': {
		width: 232,
		height: CLOCK_HEIGHT,
		order: 4,
		offsetX: HI_HALF_WIDTH + CARD_SPACING,
		offsetY: -(CLOCK_OFFSET + CLOCK_HEIGHT)
	},
	'calendar-card': {
		width: 350,
		height: CALENDAR_HEIGHT,
		order: 5,
		offsetX: HI_HALF_WIDTH + CARD_SPACING,
		offsetY: -CLOCK_OFFSET + CARD_SPACING
	},
	'music-card': {
		width: 293,
		height: 66,
		order: 6,
		offsetX: HI_HALF_WIDTH + CARD_SPACING - 120,
		offsetY: -CLOCK_OFFSET + CARD_SPACING + CALENDAR_HEIGHT + CARD_SPACING
	},
	'share-card': {
		width: 200,
		order: 7,
		offsetX: HI_HALF_WIDTH - SOCIAL_WIDTH,
		offsetY: HI_HALF_HEIGHT + CARD_SPACING + SOCIAL_HEIGHT + CARD_SPACING
	},
	'article-card': {
		width: 266,
		order: 8,
		offsetX: HI_HALF_WIDTH - SOCIAL_WIDTH - CARD_SPACING - 266,
		offsetY: HI_HALF_HEIGHT + CARD_SPACING
	},
	'nav-card': {
		width: 280,
		height: 434,
		order: 2,
		offsetX: -HI_HALF_WIDTH - 280 - CARD_SPACING,
		offsetY: HI_HALF_HEIGHT - 434
	}
}


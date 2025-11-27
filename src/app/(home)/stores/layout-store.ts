'use client'

import { create } from 'zustand'
import layoutConfig from '../layout-config.json'
import { CARD_DEFAULTS, type CardId, type LayoutConfigPayload, type LayoutOverride } from '../layout/defaults'

type LayoutOverrides = Partial<Record<CardId, LayoutOverride>>

interface LayoutStore {
	overrides: LayoutOverrides
	savedOverrides: LayoutOverrides
	backupOverrides: LayoutOverrides | null
	isEditMode: boolean
	enterEditMode: () => void
	cancelEditing: () => void
	previewEditing: () => void
	updateOverride: (cardId: CardId, values: Partial<LayoutOverride>) => void
	setSavedOverrides: (next: LayoutOverrides) => void
	getPayload: () => LayoutConfigPayload
	hasChanges: () => boolean
}

const cloneOverrides = (source: LayoutOverrides): LayoutOverrides => JSON.parse(JSON.stringify(source || {}))

const pruneOverride = (cardId: CardId, override: LayoutOverride | undefined): LayoutOverride | undefined => {
	if (!override) return undefined
	const defaults = CARD_DEFAULTS[cardId]
	const cleaned: LayoutOverride = {}

	;(['offsetX', 'offsetY', 'width', 'height', 'order'] as const).forEach(key => {
		const value = override[key]
		if (value === undefined || (defaults as any)[key] === value) return
		cleaned[key] = Number(value)
	})

	return Object.keys(cleaned).length ? cleaned : undefined
}

const buildOverrides = (): LayoutOverrides => {
	const initial = (layoutConfig?.overrides ?? {}) as LayoutOverrides
	return cloneOverrides(initial)
}

const isSameOverrides = (a: LayoutOverrides, b: LayoutOverrides): boolean => JSON.stringify(a) === JSON.stringify(b)

export const useHomeLayoutStore = create<LayoutStore>((set, get) => ({
	overrides: buildOverrides(),
	savedOverrides: buildOverrides(),
	backupOverrides: null,
	isEditMode: false,
	enterEditMode: () => {
		if (get().isEditMode) return
		set(state => ({
			isEditMode: true,
			backupOverrides: cloneOverrides(state.overrides)
		}))
	},
	cancelEditing: () => {
		const backup = get().backupOverrides
		set(state => ({
			isEditMode: false,
			backupOverrides: null,
			overrides: cloneOverrides(backup ?? state.savedOverrides)
		}))
	},
	previewEditing: () => {
		set({ isEditMode: false, backupOverrides: null })
	},
	updateOverride: (cardId, values) => {
		set(state => {
			const next = { ...(state.overrides[cardId] ?? {}), ...values }
			const cleaned = pruneOverride(cardId, next)
			const overrides = { ...state.overrides }
			if (cleaned) overrides[cardId] = cleaned
			else delete overrides[cardId]
			return { overrides }
		})
	},
	setSavedOverrides: next => {
		set({
			savedOverrides: cloneOverrides(next),
			overrides: cloneOverrides(next)
		})
	},
	getPayload: () => ({
		overrides: cloneOverrides(get().overrides)
	}),
	hasChanges: () => !isSameOverrides(get().overrides, get().savedOverrides)
}))


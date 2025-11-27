'use client'

import { useMemo } from 'react'
import { useCenterStore } from '@/hooks/use-center'
import { CARD_DEFAULTS, type CardId } from '../layout/defaults'
import { useHomeLayoutStore } from '../stores/layout-store'

export function useCardLayout(cardId: CardId) {
	const center = useCenterStore()
	const override = useHomeLayoutStore(state => state.overrides[cardId])

	const layout = useMemo(() => {
		const defaults = CARD_DEFAULTS[cardId]
		const width = override?.width ?? defaults.width
		const height = override?.height ?? defaults.height
		const offsetX = override?.offsetX ?? defaults.offsetX
		const offsetY = override?.offsetY ?? defaults.offsetY
		const order = override?.order ?? defaults.order

		return {
			width,
			height,
			order,
			offsetX,
			offsetY,
			x: center.x + offsetX,
			y: center.y + offsetY
		}
	}, [cardId, center.x, center.y, override])

	return layout
}


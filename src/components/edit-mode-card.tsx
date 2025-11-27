'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { useHomeLayoutStore } from '@/app/(home)/stores/layout-store'
import type { CardId } from '@/app/(home)/layout/defaults'

interface EditModeCardProps {
	cardId: CardId
	className?: string
	children: React.ReactNode
	width: number
	height?: number
	offsetX: number
	offsetY: number
	order: number
	x: number
	y: number
}

type DragContext =
	| {
			type: 'move'
			startX: number
			startY: number
			baseOffsetX: number
			baseOffsetY: number
	  }
	| {
			type: 'resize'
			startX: number
			startY: number
			baseWidth: number
			baseHeight: number | undefined
	  }

export default function EditModeCard({ cardId, className, children, width, height, offsetX, offsetY, order, x, y }: EditModeCardProps) {
	const dragRef = useRef<DragContext | null>(null)
	const updateOverride = useHomeLayoutStore(state => state.updateOverride)

	const handlePointerMove = (event: PointerEvent) => {
		if (!dragRef.current) return
		event.preventDefault()
		const ctx = dragRef.current
		if (ctx.type === 'move') {
			const nextOffsetX = ctx.baseOffsetX + (event.clientX - ctx.startX)
			const nextOffsetY = ctx.baseOffsetY + (event.clientY - ctx.startY)
			updateOverride(cardId, { offsetX: Math.round(nextOffsetX), offsetY: Math.round(nextOffsetY) })
		} else if (ctx.type === 'resize') {
			const nextWidth = Math.max(80, ctx.baseWidth + (event.clientX - ctx.startX))
			const nextHeight = ctx.baseHeight !== undefined ? Math.max(60, ctx.baseHeight + (event.clientY - ctx.startY)) : undefined
			updateOverride(cardId, { width: Math.round(nextWidth), height: nextHeight ? Math.round(nextHeight) : undefined })
		}
	}

	const stopDragging = () => {
		dragRef.current = null
		window.removeEventListener('pointermove', handlePointerMove)
		window.removeEventListener('pointerup', stopDragging)
	}

	const startDragging = (mode: DragContext['type']) => (event: React.PointerEvent<HTMLDivElement>) => {
		event.preventDefault()
		event.stopPropagation()
		dragRef.current =
			mode === 'move'
				? {
						type: 'move',
						startX: event.clientX,
						startY: event.clientY,
						baseOffsetX: offsetX,
						baseOffsetY: offsetY
					}
				: {
						type: 'resize',
						startX: event.clientX,
						startY: event.clientY,
						baseWidth: width,
						baseHeight: height
					}
		window.addEventListener('pointermove', handlePointerMove)
		window.addEventListener('pointerup', stopDragging)
	}

	return (
		<div
			className={cn(
				'card edit-mode-card pointer-events-auto border border-dashed border-brand/60 bg-white/70 text-left backdrop-blur-sm',
				className
			)}
			style={{ left: x, top: y, width, height }}
			onPointerDown={startDragging('move')}>
			<div className='pointer-events-none h-full w-full'>{children}</div>
			<div className='absolute left-2 top-2 flex items-center gap-1'>
				<span className='rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold text-brand'>Order</span>
				<input
					type='number'
					className='w-16 rounded-md border border-brand/40 bg-white px-2 py-0.5 text-xs text-gray-700 focus:outline-none'
					value={order}
					onChange={e => updateOverride(cardId, { order: Number(e.target.value) })}
					onPointerDown={event => event.stopPropagation()}
				/>
			</div>

			<div
				className='absolute right-1 bottom-1 h-4 w-4 cursor-se-resize rounded-sm border border-brand/50 bg-white/80'
				onPointerDown={startDragging('resize')}
			/>
		</div>
	)
}


'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Card from '@/components/card'
import EditModeCard from '@/components/edit-mode-card'
import { useCardLayout } from './hooks/use-card-layout'
import { useHomeLayoutStore } from './stores/layout-store'
import shareList from '@/app/share/list.json'
import Link from 'next/link'

export const styles = {
	width: 200,
	order: 7
}

type ShareItem = {
	name: string
	url: string
	logo: string
	description: string
	tags: string[]
	stars: number
}

export default function ShareCard() {
	const layout = useCardLayout('share-card')
	const isEditMode = useHomeLayoutStore(state => state.isEditMode)
	const [randomItem, setRandomItem] = useState<ShareItem | null>(null)

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * shareList.length)
		setRandomItem(shareList[randomIndex])
	}, [])

	if (!randomItem) {
		return null
	}

	const content = (
		<>
			<h2 className='text-secondary text-sm'>随机推荐</h2>

			<Link href='/share' className='mt-2 block space-y-2'>
				<div className='flex items-center'>
					<div className='relative mr-3 h-12 w-12 shrink-0 overflow-hidden rounded-xl'>
						<img src={randomItem.logo} alt={randomItem.name} className='h-full w-full object-contain' />
					</div>
					<h3 className='text-sm font-medium'>{randomItem.name}</h3>
				</div>

				<p className='text-secondary line-clamp-3 text-xs'>{randomItem.description}</p>
			</Link>
		</>
	)

	if (isEditMode) {
		return (
			<EditModeCard
				cardId='share-card'
				width={layout.width}
				height={layout.height}
				offsetX={layout.offsetX}
				offsetY={layout.offsetY}
				order={layout.order}
				x={layout.x}
				y={layout.y}>
				{content}
			</EditModeCard>
		)
	}

	return (
		<Card order={layout.order} width={layout.width} height={layout.height} x={layout.x} y={layout.y}>
			{content}
		</Card>
	)
}

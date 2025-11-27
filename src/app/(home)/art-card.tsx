import Card from '@/components/card'
import EditModeCard from '@/components/edit-mode-card'
import { useCardLayout } from './hooks/use-card-layout'
import { useHomeLayoutStore } from './stores/layout-store'

export const styles = {
	width: 360,
	height: 200,
	order: 3
}

export default function ArtCard() {
	const layout = useCardLayout('art-card')
	const isEditMode = useHomeLayoutStore(state => state.isEditMode)
	const content = <img src='/images/art/cat.png' alt='wall art' className='h-full w-full rounded-[32px] object-cover' />

	if (isEditMode) {
		return (
			<EditModeCard
				cardId='art-card'
				width={layout.width}
				height={layout.height}
				offsetX={layout.offsetX}
				offsetY={layout.offsetY}
				order={layout.order}
				x={layout.x}
				y={layout.y}
				className='-translate-1/2 p-2 max-sm:static max-sm:translate-0'>
				{content}
			</EditModeCard>
		)
	}

	return (
		<Card
			className='-translate-1/2 p-2 max-sm:static max-sm:translate-0'
			order={layout.order}
			width={layout.width}
			height={layout.height}
			x={layout.x}
			y={layout.y}>
			{content}
		</Card>
	)
}

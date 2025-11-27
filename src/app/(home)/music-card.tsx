import Card from '@/components/card'
import EditModeCard from '@/components/edit-mode-card'
import { useCardLayout } from './hooks/use-card-layout'
import { useHomeLayoutStore } from './stores/layout-store'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'

export const styles = {
	width: 293,
	height: 66,
	offset: 120,
	order: 6
}

export default function MusicCard() {
	const layout = useCardLayout('music-card')
	const isEditMode = useHomeLayoutStore(state => state.isEditMode)
	const content = (
		<>
			<MusicSVG className='h-8 w-8' />

			<div className='flex-1'>
				<div className='text-secondary text-sm'>随机音乐</div>

				<div className='mt-1 h-2 rounded-full bg-white/60'>
					<div className='bg-linear h-full w-1/2 rounded-full' />
				</div>
			</div>

			<button className='flex h-10 w-10 items-center justify-center rounded-full bg-white'>
				<PlaySVG className='text-brand ml-1 h-4 w-4' />
			</button>
		</>
	)

	if (isEditMode) {
		return (
			<EditModeCard
				cardId='music-card'
				width={layout.width}
				height={layout.height}
				offsetX={layout.offsetX}
				offsetY={layout.offsetY}
				order={layout.order}
				x={layout.x}
				y={layout.y}
				className='flex items-center gap-3'>
				{content}
			</EditModeCard>
		)
	}

	return (
		<Card order={layout.order} width={layout.width} height={layout.height} x={layout.x} y={layout.y} className='flex items-center gap-3'>
			{content}
		</Card>
	)
}

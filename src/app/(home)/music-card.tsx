'use client'

import { useState, useCallback } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from './home-draggable-layer'
import MusicPlayerModal from './music-player-modal'
import type { CachedSong, RandomSongResponse } from '@/app/api/music/types'

export default function MusicCard() {
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const [modalOpen, setModalOpen] = useState(false)
	const [song, setSong] = useState<CachedSong | null>(null)
	const [url, setUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const fetchRandomSong = useCallback(async () => {
		setLoading(true)
		try {
			const response = await fetch('/api/music/random')
			const data: RandomSongResponse = await response.json()

			if (data.success && data.song && data.url) {
				setSong(data.song)
				setUrl(data.url)
			} else {
				console.error('获取随机歌曲失败:', data.error)
			}
		} catch (error) {
			console.error('请求失败:', error)
		} finally {
			setLoading(false)
		}
	}, [])

	const handlePlay = useCallback(async () => {
		setModalOpen(true)
		if (!song) {
			await fetchRandomSong()
		}
	}, [song, fetchRandomSong])

	const handleNext = useCallback(async () => {
		await fetchRandomSong()
	}, [fetchRandomSong])

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

	return (
		<>
			<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
				<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex items-center gap-3'>
					<MusicSVG className='h-8 w-8' />

					<div className='flex-1'>
						<div className='text-secondary text-sm'>{song ? song.name : '随机音乐'}</div>

						<div className='mt-1 h-2 rounded-full bg-white/60'>
							<div className='bg-linear h-full w-1/2 rounded-full' />
						</div>
					</div>

					<button onClick={handlePlay} className='flex h-10 w-10 items-center justify-center rounded-full bg-white transition-transform hover:scale-105'>
						<PlaySVG className='text-brand ml-1 h-4 w-4' />
					</button>
				</Card>
			</HomeDraggableLayer>

			<MusicPlayerModal open={modalOpen} onClose={() => setModalOpen(false)} song={song} url={url} onNext={handleNext} loading={loading} />
		</>
	)
}


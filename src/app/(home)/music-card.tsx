'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { Pause } from 'lucide-react'
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

	const audioRef = useRef<HTMLAudioElement>(null)
	const [modalOpen, setModalOpen] = useState(false)
	const [song, setSong] = useState<CachedSong | null>(null)
	const [url, setUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [isPlaying, setIsPlaying] = useState(false)
	const [progress, setProgress] = useState(0)

	const fetchRandomSong = useCallback(async () => {
		setLoading(true)
		setProgress(0)
		try {
			const response = await fetch('/api/music/random')
			const data: RandomSongResponse = await response.json()

			if (data.success && data.song && data.url) {
				setSong(data.song)
				setUrl(data.url)
				return true
			} else {
				console.error('获取随机歌曲失败:', data.error)
				return false
			}
		} catch (error) {
			console.error('请求失败:', error)
			return false
		} finally {
			setLoading(false)
		}
	}, [])

	// 当 URL 变化时自动播放
	useEffect(() => {
		if (url && audioRef.current && !modalOpen) {
			audioRef.current.load()
			audioRef.current.play().catch(console.error)
		}
	}, [url, modalOpen])

	const handlePlay = useCallback(async () => {
		if (!song) {
			const success = await fetchRandomSong()
			if (success) {
				setIsPlaying(true)
			}
		} else if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause()
			} else {
				audioRef.current.play().catch(console.error)
			}
		}
	}, [song, isPlaying, fetchRandomSong])

	const handleNext = useCallback(async () => {
		const success = await fetchRandomSong()
		if (success) {
			setIsPlaying(true)
		}
	}, [fetchRandomSong])

	const handleTimeUpdate = useCallback(() => {
		if (audioRef.current && audioRef.current.duration) {
			setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
		}
	}, [])

	const handleEnded = useCallback(() => {
		setIsPlaying(false)
		setProgress(0)
		// 自动播放下一首
		handleNext()
	}, [handleNext])

	const openModal = useCallback(() => {
		setModalOpen(true)
	}, [])

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

	return (
		<>
			<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
				<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex items-center gap-3'>
					{/* 封面/默认图标 */}
					{song?.cover ? (
						<div className='h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-xl' onClick={openModal}>
							<img src={`${song.cover}?param=100y100`} alt={song.name} className='h-full w-full object-cover' />
						</div>
					) : (
						<MusicSVG className='h-8 w-8 shrink-0' />
					)}

					{/* 歌曲信息和进度条 */}
					<div className='min-w-0 flex-1 cursor-pointer' onClick={openModal}>
						<div className='text-secondary truncate text-sm'>{song ? song.name : '随机音乐'}</div>

						<div className='mt-1 h-2 rounded-full bg-white/60'>
							<div
								className='bg-linear h-full rounded-full transition-all duration-300'
								style={{ width: `${song ? progress : 50}%` }}
							/>
						</div>
					</div>

					{/* 播放/暂停按钮 */}
					<button
						onClick={handlePlay}
						disabled={loading}
						className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-transform hover:scale-105 disabled:opacity-50'>
						{loading ? (
							<div className='border-brand h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
						) : isPlaying ? (
							<Pause className='text-brand h-4 w-4' />
						) : (
							<PlaySVG className='text-brand ml-1 h-4 w-4' />
						)}
					</button>
				</Card>
			</HomeDraggableLayer>

			{/* 隐藏的 audio 元素（卡片内播放用） */}
			<audio
				ref={audioRef}
				src={url || ''}
				onTimeUpdate={handleTimeUpdate}
				onEnded={handleEnded}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
			/>

			<MusicPlayerModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				song={song}
				url={url}
				onNext={handleNext}
				loading={loading}
			/>
		</>
	)
}


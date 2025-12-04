'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { Pause, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { HomeDraggableLayer } from './home-draggable-layer'
import type { CachedSong, RandomSongResponse } from '@/app/api/music/types'

export default function MusicCard() {
	const center = useCenterStore()
	const { cardStyles, setMusicExpanded } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const audioRef = useRef<HTMLAudioElement>(null)
	const [expanded, setExpandedLocal] = useState(false)

	const setExpanded = useCallback(
		(value: boolean) => {
			setExpandedLocal(value)
			setMusicExpanded(value)
		},
		[setMusicExpanded]
	)
	const [song, setSong] = useState<CachedSong | null>(null)
	const [url, setUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [isPlaying, setIsPlaying] = useState(false)
	const [progress, setProgress] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [muted, setMuted] = useState(false)

	const fetchRandomSong = useCallback(async () => {
		setLoading(true)
		setProgress(0)
		setCurrentTime(0)
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
		if (url && audioRef.current) {
			audioRef.current.load()
			audioRef.current.play().catch(console.error)
		}
	}, [url])

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
			setCurrentTime(audioRef.current.currentTime)
			setDuration(audioRef.current.duration)
		}
	}, [])

	const handleSeek = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!audioRef.current || !duration) return
			const rect = e.currentTarget.getBoundingClientRect()
			const percent = (e.clientX - rect.left) / rect.width
			audioRef.current.currentTime = percent * duration
		},
		[duration]
	)

	const handleEnded = useCallback(() => {
		setIsPlaying(false)
		setProgress(0)
		handleNext()
	}, [handleNext])

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60)
		const seconds = Math.floor(time % 60)
		return `${minutes}:${seconds.toString().padStart(2, '0')}`
	}

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

	// 展开时的宽度
	const expandedWidth = 360
	const expandedHeight = 160

	return (
		<>
			<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
				<motion.div
					className='card absolute cursor-pointer'
					style={{ left: x, top: y }}
					initial={false}
					animate={{
						width: expanded ? expandedWidth : styles.width,
						height: expanded ? expandedHeight : styles.height
					}}
					transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					onMouseEnter={() => setExpanded(true)}
					onMouseLeave={() => setExpanded(false)}>
					<div className='flex h-full flex-col'>
						{/* 主要内容区域 - 使用 motion 控制垂直位置 */}
						<motion.div
							className='flex items-center gap-3'
							animate={{
								marginTop: expanded ? 0 : (styles.height - 24 - 40) / 2 - 6 // 居中计算: (卡片高度 - padding - 内容高度) / 2
							}}
							transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
							{/* 封面/默认图标 */}
							<motion.div
								className='shrink-0 overflow-hidden rounded-xl bg-white/30'
								animate={{
									width: expanded ? 56 : 40,
									height: expanded ? 56 : 40
								}}
								transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
								{song?.cover ? (
									<img src={`${song.cover}?param=100y100`} alt={song.name} className='h-full w-full object-cover' />
								) : (
									<div className='flex h-full w-full items-center justify-center'>
										<MusicSVG className='h-6 w-6' />
									</div>
								)}
							</motion.div>

							{/* 歌曲信息 */}
							<div className='min-w-0 flex-1'>
								<div className='text-secondary truncate text-sm font-medium'>{song ? song.name : '随机音乐'}</div>
								<AnimatePresence>
									{expanded && song && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											className='text-secondary/60 truncate text-xs'>
											{song.artist}
										</motion.div>
									)}
								</AnimatePresence>

								{/* 简化进度条（未展开时） */}
								{!expanded && (
									<div className='mt-1 h-2 rounded-full bg-white/60'>
										<div
											className='bg-linear h-full rounded-full transition-all duration-300'
											style={{ width: `${song ? progress : 50}%` }}
										/>
									</div>
								)}
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
						</motion.div>

						{/* 展开后的控制区域 */}
						<AnimatePresence>
							{expanded && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ delay: 0.1 }}
									className='mt-1 flex flex-1 flex-col'>
									{/* 进度条 */}
									<div className='mb-1'>
										<div className='h-1.5 cursor-pointer rounded-full bg-white/60' onClick={handleSeek}>
											<div
												className='bg-linear h-full rounded-full transition-all'
												style={{ width: `${progress}%` }}
											/>
										</div>
										<div className='mt-0.5 flex justify-between text-[10px] text-gray-400'>
											<span>{formatTime(currentTime)}</span>
											<span>{formatTime(duration)}</span>
										</div>
									</div>

									{/* 控制按钮 */}
									<div className='flex items-center justify-center gap-4'>
										<button
											onClick={() => setMuted(!muted)}
											className='rounded-full p-1.5 text-gray-500 transition-colors hover:bg-white/60'>
											{muted ? <VolumeX className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
										</button>

										<button
											onClick={handlePlay}
											disabled={loading}
											className='bg-brand flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-105 disabled:opacity-50'>
											{loading ? (
												<div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
											) : isPlaying ? (
												<Pause className='h-4 w-4' />
											) : (
												<PlaySVG className='ml-0.5 h-4 w-4' />
											)}
										</button>

										<button
											onClick={handleNext}
											disabled={loading}
											className='rounded-full p-1.5 text-gray-500 transition-colors hover:bg-white/60 disabled:opacity-50'>
											<SkipForward className='h-4 w-4' />
										</button>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
			</HomeDraggableLayer>

			{/* 隐藏的 audio 元素 */}
			<audio
				ref={audioRef}
				src={url || ''}
				muted={muted}
				onTimeUpdate={handleTimeUpdate}
				onEnded={handleEnded}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
			/>
		</>
	)
}


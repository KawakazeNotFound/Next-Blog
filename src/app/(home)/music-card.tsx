'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { HomeDraggableLayer } from './home-draggable-layer'
import type { CachedSong, RandomSongResponse } from '@/app/api/music/types'
import { cn } from '@/lib/utils'

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
	const [volume, setVolume] = useState(0.5)
	const [history, setHistory] = useState<{ song: CachedSong; url: string }[]>([])
	const [historyIndex, setHistoryIndex] = useState(-1)

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
				setHistory(prev => [...prev.slice(0, historyIndex + 1), { song: data.song!, url: data.url! }])
				setHistoryIndex(prev => prev + 1)
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
	}, [historyIndex])

	// 当 URL 变化时自动播放
	useEffect(() => {
		if (url && audioRef.current) {
			audioRef.current.load()
			audioRef.current.play().catch(console.error)
		}
	}, [url])

	// 监听音量变化
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume
		}
	}, [volume])

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
		if (historyIndex < history.length - 1) {
			const nextIndex = historyIndex + 1
			const nextItem = history[nextIndex]
			setSong(nextItem.song)
			setUrl(nextItem.url)
			setHistoryIndex(nextIndex)
			setIsPlaying(true)
		} else {
			const success = await fetchRandomSong()
			if (success) {
				setIsPlaying(true)
			}
		}
	}, [fetchRandomSong, history, historyIndex])

	const handlePrev = useCallback(() => {
		if (historyIndex > 0) {
			const prevIndex = historyIndex - 1
			const prevItem = history[prevIndex]
			setSong(prevItem.song)
			setUrl(prevItem.url)
			setHistoryIndex(prevIndex)
			setIsPlaying(true)
		}
	}, [history, historyIndex])

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

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(e.target.value)
		setVolume(newVolume)
		if (newVolume > 0 && muted) {
			setMuted(false)
		}
	}

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
					className={cn('card absolute', song ? 'cursor-pointer' : 'cursor-default')}
					style={{ left: x, top: y }}
					initial={false}
					animate={{
						width: expanded ? expandedWidth : styles.width,
						height: expanded ? expandedHeight : styles.height
					}}
					transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					onMouseEnter={() => {
						if (song) setExpanded(true)
					}}
					onMouseLeave={() => setExpanded(false)}>
					<div className='flex h-full flex-col'>
						{/* 主要内容区域 - 使用 motion 控制垂直位置 */}
						<motion.div
							className='flex items-center gap-3'
							animate={{
								marginTop: expanded ? 0 : (styles.height - 40) / 2 - 24 // 居中计算: (卡片高度 - 内容高度) / 2 - padding
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
								className={cn(
									'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-all duration-300 hover:scale-105 disabled:opacity-50',
									expanded ? 'pointer-events-none opacity-0' : 'opacity-100'
								)}>
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
										{/* 音量控制 */}
										<div className='group relative flex items-center justify-center'>
											<button
												onClick={() => setMuted(!muted)}
												className='rounded-full p-1.5 text-gray-500 transition-colors hover:bg-white/60'>
												{muted || volume === 0 ? <VolumeX className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
											</button>
											<div className='absolute bottom-full left-1/2 mb-2 flex h-0 w-8 -translate-x-1/2 flex-col items-center justify-end overflow-hidden rounded-full bg-white/80 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:h-24 group-hover:py-3'>
												<div className='relative flex h-20 w-full items-center justify-center'>
													<input
														type='range'
														min='0'
														max='1'
														step='0.01'
														value={muted ? 0 : volume}
														onChange={handleVolumeChange}
														className='absolute h-1 w-16 -rotate-90 cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:border-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand'
													/>
												</div>
											</div>
										</div>

										{/* 上一首 */}
										<button
											onClick={handlePrev}
											disabled={loading || historyIndex <= 0}
											className='rounded-full p-1.5 text-gray-500 transition-colors hover:bg-white/60 disabled:opacity-30'>
											<SkipBack className='h-4 w-4' />
										</button>

										{/* 播放/暂停 */}
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

										{/* 下一首 */}
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
				src={url || undefined}
				muted={muted}
				onTimeUpdate={handleTimeUpdate}
				onEnded={handleEnded}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
			/>
		</>
	)
}


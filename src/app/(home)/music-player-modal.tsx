'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Play, Pause, SkipForward, Volume2, VolumeX, Loader2 } from 'lucide-react'
import type { CachedSong } from '@/app/api/music/types'

interface MusicPlayerModalProps {
	open: boolean
	onClose: () => void
	song: CachedSong | null
	url: string | null
	onNext: () => void
	loading: boolean
}

export default function MusicPlayerModal({ open, onClose, song, url, onNext, loading }: MusicPlayerModalProps) {
	const audioRef = useRef<HTMLAudioElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [muted, setMuted] = useState(false)

	// 当 URL 变化时自动播放
	useEffect(() => {
		if (url && audioRef.current) {
			audioRef.current.load()
			audioRef.current.play().catch(console.error)
			setIsPlaying(true)
		}
	}, [url])

	// 关闭时暂停
	useEffect(() => {
		if (!open && audioRef.current) {
			audioRef.current.pause()
			setIsPlaying(false)
		}
	}, [open])

	const togglePlay = useCallback(() => {
		if (!audioRef.current) return
		if (isPlaying) {
			audioRef.current.pause()
		} else {
			audioRef.current.play().catch(console.error)
		}
		setIsPlaying(!isPlaying)
	}, [isPlaying])

	const handleTimeUpdate = useCallback(() => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime)
		}
	}, [])

	const handleLoadedMetadata = useCallback(() => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration)
		}
	}, [])

	const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (!audioRef.current || !duration) return
		const rect = e.currentTarget.getBoundingClientRect()
		const percent = (e.clientX - rect.left) / rect.width
		audioRef.current.currentTime = percent * duration
	}, [duration])

	const handleEnded = useCallback(() => {
		setIsPlaying(false)
		onNext()
	}, [onNext])

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60)
		const seconds = Math.floor(time % 60)
		return `${minutes}:${seconds.toString().padStart(2, '0')}`
	}

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
					onClick={onClose}>
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ type: 'spring', damping: 25, stiffness: 300 }}
						className='relative w-[360px] overflow-hidden rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-xl'
						onClick={e => e.stopPropagation()}>
						{/* 关闭按钮 */}
						<button
							onClick={onClose}
							className='absolute top-4 right-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'>
							<X className='h-5 w-5' />
						</button>

						{/* 封面 */}
						<div className='relative mx-auto mb-5 h-48 w-48 overflow-hidden rounded-2xl bg-gray-100 shadow-lg'>
							{song?.cover ? (
								<img src={`${song.cover}?param=300y300`} alt={song.name} className='h-full w-full object-cover' />
							) : (
								<div className='flex h-full w-full items-center justify-center text-gray-300'>
									<Volume2 className='h-16 w-16' />
								</div>
							)}
							{loading && (
								<div className='absolute inset-0 flex items-center justify-center bg-black/30'>
									<Loader2 className='h-10 w-10 animate-spin text-white' />
								</div>
							)}
						</div>

						{/* 歌曲信息 */}
						<div className='mb-4 text-center'>
							<h3 className='truncate text-lg font-semibold text-gray-800'>{song?.name || '加载中...'}</h3>
							<p className='text-secondary truncate text-sm'>{song?.artist || '-'}</p>
						</div>

						{/* 进度条 */}
						<div className='mb-4'>
							<div className='mb-1 h-1.5 cursor-pointer rounded-full bg-gray-200' onClick={handleSeek}>
								<div className='bg-brand h-full rounded-full transition-all' style={{ width: `${progress}%` }} />
							</div>
							<div className='flex justify-between text-xs text-gray-400'>
								<span>{formatTime(currentTime)}</span>
								<span>{formatTime(duration)}</span>
							</div>
						</div>

						{/* 控制按钮 */}
						<div className='flex items-center justify-center gap-6'>
							<button
								onClick={() => setMuted(!muted)}
								className='rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100'>
								{muted ? <VolumeX className='h-5 w-5' /> : <Volume2 className='h-5 w-5' />}
							</button>

							<button
								onClick={togglePlay}
								disabled={loading || !url}
								className='bg-brand flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50'>
								{loading ? (
									<Loader2 className='h-6 w-6 animate-spin' />
								) : isPlaying ? (
									<Pause className='h-6 w-6' />
								) : (
									<Play className='ml-1 h-6 w-6' />
								)}
							</button>

							<button
								onClick={onNext}
								disabled={loading}
								className='rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50'>
								<SkipForward className='h-5 w-5' />
							</button>
						</div>

						{/* 隐藏的 audio 元素 */}
						<audio
							ref={audioRef}
							src={url || ''}
							muted={muted}
							onTimeUpdate={handleTimeUpdate}
							onLoadedMetadata={handleLoadedMetadata}
							onEnded={handleEnded}
							onPlay={() => setIsPlaying(true)}
							onPause={() => setIsPlaying(false)}
						/>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

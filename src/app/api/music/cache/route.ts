import { NextResponse } from 'next/server'
import { NETEASE_API, PLAYLIST_ID, type NeteaseTrack, type CachedSong, type MusicCache } from '../types'
import { promises as fs } from 'fs'
import path from 'path'

// Vercel Cron Job 配置
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 最大执行时间 60 秒

// 缓存文件路径 (在 /tmp 目录，Vercel Serverless 可写)
const CACHE_FILE = '/tmp/music-cache.json'
// 备用：使用 public 目录的静态 JSON (需要重新部署才能更新)
const STATIC_CACHE_FILE = path.join(process.cwd(), 'public', 'music-cache.json')

// 获取歌单所有歌曲
async function fetchPlaylistTracks(limit = 200): Promise<NeteaseTrack[]> {
	const response = await fetch(`${NETEASE_API}/playlist/track/all?id=${PLAYLIST_ID}&limit=${limit}`, {
		headers: { 'User-Agent': 'Mozilla/5.0' }
	})
	const data = await response.json()
	return data.songs || []
}

// 批量检查歌曲可用性
async function checkSongsAvailability(ids: number[]): Promise<Map<number, boolean>> {
	const result = new Map<number, boolean>()

	// 分批检查，每批 50 首
	const batchSize = 50
	for (let i = 0; i < ids.length; i += batchSize) {
		const batch = ids.slice(i, i + batchSize)
		const idsStr = batch.join(',')

		try {
			const response = await fetch(`${NETEASE_API}/song/url/v1?id=${idsStr}&level=standard`, {
				headers: { 'User-Agent': 'Mozilla/5.0' }
			})
			const data = await response.json()

			if (data.data) {
				for (const item of data.data) {
					// code === 200 且有 url 表示可用
					result.set(item.id, item.code === 200 && item.url)
				}
			}
		} catch (error) {
			console.error(`检查歌曲批次失败:`, error)
		}

		// 避免请求过快
		await new Promise(resolve => setTimeout(resolve, 200))
	}

	return result
}

// 保存缓存
async function saveCache(cache: MusicCache): Promise<void> {
	const cacheJson = JSON.stringify(cache, null, 2)

	// 尝试写入 /tmp
	try {
		await fs.writeFile(CACHE_FILE, cacheJson, 'utf-8')
		console.log(`缓存已保存到 ${CACHE_FILE}`)
	} catch (error) {
		console.error('写入 /tmp 失败:', error)
	}

	// 同时写入 public 目录（本地开发用）
	try {
		await fs.writeFile(STATIC_CACHE_FILE, cacheJson, 'utf-8')
		console.log(`缓存已保存到 ${STATIC_CACHE_FILE}`)
	} catch (error) {
		// public 目录在 Vercel 上不可写，忽略错误
		console.log('写入 public 目录失败 (Vercel 环境正常):', error)
	}
}

export async function GET() {
	try {
		console.log('开始更新音乐缓存...')

		// 1. 获取歌单歌曲
		const tracks = await fetchPlaylistTracks(300)
		console.log(`获取到 ${tracks.length} 首歌曲`)

		if (tracks.length === 0) {
			return NextResponse.json({ success: false, error: '获取歌单失败' }, { status: 500 })
		}

		// 2. 检查可用性
		const ids = tracks.map(t => t.id)
		const availability = await checkSongsAvailability(ids)

		// 3. 筛选可用歌曲
		const availableSongs: CachedSong[] = tracks
			.filter(track => availability.get(track.id))
			.map(track => ({
				id: track.id,
				name: track.name,
				artist: track.ar.map(a => a.name).join(' / '),
				album: track.al.name,
				cover: track.al.picUrl,
				duration: track.dt
			}))

		console.log(`可用歌曲: ${availableSongs.length} / ${tracks.length}`)

		// 4. 保存缓存
		const cache: MusicCache = {
			songs: availableSongs,
			updatedAt: new Date().toISOString(),
			total: availableSongs.length
		}

		await saveCache(cache)

		return NextResponse.json({
			success: true,
			message: `缓存更新完成，共 ${availableSongs.length} 首可用歌曲`,
			updatedAt: cache.updatedAt,
			total: cache.total
		})
	} catch (error) {
		console.error('更新缓存失败:', error)
		return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
	}
}

import { NextResponse } from 'next/server'
import { NETEASE_API, type MusicCache, type NeteaseUrlData, type RandomSongResponse } from '../types'
import { promises as fs } from 'fs'
import path from 'path'

// 缓存文件路径
const CACHE_FILE = '/tmp/music-cache.json'
const STATIC_CACHE_FILE = path.join(process.cwd(), 'public', 'music-cache.json')

// 读取缓存
async function loadCache(): Promise<MusicCache | null> {
	// 优先读取 /tmp 目录
	try {
		const data = await fs.readFile(CACHE_FILE, 'utf-8')
		return JSON.parse(data)
	} catch {
		// 回退到 public 目录的静态文件
		try {
			const data = await fs.readFile(STATIC_CACHE_FILE, 'utf-8')
			return JSON.parse(data)
		} catch {
			return null
		}
	}
}

// 获取歌曲播放 URL
async function fetchSongUrl(id: number): Promise<string | null> {
	try {
		const response = await fetch(`${NETEASE_API}/song/url/v1?id=${id}&level=standard`, {
			headers: { 'User-Agent': 'Mozilla/5.0' },
			cache: 'no-store'
		})
		const data = await response.json()

		if (data.data && data.data[0]) {
			const urlData: NeteaseUrlData = data.data[0]
			if (urlData.code === 200 && urlData.url) {
				return urlData.url
			}
		}
		return null
	} catch (error) {
		console.error('获取歌曲 URL 失败:', error)
		return null
	}
}

export async function GET() {
	try {
		// 1. 读取缓存
		const cache = await loadCache()

		if (!cache || cache.songs.length === 0) {
			return NextResponse.json({
				success: false,
				error: '暂无可用歌曲，请稍后再试'
			} satisfies RandomSongResponse)
		}

		// 2. 随机选择一首歌
		const randomIndex = Math.floor(Math.random() * cache.songs.length)
		const song = cache.songs[randomIndex]

		// 3. 获取播放 URL
		const url = await fetchSongUrl(song.id)

		if (!url) {
			// 如果当前歌曲不可用，尝试其他歌曲 (最多重试 3 次)
			for (let i = 0; i < 3; i++) {
				const retryIndex = Math.floor(Math.random() * cache.songs.length)
				const retrySong = cache.songs[retryIndex]
				const retryUrl = await fetchSongUrl(retrySong.id)

				if (retryUrl) {
					return NextResponse.json({
						success: true,
						song: retrySong,
						url: retryUrl
					} satisfies RandomSongResponse)
				}
			}

			return NextResponse.json({
				success: false,
				error: '获取播放链接失败'
			} satisfies RandomSongResponse)
		}

		return NextResponse.json({
			success: true,
			song,
			url
		} satisfies RandomSongResponse)
	} catch (error) {
		console.error('随机歌曲 API 错误:', error)
		return NextResponse.json({
			success: false,
			error: String(error)
		} satisfies RandomSongResponse)
	}
}

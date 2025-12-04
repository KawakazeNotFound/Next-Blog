// 网易云 API 返回的歌曲信息
export interface NeteaseTrack {
	id: number
	name: string
	ar: { id: number; name: string }[] // 歌手
	al: { id: number; name: string; picUrl: string } // 专辑
	dt: number // 时长 (ms)
}

// 网易云 API 返回的歌曲 URL 信息
export interface NeteaseUrlData {
	id: number
	url: string | null
	code: number
	br: number
	size: number
	type: string
	time: number
}

// 缓存的可用歌曲
export interface CachedSong {
	id: number
	name: string
	artist: string
	album: string
	cover: string
	duration: number // 时长 (ms)
}

// 随机歌曲 API 响应
export interface RandomSongResponse {
	success: boolean
	song?: CachedSong
	url?: string
	error?: string
}

// 缓存数据结构
export interface MusicCache {
	songs: CachedSong[]
	updatedAt: string
	total: number
}

// 网易云 API 配置
export const NETEASE_API = 'https://163.0061226.xyz'
export const USER_UID = '1646867891'
export const PLAYLIST_ID = '2478496590' // Ryosume喜欢的音乐

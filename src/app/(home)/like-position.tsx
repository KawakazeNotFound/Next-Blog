import LikeButton from '@/components/like-button'
import { ANIMATION_DELAY, CARD_SPACING } from '@/consts'
import { motion } from 'motion/react'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { HomeDraggableLayer } from './home-draggable-layer'

// 展开时的额外高度
const MUSIC_EXPANDED_EXTRA_HEIGHT = 94 // 160 - 66 = 94
const MUSIC_EXPANDED_WIDTH = 360
const MUSIC_EXPANDED_HEIGHT = 160

export default function LikePosition() {
	const center = useCenterStore()
	const { cardStyles, musicExpanded } = useConfigStore()
	const styles = cardStyles.likePosition
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons
	const musicCardStyles = cardStyles.musicCard
	const shareCardStyles = cardStyles.shareCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const x =
		styles.offsetX !== null
			? center.x + styles.offsetX
			: center.x + hiCardStyles.width / 2 - socialButtonsStyles.width + shareCardStyles.width + CARD_SPACING
	const baseY =
		styles.offsetY !== null
			? center.y + styles.offsetY
			: center.y + hiCardStyles.height / 2 + CARD_SPACING + socialButtonsStyles.height + CARD_SPACING + musicCardStyles.height + CARD_SPACING

	// 只有当 LikePosition 和 MusicCard 都在默认位置时，才跟随音乐卡片展开移动
	const isLikeDefault = styles.offsetY === null && styles.offsetX === null
	const isMusicDefault = musicCardStyles.offsetY === null && musicCardStyles.offsetX === null
	const shouldMove = musicExpanded && isLikeDefault && isMusicDefault

	// 当音乐卡片展开时，向下移动
	const y = baseY + (shouldMove ? MUSIC_EXPANDED_EXTRA_HEIGHT : 0)

	// 计算 MusicCard 的位置和展开后的区域
	const musicX =
		musicCardStyles.offsetX !== null
			? center.x + musicCardStyles.offsetX
			: center.x + CARD_SPACING + hiCardStyles.width / 2 - musicCardStyles.offset

	const musicY =
		musicCardStyles.offsetY !== null
			? center.y + musicCardStyles.offsetY
			: center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

	// 碰撞检测
	let isOverlapping = false
	if (musicExpanded) {
		const musicRect = {
			left: musicX,
			right: musicX + MUSIC_EXPANDED_WIDTH,
			top: musicY,
			bottom: musicY + MUSIC_EXPANDED_HEIGHT
		}
		const likeRect = {
			left: x,
			right: x + styles.width,
			top: y,
			bottom: y + styles.height
		}

		isOverlapping = !(
			likeRect.right < musicRect.left ||
			likeRect.left > musicRect.right ||
			likeRect.bottom < musicRect.top ||
			likeRect.top > musicRect.bottom
		)
	}

	return (
		<HomeDraggableLayer cardKey='likePosition' x={x} y={y} width={styles.width} height={styles.height}>
			<motion.div
				className='absolute max-sm:static'
				initial={{ left: x, top: baseY }}
				animate={{
					left: x,
					top: y,
					opacity: isOverlapping ? 0 : 1,
					pointerEvents: isOverlapping ? 'none' : 'auto'
				}}
				transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
				<LikeButton delay={cardStyles.shareCard.order * ANIMATION_DELAY * 1000} />
			</motion.div>
		</HomeDraggableLayer>
	)
}

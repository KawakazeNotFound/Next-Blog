import LikeButton from '@/components/like-button'
import { ANIMATION_DELAY, CARD_SPACING } from '@/consts'
import { motion } from 'motion/react'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { HomeDraggableLayer } from './home-draggable-layer'

// 展开时的额外高度
const MUSIC_EXPANDED_EXTRA_HEIGHT = 94 // 160 - 66 = 94

export default function LikePosition() {
	const center = useCenterStore()
	const { cardStyles, musicExpanded } = useConfigStore()
	const styles = cardStyles.likePosition
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons
	const musicCardStyles = cardStyles.musicCard
	const shareCardStyles = cardStyles.shareCard

	const x =
		styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2 - socialButtonsStyles.width + shareCardStyles.width + CARD_SPACING
	const baseY =
		styles.offsetY !== null
			? center.y + styles.offsetY
			: center.y + hiCardStyles.height / 2 + CARD_SPACING + socialButtonsStyles.height + CARD_SPACING + musicCardStyles.height + CARD_SPACING
	
	// 当音乐卡片展开时，向下移动
	const y = baseY + (musicExpanded ? MUSIC_EXPANDED_EXTRA_HEIGHT : 0)

	return (
		<HomeDraggableLayer cardKey='likePosition' x={x} y={y} width={styles.width} height={styles.height}>
			<motion.div
				className='absolute max-sm:static'
				initial={{ left: x, top: baseY }}
				animate={{ left: x, top: y }}
				transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
				<LikeButton delay={cardStyles.shareCard.order * ANIMATION_DELAY * 1000} />
			</motion.div>
		</HomeDraggableLayer>
	)
}

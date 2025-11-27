import LikeButton from '@/components/like-button'
import { ANIMATION_DELAY, CARD_SPACING } from '@/consts'
import { motion } from 'motion/react'
import { useCardLayout } from './hooks/use-card-layout'

export const styles = {
	order: 8
}

export default function LikePosition() {
	const shareLayout = useCardLayout('share-card')
	const musicLayout = useCardLayout('music-card')
	const left = shareLayout.x + (shareLayout.width ?? 0) + CARD_SPACING
	const top = musicLayout.y + (musicLayout.height ?? 0) + CARD_SPACING

	return (
		<motion.div className='absolute max-sm:static' initial={{ left, top }} animate={{ left, top }}>
			<LikeButton delay={styles.order * ANIMATION_DELAY * 1000} />
		</motion.div>
	)
}

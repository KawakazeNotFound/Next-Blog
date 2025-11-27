'use client'

import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useHomeLayoutStore } from './stores/layout-store'
import { pushHomeLayoutConfig } from './services/push-home-layout'
import { useAuthStore } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'

export default function LayoutEditorToolbar() {
	const pathname = usePathname()
	const isEditMode = useHomeLayoutStore(state => state.isEditMode)
	const cancelEditing = useHomeLayoutStore(state => state.cancelEditing)
	const previewEditing = useHomeLayoutStore(state => state.previewEditing)
	const hasChanges = useHomeLayoutStore(state => state.hasChanges)
	const getPayload = useHomeLayoutStore(state => state.getPayload)
	const setSavedOverrides = useHomeLayoutStore(state => state.setSavedOverrides)
	const { isAuth, setPrivateKey } = useAuthStore()
	const [isSaving, setIsSaving] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	if (!isEditMode || pathname !== '/') {
		return null
	}

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			await handleSave()
		} catch (error) {
			console.error(error)
			toast.error('读取密钥文件失败')
		}
	}

	const handleSave = async () => {
		setIsSaving(true)
		try {
			const payload = getPayload()
			await pushHomeLayoutConfig(payload)
			setSavedOverrides(payload.overrides)
		} catch (error: any) {
			console.error(error)
			toast.error(`更新失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleUpdateClick = () => {
		if (!isAuth) {
			fileInputRef.current?.click()
		} else {
			handleSave()
		}
	}

	return (
		<>
			<input
				ref={fileInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const file = e.target.files?.[0]
					if (file) await handleChoosePrivateKey(file)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>
			<motion.div
				initial={{ opacity: 0, scale: 0.6 }}
				animate={{ opacity: 1, scale: 1 }}
				className='absolute top-4 right-6 z-20 flex gap-3 max-sm:hidden'>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={cancelEditing}
					className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
					取消
				</motion.button>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={previewEditing}
					className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
					预览
				</motion.button>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handleUpdateClick}
					disabled={!hasChanges() || isSaving}
					className='brand-btn px-6 disabled:cursor-not-allowed disabled:opacity-60'>
					{isSaving ? '更新中...' : '更新'}
				</motion.button>
			</motion.div>
		</>
	)
}


'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

type CodeBlockProps = {
	children: React.ReactNode
	code: string
}

export function CodeBlock({ children, code }: CodeBlockProps) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			if (navigator?.clipboard?.writeText) {
				await navigator.clipboard.writeText(code)
			} else {
				// 备用方案：使用 textarea 复制
				const textarea = document.createElement('textarea')
				textarea.value = code
				document.body.appendChild(textarea)
				textarea.select()
				document.execCommand('copy')
				document.body.removeChild(textarea)
			}
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (error) {
			console.error('Failed to copy code:', error)
		}
	}

	return (
		<div className='code-block-wrapper'>
			<button
				type='button'
				onClick={handleCopy}
				className='code-block-copy-btn'
				aria-label='Copy code'
			>
				{copied ? <Check size={16} /> : <Copy size={16} />}
			</button>
			{children}
		</div>
	)
}


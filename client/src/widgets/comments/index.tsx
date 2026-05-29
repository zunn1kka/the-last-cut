'use client'

import { useAuth } from '@/features/auth/model/auth-context'
import { commentsApi } from '@/shared/api/comments/comments-api'
import { ratingsApi } from '@/shared/api/ratings/ratings-api'
import { getImageUrl } from '@/shared/lib/get-image-url'
import Button from '@/shared/ui/Button'
import { Flag, Star, ThumbsDown, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface CommentsProps {
	contentId: string
	contentType?: string
}

export function Comments({ contentId, contentType }: CommentsProps) {
	const { user } = useAuth()
	const [comments, setComments] = useState<any[]>([])
	const [newComment, setNewComment] = useState('')
	const [rating, setRating] = useState<number | null>(null)
	const [loading, setLoading] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [replyTo, setReplyTo] = useState<string | null>(null)
	// Разделяем состояние для каждого ответа
	const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
	const [reportReason, setReportReason] = useState<string | null>(null)
	const [reportCommentId, setReportCommentId] = useState<string | null>(null)

	// Реф для поля ввода ответа
	const replyTextareaRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		fetchComments()
	}, [contentId])

	const fetchComments = async () => {
		setLoading(true)
		try {
			const response = await commentsApi.getComments(contentId)
			let commentsData = []
			if (response.data?.items) {
				commentsData = response.data.items
			} else if (Array.isArray(response.data)) {
				commentsData = response.data
			} else {
				commentsData = []
			}

			if (commentsData.length > 0) {
				console.log('Первый комментарий:', commentsData[0])
				console.log('createdAt:', commentsData[0].createdAt)
				console.log('updatedAt:', commentsData[0].updatedAt)
				console.log('Тип createdAt:', typeof commentsData[0].createdAt)
			}

			setComments(commentsData)
		} catch (error) {
			console.error('Failed to fetch comments:', error)
			setComments([])
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newComment.trim()) return

		setSubmitting(true)
		try {
			const payload: any = {
				text: newComment.trim(),
			}
			if (rating !== null && rating !== undefined) {
				payload.rating = rating
			}
			await commentsApi.createComment(contentId, payload)
			setNewComment('')
			setRating(null)
			fetchComments()
		} catch (error) {
			console.error('Failed to post comment:', error)
		} finally {
			setSubmitting(false)
		}
	}

	const handleReply = async (parentId: string) => {
		const replyText = replyTexts[parentId]
		if (!replyText?.trim()) return

		setSubmitting(true)
		try {
			const payload = {
				text: replyText.trim(),
				parentId: parentId,
				rating: null,
			}
			await commentsApi.createComment(contentId, payload)
			// Очищаем только текст для этого конкретного ответа
			setReplyTexts(prev => ({ ...prev, [parentId]: '' }))
			setReplyTo(null)
			fetchComments()
		} catch (error: any) {
			console.error('Failed to post reply:', error)
			if (error.response?.data?.message) {
				alert(`Ошибка: ${error.response.data.message}`)
			}
		} finally {
			setSubmitting(false)
		}
	}

	const handleReplyTextChange = (commentId: string, text: string) => {
		setReplyTexts(prev => ({ ...prev, [commentId]: text }))
	}

	const handleCommentRating = async (
		commentId: string,
		isPositive: boolean,
	) => {
		if (!user) {
			window.location.href = '/login'
			return
		}

		try {
			await ratingsApi.rateComment(commentId, isPositive)
			fetchComments()
		} catch (error) {
			console.error('Failed to rate comment:', error)
		}
	}

	const handleReport = async (commentId: string) => {
		if (!reportReason) return

		try {
			await commentsApi.reportComment(commentId, reportReason)
			setReportReason(null)
			setReportCommentId(null)
			alert('Жалоба отправлена на модерацию')
		} catch (error) {
			console.error('Failed to report comment:', error)
		}
	}

	const getCommentStats = (comment: any) => {
		const ratings = comment.ratings || []
		const likes = ratings.filter((r: any) => r.isPositive).length
		const dislikes = ratings.filter((r: any) => !r.isPositive).length
		return { likes, dislikes }
	}

	const CommentItem = ({
		comment,
		isReply = false,
	}: {
		comment: any
		isReply?: boolean
	}) => {
		const { likes, dislikes } = getCommentStats(comment)
		const userRating = comment.ratings?.find(
			(r: any) => r.user?.id === user?.id,
		)
		const isReplying = replyTo === comment.id
		const replyText = replyTexts[comment.id] || ''

		return (
			<div
				className={`${!isReply && 'border-b border-gray-800'} pb-4 ${isReply ? 'ml-12 mt-4' : ''}`}
			>
				<div className='flex items-start justify-between mb-2'>
					<div className='flex items-center gap-3'>
						<div className='relative w-10 h-10 rounded-full overflow-hidden bg-custom-darker flex-shrink-0'>
							{comment.user?.avatarUrl ? (
								<Image
									src={getImageUrl(comment.user.avatarUrl)}
									alt={comment.user.username}
									fill
									unoptimized={true}
									className='object-cover'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium'>
									{comment.user?.username?.charAt(0)?.toUpperCase()}
								</div>
							)}
						</div>
						<div>
							<Link
								href={`/profile/${comment.user?.id}`}
								className='font-semibold text-white hover:text-blue-400 transition-colors'
							>
								{comment.user?.username}
							</Link>
						</div>
					</div>
					{comment.rating && (
						<div className='flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded flex-shrink-0 ml-2'>
							<Star className='w-4 h-4 text-yellow-500 fill-yellow-500' />
							<span className='text-yellow-500 font-semibold'>
								{comment.rating}
							</span>
						</div>
					)}
				</div>

				{/* Исправленный блок с текстом комментария */}
				<div className='mb-3 ml-13'>
					<p className='text-gray-300 break-words whitespace-pre-wrap overflow-hidden'>
						{comment.text}
					</p>
				</div>

				<div className='flex items-center gap-4 ml-13 flex-wrap'>
					<button
						onClick={() => handleCommentRating(comment.id, true)}
						className={`flex items-center gap-1 transition-colors ${
							userRating?.isPositive === true
								? 'text-green-500'
								: 'text-gray-500 hover:text-green-500'
						}`}
					>
						<ThumbsUp className='w-4 h-4' />
						<span className='text-sm'>{likes}</span>
					</button>
					<button
						onClick={() => handleCommentRating(comment.id, false)}
						className={`flex items-center gap-1 transition-colors ${
							userRating?.isPositive === false
								? 'text-red-500'
								: 'text-gray-500 hover:text-red-500'
						}`}
					>
						<ThumbsDown className='w-4 h-4' />
						<span className='text-sm'>{dislikes}</span>
					</button>
					{user && (
						<>
							<button
								onClick={() => {
									setReplyTo(isReplying ? null : comment.id)
									// Фокус на поле ввода после открытия
									setTimeout(() => {
										const textarea = document.querySelector(
											`textarea[data-reply-to="${comment.id}"]`,
										) as HTMLTextAreaElement
										textarea?.focus()
									}, 100)
								}}
								className='text-sm text-gray-500 hover:text-blue-400 transition-colors'
							>
								Ответить
							</button>
							<button
								onClick={() => {
									setReportCommentId(comment.id)
									setReportReason('')
								}}
								className='text-sm text-gray-500 hover:text-red-400 transition-colors'
							>
								<Flag className='w-4 h-4' />
							</button>
						</>
					)}
				</div>

				{isReplying && (
					<div className='mt-4 ml-13'>
						<textarea
							data-reply-to={comment.id}
							value={replyText}
							onChange={e => handleReplyTextChange(comment.id, e.target.value)}
							placeholder={`Ответить ${comment.user?.username}...`}
							dir='ltr'
							rows={3}
							className='w-full px-4 py-3 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y'
							autoFocus
						/>
						<div className='flex gap-2 mt-2'>
							<Button
								size='sm'
								onClick={() => handleReply(comment.id)}
								disabled={submitting || !replyText.trim()}
							>
								{submitting ? 'Отправка...' : 'Отправить'}
							</Button>
							<Button
								size='sm'
								variant='outline'
								onClick={() => {
									setReplyTo(null)
									handleReplyTextChange(comment.id, '')
								}}
							>
								Отмена
							</Button>
						</div>
					</div>
				)}

				{comment.replies && comment.replies.length > 0 && (
					<div className='mt-4'>
						{comment.replies.map((reply: any) => (
							<CommentItem key={reply.id} comment={reply} isReply />
						))}
					</div>
				)}
			</div>
		)
	}

	return (
		<div className='mt-12'>
			<h2 className='text-2xl font-bold text-white mb-6'>
				Комментарии ({comments.length})
			</h2>

			{/* Форма добавления комментария */}
			{user ? (
				<form
					onSubmit={handleSubmit}
					className='mb-8 bg-custom-dark rounded-xl border border-gray-800 p-6'
				>
					<textarea
						value={newComment}
						onChange={e => setNewComment(e.target.value)}
						placeholder='Напишите свой комментарий...'
						rows={4}
						dir='ltr'
						className='w-full px-4 py-3 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y'
					/>

					<div className='flex justify-end mt-4'>
						<Button
							type='submit'
							disabled={submitting || !newComment.trim()}
							className='text-white'
						>
							{submitting ? 'Отправка...' : 'Отправить'}
						</Button>
					</div>
				</form>
			) : (
				<div className='bg-custom-dark rounded-xl border border-gray-800 p-6 text-center mb-8'>
					<p className='text-gray-400'>
						<Link href='/login' className='text-blue-400 hover:text-blue-300'>
							Войдите
						</Link>
						, чтобы оставить комментарий
					</p>
				</div>
			)}

			{/* Модальное окно для жалобы */}
			{reportCommentId && (
				<div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'>
					<div className='bg-custom-dark rounded-xl border border-gray-800 p-6 max-w-md w-full'>
						<h3 className='text-xl font-bold text-white mb-4'>
							Пожаловаться на комментарий
						</h3>
						<textarea
							value={reportReason}
							onChange={e => setReportReason(e.target.value)}
							placeholder='Укажите причину жалобы...'
							rows={4}
							className='w-full px-4 py-3 bg-custom-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y mb-4'
						/>
						<div className='flex gap-2 justify-end'>
							<Button
								variant='outline'
								onClick={() => setReportCommentId(null)}
							>
								Отмена
							</Button>
							<Button
								onClick={() => handleReport(reportCommentId)}
								disabled={!reportReason}
							>
								Отправить
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Список комментариев */}
			{loading ? (
				<div className='flex justify-center py-12'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
				</div>
			) : comments.length === 0 ? (
				<div className='text-center py-12 text-gray-500'>
					Пока нет комментариев. Будьте первым
				</div>
			) : (
				<div className='space-y-6'>
					{comments.map(comment => (
						<CommentItem key={comment.id} comment={comment} />
					))}
				</div>
			)}
		</div>
	)
}

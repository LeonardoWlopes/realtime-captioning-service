import * as fs from 'node:fs'
import * as path from 'node:path'
import type { WebSocket } from 'ws'
import { usageService } from '~/services/usage.service'
import { generateCaption } from './generate-caption.use-case'

const uploadsDir = path.join(import.meta.dirname, '../../../uploads')

if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true })
}

export function processAudioCaptions(ws: WebSocket) {
	console.log('🔗 New WebSocket connection established for captions')

	// File metadata storage
	let fileMetadata: {
		fileName: string
		fileSize: number
		fileType: string
	} | null = null

	// For collecting audio chunks
	let fileStream: fs.WriteStream | null = null
	let filePath = ''
	let receivedBytes = 0

	// Caption generation interval
	let captionInterval: NodeJS.Timeout | null = null
	let isActive = true // Flag to track if connection should be active

	// Caption generation settings
	const minCaptionDelay = 1000 // 1 second
	const maxCaptionDelay = 2000 // 2 seconds

	// Assuming each audio packet represents 100ms of audio
	const PACKET_DURATION_MS = 100

	// Keep connection alive with ping-pong
	const pingInterval = setInterval(() => {
		if (ws.readyState === ws.OPEN) {
			ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
		} else {
			clearInterval(pingInterval)
		}
	}, 30000) // Send ping every 30 seconds

	// Start generating captions
	function startCaptionGeneration() {
		console.log('Starting caption generation...')

		if (captionInterval) {
			clearInterval(captionInterval)
		}

		// Function to send a random caption
		const sendRandomCaption = () => {
			if (!isActive) {
				console.log('Caption generation stopped due to inactive state')

				if (captionInterval) {
					clearInterval(captionInterval)
					captionInterval = null
				}
				return
			}

			try {
				const caption = generateCaption()

				const timestamp = new Date().toISOString()

				const captionMessage = JSON.stringify({
					type: 'caption',
					text: caption,
					timestamp: timestamp,
					confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
				})

				if (ws.readyState === ws.OPEN) {
					ws.send(captionMessage)
					console.log(`📤 Sending caption: "${caption.substring(0, 40)}..."`)

					// Schedule the next caption
					const nextDelay =
						Math.floor(Math.random() * (maxCaptionDelay - minCaptionDelay)) +
						minCaptionDelay
					captionInterval = setTimeout(sendRandomCaption, nextDelay)
				} else {
					console.log('WebSocket closed, stopping caption generation')

					if (captionInterval) {
						clearInterval(captionInterval)
						captionInterval = null
					}

					isActive = false
				}
			} catch (err) {
				console.error('Error sending caption:', err)
				// Try to continue generating captions despite errors
				if (captionInterval) {
					clearInterval(captionInterval)
				}

				if (isActive && ws.readyState === ws.OPEN) {
					const nextDelay =
						Math.floor(Math.random() * (maxCaptionDelay - minCaptionDelay)) +
						minCaptionDelay
					captionInterval = setTimeout(sendRandomCaption, nextDelay)
				}
			}
		}

		// Start the first caption immediately
		sendRandomCaption()
	}

	ws.on('message', (message: string | Buffer) => {
		try {
			// Check if the message is a string (metadata or control message)
			if (typeof message === 'string') {
				try {
					const data = JSON.parse(message)

					// Handle pong response
					if (data.type === 'pong') {
						return // Just acknowledge silently
					}

					// Handle metadata message
					if (data.type === 'metadata') {
						console.log('📥 Received file metadata:', data)

						// Validate file type - now accept both MP4 and MP3
						if (
							data.fileType !== 'audio/mp4' &&
							data.fileType !== 'audio/mpeg'
						) {
							ws.send(
								JSON.stringify({
									type: 'error',
									message: 'Only MP4 and MP3 audio files are supported',
								}),
							)
							return
						}

						// Store metadata
						fileMetadata = {
							fileName: data.fileName,
							fileSize: data.fileSize,
							fileType: data.fileType,
						}

						if (data.duration) {
							usageService.trackUsage(data.duration)
						}

						// Create a unique filename to avoid overwriting
						const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
						const uniqueFileName = `${timestamp}-${fileMetadata.fileName}`
						filePath = path.join(uploadsDir, uniqueFileName)

						// Create write stream
						fileStream = fs.createWriteStream(filePath)
						receivedBytes = 0

						// Send acknowledgment
						ws.send(
							JSON.stringify({
								type: 'ready',
								message: 'Ready to receive audio chunks',
							}),
						)

						console.log(`Preparing to receive "${fileMetadata.fileName}"`)

						// Start generating captions after receiving metadata
						startCaptionGeneration()
					}

					// Handle end message
					else if (data.type === 'end') {
						if (fileStream) {
							fileStream.end()
							console.log(
								`Audio transfer completed: ${receivedBytes} bytes received`,
							)

							// Send completion message
							ws.send(
								JSON.stringify({
									type: 'processingComplete',
									message: `Audio processing complete for "${fileMetadata?.fileName}"`,
									filePath: filePath,
								}),
							)

							// Make sure captions continue after the file is processed
							if (!captionInterval && isActive) {
								startCaptionGeneration()
							}
						}
					}

					// Handle control message to stop captions
					else if (data.type === 'stopCaptions') {
						isActive = false

						if (captionInterval) {
							clearTimeout(captionInterval)
							captionInterval = null

							ws.send(
								JSON.stringify({
									type: 'captioningStopped',
									message: 'Caption generation has been stopped',
								}),
							)

							console.log('Caption generation stopped')
						}
					}

					// Handle restart captions
					else if (data.type === 'restartCaptions') {
						isActive = true
						if (!captionInterval) {
							startCaptionGeneration()

							ws.send(
								JSON.stringify({
									type: 'captioningRestarted',
									message: 'Caption generation has been restarted',
								}),
							)
						}
					}
				} catch (err) {
					console.error('Error parsing JSON message:', err)
					ws.send(
						JSON.stringify({
							type: 'error',
							message: 'Invalid JSON message',
						}),
					)
				}
			}
			// Handle binary data (audio chunks)
			else if (
				Buffer.isBuffer(message) ||
				(message as Buffer) instanceof ArrayBuffer
			) {
				usageService.trackUsage(PACKET_DURATION_MS)

				// If we haven't received metadata yet, we'll start captioning anyway
				if (!captionInterval && isActive) {
					startCaptionGeneration()
				}

				if (fileStream) {
					// Convert ArrayBuffer to Buffer if needed
					const chunk = Buffer.isBuffer(message)
						? message
						: Buffer.from(message)

					// Write chunk to file
					fileStream.write(chunk)
					receivedBytes += chunk.length

					// Periodically send acknowledgment of received chunks
					if (receivedBytes % (256 * 1024) < 65536 /* 256KB*/) {
						// Acknowledge roughly every 256KB
						ws.send(
							JSON.stringify({
								type: 'chunkReceived',
								receivedBytes: receivedBytes,
							}),
						)
					}
				} else {
					// Create a temporary file for the stream if we're receiving chunks without metadata
					if (!fileStream && !filePath) {
						const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
						const uniqueFileName = `${timestamp}-unknown-audio.mp3`
						filePath = path.join(uploadsDir, uniqueFileName)
						fileStream = fs.createWriteStream(filePath)
						receivedBytes = 0

						console.log(
							'Creating file for audio without metadata:',
							uniqueFileName,
						)
					}

					if (fileStream) {
						// Convert ArrayBuffer to Buffer if needed
						const chunk = Buffer.isBuffer(message)
							? message
							: Buffer.from(message)

						// Write chunk to file
						fileStream.write(chunk)
						receivedBytes += chunk.length
					}
				}
			}
		} catch (error) {
			console.error('Error processing message:', error)

			try {
				ws.send(
					JSON.stringify({
						type: 'error',
						message: 'Error processing data',
					}),
				)
			} catch (sendError) {
				console.error('Error sending error message to client:', sendError)
			}

			// Clean up on error
			if (fileStream) {
				fileStream.end()
				fileStream = null
			}
		}
	})

	// Handle connection close
	ws.on('close', () => {
		console.log('WebSocket connection closed')
		isActive = false

		// Clean up resources
		if (fileStream) {
			fileStream.end()
			fileStream = null
		}

		if (captionInterval) {
			clearTimeout(captionInterval)
			captionInterval = null
		}

		clearInterval(pingInterval)
	})

	// Handle errors
	ws.on('error', (err) => {
		console.error('WebSocket error:', err)
		isActive = false

		if (captionInterval) {
			clearTimeout(captionInterval)
			captionInterval = null
		}

		clearInterval(pingInterval)
	})

	// Send initial connection confirmation
	ws.send(
		JSON.stringify({
			type: 'connected',
			message: 'Connected to captioning service',
			supportedFormats: ['audio/mp4', 'audio/mpeg'],
		}),
	)
}

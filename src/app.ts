import express, { type Request, type Response } from 'express'
import expressWs from 'express-ws'
import { env } from './env'
import { captionRouter } from './http/controllers/caption.controller'

const { app } = expressWs(express())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/captions', captionRouter)

app.use((err: Error, _: Request, res: Response) => {
	console.error('Server error:', err)
	res.status(500).json({ error: 'Internal server error' })
})

app.use((_: Request, res: Response) => {
	res.status(404).json({ error: 'Route not found' })
})

app.listen(env.PORT, () => {
	console.log(`🚀 Server running on http://localhost:${env.PORT}`)
})

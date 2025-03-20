import express, { type Request, type Response } from 'express'
import expressWs from 'express-ws'
import { env } from './env'
import { captionRouter } from './http/controllers/caption.controller'
import { usageRouter } from './http/controllers/usage.controller'

const { app } = expressWs(express())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/captions', captionRouter)
app.use('/usage', usageRouter)

app.use((_: Request, res: Response) => {
	res.json({ error: 'Route not found' }).status(404)
})

app.listen(env.PORT, () => {
	console.log(`🚀 Server running on http://localhost:${env.PORT}`)
})

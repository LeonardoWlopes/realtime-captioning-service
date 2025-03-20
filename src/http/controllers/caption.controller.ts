import { Router } from 'express'
import expressWs from 'express-ws'
import { controllerLogger } from '~/helpers/log'
import { processAudioCaptions } from '~/use-cases/process-audio-captions.use-case'

export const captionRouter = Router()

controllerLogger('Caption')

//@ts-expect-error: Property 'ws' does not exist on type 'Router'.
expressWs(captionRouter)

captionRouter.ws('/', processAudioCaptions)

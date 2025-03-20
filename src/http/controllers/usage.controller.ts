import { Router } from 'express'
import { controllerLogger } from '~/helpers/log'
import { usageService } from '~/services/usage.service'

export const usageRouter = Router()

controllerLogger('Usage')

usageRouter.get('/', (_, res) => {
	try {
		const { totalUsageMs } = usageService.getUsage()

		res.json({
			totalUsageMs,
			totalUsageSec: totalUsageMs / 1000,
			totalUsageMin: totalUsageMs / (1000 * 60),
		})
	} catch (error: unknown) {
		const err = error as Error
		res.status(404).json({
			error: err.message,
		})
	}
})

usageRouter.delete('/', (_, res) => {
	usageService.resetUsage()

	res.json({
		message: 'Usage reset successfully',
	})
})

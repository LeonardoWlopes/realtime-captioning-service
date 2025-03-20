import { randomUUID } from 'node:crypto'

interface UsageData {
	totalMs: number
	lastUpdated: string
	createdAt: string
}

interface UsageStats {
	clientId: string
	totalUsageMs: number
	totalUsageSec: number
	totalUsageMin: number
	lastUpdated: string
	createdAt: string
}

const MOCK_CLIENT_ID = randomUUID()

class UsageService {
	private usageStore: Map<string, UsageData>

	constructor() {
		this.usageStore = new Map<string, UsageData>()
	}

	public trackUsage(packetDurationMs: number, clientId = MOCK_CLIENT_ID): void {
		const currentTime = new Date().toISOString()
		const existingUsage = this.usageStore.get(clientId)

		if (existingUsage) {
			this.usageStore.set(clientId, {
				...existingUsage,
				totalMs: existingUsage.totalMs + packetDurationMs,
				lastUpdated: currentTime,
			})
		} else {
			this.usageStore.set(clientId, {
				totalMs: packetDurationMs,
				lastUpdated: currentTime,
				createdAt: currentTime,
			})
		}
	}

	public getUsage(clientId = MOCK_CLIENT_ID): UsageStats {
		const usage = this.usageStore.get(clientId)

		if (!usage) {
			throw new Error(`No usage data found for client: ${clientId}`)
		}

		return {
			clientId,
			totalUsageMs: usage.totalMs,
			totalUsageSec: usage.totalMs / 1000,
			totalUsageMin: usage.totalMs / (1000 * 60),
			lastUpdated: usage.lastUpdated,
			createdAt: usage.createdAt,
		}
	}

	public resetUsage(clientId = MOCK_CLIENT_ID): void {
		const currentTime = new Date().toISOString()
		const existingUsage = this.usageStore.get(clientId)

		if (existingUsage) {
			this.usageStore.set(clientId, {
				totalMs: 0,
				lastUpdated: currentTime,
				createdAt: existingUsage.createdAt,
			})
		}
	}

	public deleteUsage(clientId: string): boolean {
		return this.usageStore.delete(clientId)
	}

	public getAllUsage(): UsageStats[] {
		const allUsage: UsageStats[] = []

		for (const [clientId, usage] of this.usageStore.entries()) {
			allUsage.push({
				clientId,
				totalUsageMs: usage.totalMs,
				totalUsageSec: usage.totalMs / 1000,
				totalUsageMin: usage.totalMs / (1000 * 60),
				lastUpdated: usage.lastUpdated,
				createdAt: usage.createdAt,
			})
		}

		return allUsage
	}

	public hasUsage(clientId: string): boolean {
		return this.usageStore.has(clientId)
	}
}

export const usageService = new UsageService()
export type { UsageStats, UsageData }

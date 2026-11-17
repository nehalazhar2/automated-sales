import { describe, it, expect } from 'vitest'
import { PACKAGES, SCOPE_VERSION } from '@/lib/quickstart/packages'

describe('packages', () => {
  it('has pilot scope version', () => {
    expect(SCOPE_VERSION).toBe('pilot-v1')
  })

  it('QuickStart limits', () => {
    expect(PACKAGES.quickstart).toMatchObject({
      priceGbp: 995, maxUsers: 5, maxPipelines: 1, maxStagesPerPipeline: 8,
      maxCustomFields: 15, maxRecipes: 3, maxDashboards: 1, maxImportRows: 1000,
      importBatches: 1, discoveryMins: 30, trainingMins: 60, supportDays: 7, deliveryDays: 5,
    })
  })

  it('Plus limits', () => {
    expect(PACKAGES.plus).toMatchObject({
      priceGbp: 1995, maxUsers: 10, maxPipelines: 2, maxStagesPerPipeline: 8,
      maxCustomFields: 30, maxRecipes: 8, maxDashboards: 2, maxImportRows: 5000,
      importBatches: 2, discoveryMins: 60, trainingMins: 90, supportDays: 14, deliveryDays: 10,
    })
  })

  it('has names and inclusions', () => {
    expect(PACKAGES.quickstart.name).toBe('Pipedrive QuickStart')
    expect(PACKAGES.plus.name).toBe('Pipedrive QuickStart Plus')
    expect(PACKAGES.quickstart.inclusions.length).toBeGreaterThan(0)
  })
})

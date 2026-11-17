export const SCOPE_VERSION = 'pilot-v1' as const

export type PackageId = 'quickstart' | 'plus'

export type PackageLimits = {
  readonly id: PackageId
  readonly name: string
  readonly priceGbp: number
  readonly maxUsers: number
  readonly maxPipelines: number
  readonly maxStagesPerPipeline: number
  readonly maxCustomFields: number
  readonly maxRecipes: number
  readonly maxDashboards: number
  readonly maxImportRows: number
  readonly importBatches: number
  readonly discoveryMins: number
  readonly trainingMins: number
  readonly supportDays: number
  readonly deliveryDays: number
  readonly inclusions: readonly string[]
}

export const PACKAGES: Readonly<Record<PackageId, PackageLimits>> = {
  quickstart: {
    id: 'quickstart',
    name: 'Pipedrive QuickStart',
    priceGbp: 995,
    maxUsers: 5,
    maxPipelines: 1,
    maxStagesPerPipeline: 8,
    maxCustomFields: 15,
    maxRecipes: 3,
    maxDashboards: 1,
    maxImportRows: 1000,
    importBatches: 1,
    discoveryMins: 30,
    trainingMins: 60,
    supportDays: 7,
    deliveryDays: 5,
    inclusions: [
      'Up to 5 users',
      '1 sales pipeline, up to 8 stages',
      'Up to 15 custom fields',
      'Up to 3 automations',
      '1 dashboard',
      'Import of up to 1,000 rows',
      '30-min discovery call + 60-min training',
      '7 days of support after launch',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Pipedrive QuickStart Plus',
    priceGbp: 1995,
    maxUsers: 10,
    maxPipelines: 2,
    maxStagesPerPipeline: 8,
    maxCustomFields: 30,
    maxRecipes: 8,
    maxDashboards: 2,
    maxImportRows: 5000,
    importBatches: 2,
    discoveryMins: 60,
    trainingMins: 90,
    supportDays: 14,
    deliveryDays: 10,
    inclusions: [
      'Up to 10 users',
      '2 sales pipelines, up to 8 stages each',
      'Up to 30 custom fields',
      'Up to 8 automations',
      '2 dashboards',
      'Import of up to 5,000 rows in 2 batches',
      '60-min discovery call + 90-min training',
      '14 days of support after launch',
    ],
  },
}

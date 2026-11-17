import { getOnboarding, saveDraft } from '@/lib/quickstart/onboarding/handlers'

type Ctx = { params: Promise<{ token: string }> }

export async function GET(req: Request, { params }: Ctx) {
  return getOnboarding(req, (await params).token)
}

export async function PUT(req: Request, { params }: Ctx) {
  return saveDraft(req, (await params).token)
}

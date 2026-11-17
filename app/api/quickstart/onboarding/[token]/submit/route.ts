import { submitOnboarding } from '@/lib/quickstart/onboarding/handlers'

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  return submitOnboarding(req, (await params).token)
}

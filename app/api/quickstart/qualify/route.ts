import { handleQualify } from '@/lib/quickstart/qualify'

export async function POST(req: Request) {
  return handleQualify(req)
}

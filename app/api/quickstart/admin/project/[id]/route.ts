import { adminCookieFromRequest, isAdminCookie } from '@/lib/quickstart/adminAuth'
import { exportProject } from '@/lib/quickstart/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminCookie(adminCookieFromRequest(req))) {
    return Response.json({ ok: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }
  const { id } = await params
  const project = await exportProject(id)
  if (!project) return Response.json({ ok: false }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  return new Response(JSON.stringify(project, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="quickstart-${project.project_id}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}

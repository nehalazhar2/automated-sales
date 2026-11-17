import type { PackageId } from './packages'
import type { Outcome, ReasonCode } from './qualification/routing'

export type Project = {
  schema_version: '1.0'
  project_id: string
  created_at: string
  updated_at: string
  test_mode: boolean
  contact: { name: string; email: string; company: string }
  qualification: {
    answers: Record<string, unknown>
    candidate: Outcome
    reason_codes: ReasonCode[]
    explanation: string[]
    scope_version: string
    submission_id: string
    approved_package: PackageId | null
    approval_status: 'pending' | 'approved'
    override_rationale: string | null
  }
  onboarding: {
    token_hash: string | null
    token_expires_at: string | null
    status: 'not_sent' | 'draft' | 'submitted'
    answers: Record<string, unknown>
    scope_exceptions: string[]
    /** Last customer save/submit; used to reject stale tabs. Not bumped by admin actions. */
    saved_at?: string | null
    versions: { at: string; answers: Record<string, unknown> }[]
  }
  sync: {
    pipedrive_person_id?: number
    pipedrive_lead_id?: string
    pipedrive_lead_url?: string
    pipedrive_lead_archived?: boolean
    pipedrive_deal_id?: number
    pipedrive_deal_url?: string
    error?: string
  }
  approvals: { at: string; by: string; action: string; detail: string }[]
  blueprint: null
}

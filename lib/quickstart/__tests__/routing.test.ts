import { describe, it, expect } from 'vitest';
import { routeQualification } from '../qualification/routing';
import type { QualAnswers } from '../qualification/schema';

// Simple fresh-start baseline (pruned: no migration detail, no workflow_count).
const base: QualAnswers = {
  name: 'Ada', email: 'ada@example.com', company: 'Analytical Ltd',
  referral: 'direct',
  current_system: 'none',
  pipedrive_status: 'not_started',
  users_now: '1_5', users_future: '1_5',
  teams: 'one', sales_processes: 'one', process_agreed: 'yes', complexity: 'no',
  migration: 'no',
  workflows: 'none',
  connections: ['none'],
  permissions: 'standard', reporting: 'standard', deadline: 'flexible',
};
const mk = (o: Partial<QualAnswers>): Partial<QualAnswers> => ({ ...base, ...o });

describe('routeQualification acceptance (brief §7)', () => {
  it('3 users, one process, no data, no integrations -> quickstart', () => {
    const r = routeQualification(mk({}));
    expect(r.outcome).toBe('quickstart');
    expect(r.reasons).toEqual(['FITS_QUICKSTART']);
  });
  it('5 users, 1,000 clean rows, 3 workflows -> quickstart', () => {
    const r = routeQualification(mk({
      current_system: 'spreadsheet',
      migration: 'yes', records: 'up_to_1000', data_types: ['contacts', 'companies'], clean_export: 'yes',
      workflows: 'simple', workflow_count: '1_3',
    }));
    expect(r.outcome).toBe('quickstart');
    expect(r.reasons).toEqual(['FITS_QUICKSTART']);
  });
  it('6 users, one process, clean -> plus', () => {
    const r = routeQualification(mk({ users_now: '6_10', users_future: '6_10' }));
    expect(r.outcome).toBe('plus');
    expect(r.reasons).toEqual(['FITS_PLUS']);
  });
  it('10 users, 2 processes, 5,000 rows, 8 workflows -> plus', () => {
    const r = routeQualification(mk({
      users_now: '6_10', users_future: '6_10', sales_processes: 'two',
      migration: 'yes', records: '1001_5000', data_types: ['contacts'], clean_export: 'yes',
      workflows: 'simple', workflow_count: '4_8', reporting: 'two_dashboards',
    }));
    expect(r.outcome).toBe('plus');
  });
  it('11 users -> bespoke USERS_11_PLUS', () => {
    const r = routeQualification(mk({ users_now: '11_20', users_future: '11_20' }));
    expect(r.outcome).toBe('bespoke');
    expect(r.reasons).toContain('USERS_11_PLUS');
  });
  it('HubSpot with no migration, otherwise simple -> quickstart', () => {
    expect(routeQualification(mk({ current_system: 'hubspot' })).outcome).toBe('quickstart');
  });
  it('HubSpot 500 clean rows -> review EXTERNAL_CRM_EXPORT', () => {
    const r = routeQualification(mk({
      current_system: 'hubspot', migration: 'yes', records: 'up_to_1000',
      data_types: ['contacts'], clean_export: 'yes',
    }));
    expect(r.outcome).toBe('review');
    expect(r.reasons).toContain('EXTERNAL_CRM_EXPORT');
  });
  it('Salesforce + attachments -> bespoke HISTORICAL_DATA', () => {
    const r = routeQualification(mk({
      current_system: 'salesforce', migration: 'yes', records: 'up_to_1000',
      data_types: ['contacts', 'attachments'], clean_export: 'yes',
    }));
    expect(r.outcome).toBe('bespoke');
    expect(r.reasons).toContain('HISTORICAL_DATA');
    expect(r.reasons).toContain('EXTERNAL_CRM_EXPORT'); // staff see everything
  });
  it('live Pipedrive with complex setup -> review or bespoke, never auto-fit', () => {
    const r = routeQualification(mk({
      current_system: 'pipedrive', pipedrive_status: 'live', existing_configuration: 'complex_unclear',
    }));
    expect(['review', 'bespoke']).toContain(r.outcome);
    expect(r.reasons).toContain('LIVE_PIPEDRIVE');
  });
  it('unknown records -> review UNKNOWN_RECORDS', () => {
    const r = routeQualification(mk({ migration: 'yes', records: 'not_sure', data_types: ['contacts'], clean_export: 'yes' }));
    expect(r.outcome).toBe('review');
    expect(r.reasons).toContain('UNKNOWN_RECORDS');
  });
  it('3 users now, 21+ in 90 days -> review FUTURE_ROLLOUT', () => {
    const r = routeQualification(mk({ users_future: '21_plus' }));
    expect(r.outcome).toBe('review');
    expect(r.reasons).toContain('FUTURE_ROLLOUT');
  });
  it('existingOpportunity on a quickstart fit -> review EXISTING_OPPORTUNITY', () => {
    const r = routeQualification(mk({}), { existingOpportunity: true });
    expect(r.outcome).toBe('review');
    expect(r.reasons).toEqual(['EXISTING_OPPORTUNITY']);
  });
});

describe('routeQualification rules', () => {
  it('each bespoke flag fires', () => {
    const cases: [Partial<QualAnswers>, string][] = [
      [{ sales_processes: 'three_plus' }, 'THREE_PLUS_PROCESSES'],
      [{ teams: 'multiple' }, 'MULTI_TEAM'],
      [{ process_agreed: 'needs_design' }, 'PROCESS_DESIGN'],
      [{ complexity: 'yes' }, 'COMPLEX_WORKFLOWS'],
      [{ workflows: 'advanced' }, 'COMPLEX_WORKFLOWS'],
      [{ permissions: 'custom' }, 'COMPLEX_PERMISSIONS'],
      [{ reporting: 'bespoke' }, 'COMPLEX_REPORTING'],
      [{ connections: ['accounting'] }, 'EXTERNAL_INTEGRATIONS'],
      [{ migration: 'yes', records: '5001_plus', data_types: ['contacts'], clean_export: 'yes' }, 'ROWS_5001_PLUS'],
      [{ migration: 'yes', records: 'up_to_1000', data_types: ['contacts'], clean_export: 'no' }, 'DATA_NOT_CLEAN'],
    ];
    for (const [o, code] of cases) {
      const r = routeQualification(mk(o));
      expect(r.outcome, code).toBe('bespoke');
      expect(r.reasons, code).toContain(code);
    }
  });
  it('connections: personal_sync is fine; not_sure is review; none+personal_sync fits', () => {
    expect(routeQualification(mk({ connections: ['personal_sync'] })).outcome).toBe('quickstart');
    const r = routeQualification(mk({ connections: ['not_sure'] }));
    expect(r.outcome).toBe('review');
    expect(r.reasons).toContain('UNKNOWN_CONNECTIONS');
  });
  it('historical deals alone -> review', () => {
    const r = routeQualification(mk({
      migration: 'yes', records: 'up_to_1000', data_types: ['contacts', 'historical_deals'], clean_export: 'yes',
    }));
    expect(r.outcome).toBe('review');
    expect(r.reasons).toContain('HISTORICAL_DEALS');
  });
  it('free text -> review FREE_TEXT; whitespace-only does not', () => {
    expect(routeQualification(mk({ additional: 'We also have a legacy ERP' })).reasons).toContain('FREE_TEXT');
    expect(routeQualification(mk({ additional: '   ' })).outcome).toBe('quickstart');
  });
  it('within_week deadline -> review TIGHT_DEADLINE', () => {
    const r = routeQualification(mk({ deadline: 'within_week' }));
    expect(r.outcome).toBe('review');
    expect(r.reasons).toContain('TIGHT_DEADLINE');
  });
  it('not_sure on scope keys -> UNKNOWN_<KEY>, never treated as no', () => {
    const keys = ['users_now', 'teams', 'sales_processes', 'process_agreed', 'complexity', 'workflows', 'permissions', 'reporting', 'current_system', 'pipedrive_status', 'users_future'] as const;
    for (const k of keys) {
      const r = routeQualification(mk({ [k]: 'not_sure' } as Partial<QualAnswers>));
      expect(r.outcome, k).toBe('review');
      expect(r.reasons, k).toContain(`UNKNOWN_${k.toUpperCase()}`);
    }
    const m = routeQualification(mk({ migration: 'not_sure', records: 'not_sure', clean_export: 'not_sure', data_types: ['contacts'] }));
    expect(m.reasons).toEqual(expect.arrayContaining(['UNKNOWN_MIGRATION', 'UNKNOWN_RECORDS', 'UNKNOWN_CLEAN_EXPORT']));
    const w = routeQualification(mk({ workflows: 'simple', workflow_count: 'not_sure' }));
    expect(w.reasons).toContain('UNKNOWN_WORKFLOW_COUNT');
  });
  it('migration not_sure with no follow-ups -> review UNKNOWN_MIGRATION', () => {
    const r = routeQualification(mk({ migration: 'not_sure' }));
    expect(r.outcome).toBe('review');
    expect(r.reasons).toContain('UNKNOWN_MIGRATION');
    expect(r.reasons).not.toContain('UNKNOWN_RECORDS');
    expect(r.reasons).not.toContain('UNKNOWN_CLEAN_EXPORT');
  });
  it('existing_configuration not_sure -> review; active/automations/complex -> LIVE_PIPEDRIVE review', () => {
    expect(routeQualification(mk({ pipedrive_status: 'trial', existing_configuration: 'not_sure' })).reasons)
      .toContain('UNKNOWN_EXISTING_CONFIGURATION');
    for (const c of ['active_live', 'automations_integrations', 'complex_unclear'] as const) {
      const r = routeQualification(mk({ pipedrive_status: 'trial', existing_configuration: c }));
      expect(r.outcome, c).toBe('review');
      expect(r.reasons).toContain('LIVE_PIPEDRIVE');
    }
    expect(routeQualification(mk({ pipedrive_status: 'trial', existing_configuration: 'basic_test_data' })).outcome).toBe('quickstart');
  });
  it('absent conditional keys are not treated as not_sure', () => {
    const r = routeQualification(mk({}));
    expect(r.reasons.some((c) => c.startsWith('UNKNOWN_'))).toBe(false);
  });
  it('future users lower than current -> CONFLICTING_ANSWERS review', () => {
    const r = routeQualification(mk({ users_now: '6_10', users_future: '1_5' }));
    expect(r.outcome).toBe('review');
    expect(r.reasons).toContain('CONFLICTING_ANSWERS');
  });
  it('9+ simple workflows exceeds Plus -> bespoke EXCEEDS_PLUS', () => {
    const r = routeQualification(mk({ workflows: 'simple', workflow_count: '9_plus' }));
    expect(r.outcome).toBe('bespoke');
    expect(r.reasons).toEqual(['EXCEEDS_PLUS']);
  });
  it('bespoke includes review flags too, bespoke first; explanation parallels reasons', () => {
    const r = routeQualification(mk({ teams: 'multiple', deadline: 'within_week', additional: 'x' }), { existingOpportunity: true });
    expect(r.outcome).toBe('bespoke');
    expect(r.reasons).toEqual(['MULTI_TEAM', 'TIGHT_DEADLINE', 'FREE_TEXT', 'EXISTING_OPPORTUNITY']);
    expect(r.explanation).toHaveLength(r.reasons.length);
    expect(r.explanation.every((s) => typeof s === 'string' && s.length > 10)).toBe(true);
  });
  it('is deterministic', () => {
    const a = mk({ teams: 'multiple', users_future: '21_plus' });
    expect(routeQualification(a)).toEqual(routeQualification(a));
  });
});

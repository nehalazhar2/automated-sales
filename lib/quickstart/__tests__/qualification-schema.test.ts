import { describe, it, expect } from 'vitest';
import { QUESTIONS, STEPS } from '../qualification/questions';
import {
  qualAnswersSchema,
  qualSubmitSchema,
  pruneHidden,
  validateVisibleRequired,
  type QualAnswers,
} from '../qualification/schema';

const base: QualAnswers = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Ltd',
  website: 'https://example.com',
  referral: 'pipedrive',
  referral_detail: 'Sam / ABC123',
  current_system: 'spreadsheet',
  pipedrive_status: 'not_started',
  users_now: '1_5',
  users_future: '1_5',
  teams: 'one',
  sales_processes: 'one',
  process_agreed: 'yes',
  complexity: 'no',
  migration: 'no',
  workflows: 'none',
  connections: ['none'],
  permissions: 'standard',
  reporting: 'standard',
  deadline: 'flexible',
  additional: '',
};

describe('qualification schema', () => {
  it('parses a valid full answer set', () => {
    expect(qualAnswersSchema.safeParse(base).success).toBe(true);
    expect(validateVisibleRequired(base)).toEqual({});
  });

  it('rejects a bad email', () => {
    expect(qualAnswersSchema.safeParse({ ...base, email: 'nope' }).success).toBe(false);
  });

  it('rejects an invalid enum value', () => {
    expect(qualAnswersSchema.safeParse({ ...base, users_now: '1-5' }).success).toBe(false);
  });

  it('accepts empty optional fields', () => {
    const r = qualAnswersSchema.safeParse({ ...base, website: '', referral_detail: '', additional: '' });
    expect(r.success).toBe(true);
  });

  it('pruneHidden drops migration detail when migration=no', () => {
    const a = { ...base, migration: 'no', records: 'up_to_1000', data_types: ['contacts'], clean_export: 'yes' } as Partial<QualAnswers>;
    const p = pruneHidden(a);
    expect(p).not.toHaveProperty('records');
    expect(p).not.toHaveProperty('data_types');
    expect(p).not.toHaveProperty('clean_export');
  });

  it('pruneHidden keeps migration detail only when migration is yes', () => {
    const p = pruneHidden({ ...base, migration: 'yes', records: 'up_to_1000', data_types: ['contacts'], clean_export: 'yes' });
    expect(p.records).toBe('up_to_1000');
    expect(p.data_types).toEqual(['contacts']);
    expect(p.clean_export).toBe('yes');
  });

  it('pruneHidden drops migration detail when migration is not_sure', () => {
    const p = pruneHidden({ ...base, migration: 'not_sure', records: 'up_to_1000', data_types: ['contacts'], clean_export: 'yes' });
    expect(p.migration).toBe('not_sure');
    expect(p).not.toHaveProperty('records');
    expect(p).not.toHaveProperty('data_types');
    expect(p).not.toHaveProperty('clean_export');
    expect(validateVisibleRequired({ ...base, migration: 'not_sure' })).toEqual({});
  });

  it('pruneHidden drops workflow_count unless workflows=simple', () => {
    expect(pruneHidden({ ...base, workflows: 'advanced', workflow_count: '1_3' })).not.toHaveProperty('workflow_count');
    expect(pruneHidden({ ...base, workflows: 'simple', workflow_count: '1_3' }).workflow_count).toBe('1_3');
  });

  it('pruneHidden drops existing_configuration when pipedrive_status=not_started', () => {
    const a = { ...base, pipedrive_status: 'not_started', existing_configuration: 'basic_test_data' } as Partial<QualAnswers>;
    expect(pruneHidden(a)).not.toHaveProperty('existing_configuration');
    for (const s of ['trial', 'new_paid', 'live'] as const) {
      expect(pruneHidden({ ...a, pipedrive_status: s }).existing_configuration).toBe('basic_test_data');
    }
  });

  it('pruneHidden drops existing_configuration when pipedrive_status=not_sure', () => {
    const a = { ...base, pipedrive_status: 'not_sure', existing_configuration: 'basic_test_data' } as Partial<QualAnswers>;
    expect(pruneHidden(a)).not.toHaveProperty('existing_configuration');
    expect(validateVisibleRequired({ ...base, pipedrive_status: 'not_sure' })).not.toHaveProperty('existing_configuration');
  });

  it('reports missing required visible fields', () => {
    const { name, ...rest } = base;
    void name;
    expect(validateVisibleRequired(rest)).toHaveProperty('name');
    const live = { ...base, pipedrive_status: 'live' } as Partial<QualAnswers>;
    expect(validateVisibleRequired(live)).toHaveProperty('existing_configuration');
    const mig = { ...base, migration: 'yes' } as Partial<QualAnswers>;
    const errs = validateVisibleRequired(mig);
    expect(errs).toHaveProperty('records');
    expect(errs).toHaveProperty('data_types');
    expect(errs).toHaveProperty('clean_export');
    expect(validateVisibleRequired({ ...base, workflows: 'simple' })).toHaveProperty('workflow_count');
  });

  it('does not report hidden fields and requires >=1 connection', () => {
    expect(validateVisibleRequired(base)).not.toHaveProperty('records');
    expect(validateVisibleRequired({ ...base, connections: [] })).toHaveProperty('connections');
    expect(validateVisibleRequired({ ...base, migration: 'yes', records: 'up_to_1000', clean_export: 'yes', data_types: [] })).toHaveProperty('data_types');
  });

  it('qualSubmitSchema requires uuid, empty honeypot and complete answers', () => {
    const id = '123e4567-e89b-42d3-a456-426614174000';
    expect(qualSubmitSchema.safeParse({ submissionId: id, answers: base, honeypot: '' }).success).toBe(true);
    expect(qualSubmitSchema.safeParse({ submissionId: 'x', answers: base, honeypot: '' }).success).toBe(false);
    expect(qualSubmitSchema.safeParse({ submissionId: id, answers: base, honeypot: 'bot' }).success).toBe(false);
    const { company, ...rest } = base;
    void company;
    expect(qualSubmitSchema.safeParse({ submissionId: id, answers: rest, honeypot: '' }).success).toBe(false);
  });

  it('questions: 6 steps, unique keys, every step used, selects have options', () => {
    expect(STEPS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6]);
    const keys = QUESTIONS.map((q) => q.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.length).toBe(26);
    for (const s of STEPS) expect(QUESTIONS.some((q) => q.step === s.n)).toBe(true);
    for (const q of QUESTIONS.filter((q) => q.type === 'select' || q.type === 'multi')) {
      expect(q.options?.length).toBeGreaterThan(0);
    }
  });

  it('qualSubmitSchema prunes hidden answers from output', () => {
    const id = '123e4567-e89b-42d3-a456-426614174000';
    const r = qualSubmitSchema.safeParse({
      submissionId: id,
      answers: { ...base, migration: 'no', records: '5001_plus', data_types: ['emails'], clean_export: 'no', workflows: 'none', workflow_count: '9_plus' },
      honeypot: '',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.answers).not.toHaveProperty('records');
      expect(r.data.answers).not.toHaveProperty('data_types');
      expect(r.data.answers).not.toHaveProperty('clean_export');
      expect(r.data.answers).not.toHaveProperty('workflow_count');
    }
  });

  it('existing_configuration accepts not_sure', () => {
    const r = qualAnswersSchema.safeParse({ ...base, pipedrive_status: 'live', existing_configuration: 'not_sure' });
    expect(r.success).toBe(true);
  });

  it('website normalisation', () => {
    const w = (website: string) => qualAnswersSchema.safeParse({ ...base, website });
    const ok = w('example.com');
    expect(ok.success && ok.data.website).toBe('https://example.com');
    const keep = w('http://example.com/x');
    expect(keep.success && keep.data.website).toBe('http://example.com/x');
    const blank = w('  ');
    expect(blank.success && blank.data.website).toBe('');
    expect(w('javascript:alert(1)').success).toBe(false);
    expect(w('ftp://example.com').success).toBe(false);
  });
});

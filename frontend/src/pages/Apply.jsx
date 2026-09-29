import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';
import { api } from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/ui/PageHeader';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';

const SCHEMES = [
  { id: 'scholarship', name: 'Higher Education Scholarship', dept: 'Education & Revenue', desc: 'Income-based scholarship for undergraduate and postgraduate students.' },
  { id: 'health', name: 'Healthcare Subsidy Scheme', dept: 'Health & Revenue', desc: 'Subsidised treatment for eligible low-income households.' },
  { id: 'housing', name: 'Municipal Housing Assistance', dept: 'Municipal & Revenue', desc: 'Financial assistance for verified municipal residents.' },
];

export default function Apply() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const scheme = SCHEMES.find((s) => s.id === selected);

  const handleSubmit = async () => {
    if (!scheme) return;
    setSubmitting(true);
    try {
      const app = await api.createApplication(user.id, scheme.name);
      navigate(`/application/${app.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageHeader eyebrow="New application" title="Choose a service" subtitle="SETU coordinates verification with each participating department after you submit." />

      <Section label="Available schemes">
        <div className="border border-[var(--border)] rounded-[var(--r-md)]">
          {SCHEMES.map((s) => {
            const isSelected = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className="w-full text-left px-5 py-4 border-b border-[var(--border)] last:border-b-0 flex items-start justify-between gap-6"
                style={{ background: isSelected ? 'var(--surface-sunken)' : 'transparent' }}
              >
                <div>
                  <p className="eyebrow mb-1.5" style={{ color: isSelected ? 'var(--teal-700)' : undefined }}>
                    {s.dept}
                  </p>
                  <h3 className="text-[0.95rem] font-semibold text-[var(--ink)]">{s.name}</h3>
                  <p className="text-sm text-[var(--ink-faint)] mt-1 max-w-lg">{s.desc}</p>
                </div>
                <span
                  className="mt-1 w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0"
                  style={{
                    borderColor: isSelected ? 'var(--teal-700)' : 'var(--border-strong)',
                    background: isSelected ? 'var(--teal-700)' : 'transparent',
                  }}
                >
                  {isSelected && <span className="text-white text-[0.6rem] leading-none">✓</span>}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {scheme && (
        <Section label="Applicant details">
          <div className="max-w-xl">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5 border border-[var(--border)] rounded-[var(--r-md)] px-5 py-4">
              <div>
                <dt className="text-xs text-[var(--ink-faint)]">Full name</dt>
                <dd className="text-sm text-[var(--ink)] mt-0.5">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-faint)]">Date of birth</dt>
                <dd className="text-sm text-[var(--ink)] mt-0.5">{user?.dob}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-faint)]">Mobile number</dt>
                <dd className="text-sm text-[var(--ink)] mt-0.5">{user?.mobile}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-faint)]">Scheme</dt>
                <dd className="text-sm text-[var(--ink)] mt-0.5">{scheme.name}</dd>
              </div>
            </dl>
            <Field
              as="textarea"
              label="Additional remarks (optional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              placeholder="Any supporting information…"
              className="mb-5"
              style={{ resize: 'vertical' }}
            />
            <Button onClick={handleSubmit} loading={submitting}>
              Submit application
            </Button>
          </div>
        </Section>
      )}
    </Layout>
  );
}

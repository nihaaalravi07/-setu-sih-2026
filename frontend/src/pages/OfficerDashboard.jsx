import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Layout from '../components/Layout';
import PageHeader from '../components/ui/PageHeader';
import Section from '../components/ui/Section';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import EmptyState from '../components/ui/EmptyState';
import PageSkeleton from '../components/ui/Skeleton';

function Metric({ label, value, tone }) {
  return (
    <div className="flex-1 min-w-[130px] px-5 py-3">
      <p className="eyebrow mb-1">{label}</p>
      <p className="font-mono-setu text-xl font-semibold tabular-nums" style={{ color: tone || 'var(--ink)' }}>
        {value}
      </p>
    </div>
  );
}

export default function OfficerDashboard() {
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.officerDashboard().then(setData);
    api.officerReviews().then(setReviews);
  }, []);

  if (!data || !reviews) {
    return (
      <Layout>
        <PageSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader eyebrow="SETU Operations" title="Officer dashboard" subtitle="Applications, verification status and identity reviews across all departments." />

      <Section>
        <div className="flex divide-x divide-[var(--border)] border border-[var(--border)] rounded-[var(--r-md)] overflow-x-auto">
          <Metric label="Total applications" value={data.stats.total_applications} />
          <Metric label="Pending" value={data.stats.pending_applications} tone={data.stats.pending_applications > 0 ? 'var(--warning)' : undefined} />
          <Metric label="Verified" value={data.stats.verified_applications} tone={data.stats.verified_applications > 0 ? 'var(--success)' : undefined} />
          <Metric label="Identity reviews" value={data.stats.identity_reviews} tone={data.stats.identity_reviews > 0 ? 'var(--warning)' : undefined} />
        </div>
      </Section>

      {reviews.length > 0 && (
        <Section label="Identity review queue">
          <Table
            columns={[
              { key: 'case', header: 'Case', render: (r) => <span className="font-mono-setu text-xs">{String(r.application_id).padStart(4, '0')}</span> },
              { key: 'citizen_name', header: 'Citizen' },
              { key: 'confidence_score', header: 'Confidence', render: (r) => <span className="font-mono-setu text-sm font-semibold" style={{ color: 'var(--warning)' }}>{r.confidence_score}%</span> },
              { key: 'issue', header: 'Issue', render: (r) => <span className="text-[var(--ink-muted)]">{r.department} department mismatch</span> },
              { key: 'status', header: 'Status', render: () => <Badge status="pending_review" /> },
              {
                key: 'action',
                header: '',
                render: () => (
                  <button onClick={() => navigate('/officer/reviews')} className="text-xs font-medium text-[var(--teal-700)] hover:underline">
                    Open review →
                  </button>
                ),
              },
            ]}
            rows={reviews}
            rowKey={(r) => r.id}
          />
        </Section>
      )}

      <Section label="Recent applications">
        {data.applications.length === 0 ? (
          <EmptyState title="No applications yet" description="Applications will appear here as citizens submit them." />
        ) : (
          <Table
            columns={[
              { key: 'id', header: 'Case', render: (a) => <span className="font-mono-setu text-xs">{String(a.id).padStart(4, '0')}</span> },
              { key: 'citizen_name', header: 'Citizen' },
              { key: 'scheme_name', header: 'Scheme' },
              { key: 'created_at', header: 'Submitted', render: (a) => <span className="font-mono-setu text-xs text-[var(--ink-faint)]">{new Date(a.created_at).toLocaleDateString()}</span> },
              { key: 'status', header: 'Status', render: (a) => <Badge status={a.status} /> },
              {
                key: 'action',
                header: '',
                render: (a) => (
                  <button onClick={() => navigate(`/application/${a.id}`)} className="text-xs font-medium text-[var(--teal-700)] hover:underline">
                    Open →
                  </button>
                ),
              },
            ]}
            rows={data.applications}
          />
        )}
      </Section>
    </Layout>
  );
}

import { useState } from 'react';
import { useActivity } from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { Select } from '../../components/ui/Input.jsx';
import { ActivityItem } from '../../components/domain/ActivityItem.jsx';
import { Loading, Empty } from '../../components/ui/Empty.jsx';

const TYPES = [
  '',
  'TASK_CREATED',
  'TASK_ASSIGNED',
  'TASK_STARTED',
  'TASK_SUBMITTED',
  'TASK_REVIEWED',
  'POINTS_AWARDED',
  'PENALTY_ISSUED',
  'USER_LOGIN',
  'USER_CREATED',
];

export default function ActivityLog() {
  const [type, setType] = useState('');
  const { data, isLoading } = useActivity({ type, limit: 200 });

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps">System</div>
        <h1 className="mt-1 text-2xl font-bold">Activity log</h1>
      </div>

      <div className="flex gap-3">
        <div className="w-64">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t || 'All event types'}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : !data?.items?.length ? (
        <Empty icon="history" title="No activity recorded" />
      ) : (
        <GlassCard>
          {data.items.map((a) => (
            <ActivityItem key={a.id} item={a} />
          ))}
        </GlassCard>
      )}
    </div>
  );
}

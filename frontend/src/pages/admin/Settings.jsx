import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSettings, useUpdateSetting, useRunFaultScan } from '../../api/hooks.js';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Loading } from '../../components/ui/Empty.jsx';

const FIELDS = [
  {
    key: 'general_task_points',
    label: 'General task points',
    hint: 'Awarded when a GENERAL task is approved.',
    type: 'number',
  },
  {
    key: 'daily_completion_bonus',
    label: 'Daily completion bonus',
    hint: 'Bonus granted when an employee finishes ALL tasks due today.',
    type: 'number',
  },
  {
    key: 'late_penalty_points',
    label: 'Late submission penalty',
    hint: 'Points deducted on late but submitted tasks.',
    type: 'number',
  },
  {
    key: 'missed_penalty_points',
    label: 'Missed task penalty',
    hint: 'Points deducted when a task passes its deadline unsubmitted.',
    type: 'number',
  },
  {
    key: 'max_fault_points',
    label: 'Max fault points (cap)',
    hint: 'Total fault points an employee is allowed before performance alert triggers. Shown as "X of Y Used" on profile.',
    type: 'number',
  },
];

export default function Settings() {
  const { data, isLoading } = useSettings();
  const update = useUpdateSetting();
  const scan = useRunFaultScan();
  const [form, setForm] = useState({});
  const [thresholds, setThresholds] = useState('');

  useEffect(() => {
    if (data?.settings) {
      setForm(data.settings);
      setThresholds((data.settings.warning_thresholds || []).join(','));
    }
  }, [data?.settings]);

  if (isLoading || !data) return <Loading />;

  const save = async (key, value) => {
    try {
      await update.mutateAsync({ key, value });
      toast.success(`Saved ${key}`);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps">System</div>
        <h1 className="mt-1 text-2xl font-bold">Settings</h1>
      </div>

      <GlassCard>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className="rounded-md border border-white/5 bg-white/[0.02] p-4">
              <Input
                label={f.label}
                type={f.type}
                value={form[f.key] ?? ''}
                onChange={(e) =>
                  setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })
                }
                hint={f.hint}
              />
              <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={() => save(f.key, form[f.key])}>
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <Input
          label="Warning thresholds (comma-separated)"
          hint="Fault counts at which an employee escalates to L1 / L2 / L3 / etc."
          value={thresholds}
          onChange={(e) => setThresholds(e.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={() =>
              save(
                'warning_thresholds',
                thresholds
                  .split(',')
                  .map((s) => Number(s.trim()))
                  .filter((n) => !Number.isNaN(n) && n > 0),
              )
            }
          >
            Save thresholds
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="label-caps">Maintenance</div>
            <div className="mt-1 text-base font-semibold">Run fault scan</div>
            <p className="mt-1 max-w-md text-sm text-on-surface-variant">
              Marks past-due unsubmitted assignments as MISSED and issues penalties. Normally
              runs daily — trigger manually for verification.
            </p>
          </div>
          <Button
            variant="danger"
            loading={scan.isPending}
            onClick={async () => {
              const r = await scan.mutateAsync();
              toast.success(`Scan complete: ${r.missed} marked missed`);
            }}
          >
            Run scan now
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

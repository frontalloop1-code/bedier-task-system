import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks, useDeleteTask } from '../../api/hooks.js';
import { TaskCard } from '../../components/domain/TaskCard.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Loading, Empty } from '../../components/ui/Empty.jsx';
import { Select } from '../../components/ui/Input.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function AdminTasks() {
  const { user } = useAuth();
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const params = {};
  if (type) params.type = type;
  if (status) params.status = status;
  const { data, isLoading } = useTasks(params);
  const del = useDeleteTask();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label-caps">Catalog</div>
          <h1 className="mt-1 text-2xl font-bold">Tasks</h1>
        </div>
        <Link to="/admin/tasks/new">
          <Button leftIcon={<span className="material-symbols text-base">add</span>}>
            New task
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="w-48">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <option value="GENERAL">General</option>
            <option value="TEAM">Team</option>
            <option value="PRIVATE">Private</option>
          </Select>
        </div>
        <div className="w-48">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="MISSED">Missed</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : !data?.tasks?.length ? (
        <Empty
          icon="task_alt"
          title="No tasks match"
          hint="Try clearing filters, or create the first task."
          action={
            <Link to="/admin/tasks/new">
              <Button className="mt-3">Create task</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              to={`/tasks/${t.id}`}
              status={t.status}
              footer={
                user.role === 'SUPER_ADMIN' && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!window.confirm(`Delete "${t.title}"?`)) return;
                        await del.mutateAsync(t.id);
                        toast.success('Task deleted');
                      }}
                      className="text-xs text-error hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

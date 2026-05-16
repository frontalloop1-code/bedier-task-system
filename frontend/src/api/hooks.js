import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client.js';

const get = (url) => api.get(url).then((r) => r.data);

// Dashboards
export const useAdminDashboard = () =>
  useQuery({ queryKey: ['dashboard', 'admin'], queryFn: () => get('/dashboard/admin') });

export const useMyDashboard = () =>
  useQuery({ queryKey: ['dashboard', 'me'], queryFn: () => get('/dashboard/me'), refetchInterval: 30_000 });

// Tasks
export const useTasks = (params = {}) =>
  useQuery({
    queryKey: ['tasks', params],
    queryFn: () => api.get('/tasks', { params }).then((r) => r.data),
  });

export const useTask = (id) =>
  useQuery({
    queryKey: ['task', id],
    queryFn: () => get(`/tasks/${id}`),
    enabled: !!id,
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/tasks', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => api.patch(`/tasks/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

// Assignments
export const useMyAssignments = () =>
  useQuery({
    queryKey: ['assignments', 'me'],
    queryFn: () => get('/assignments/me'),
  });

export const useReviewQueue = () =>
  useQuery({
    queryKey: ['assignments', 'review'],
    queryFn: () => get('/assignments/review/all'),
  });

export const useStartAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/assignments/${id}/start`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['task'] });
    },
  });
};

export const useSubmitAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file, note }) => {
      const fd = new FormData();
      if (file) fd.append('proof', file);
      if (note) fd.append('note', note);
      return api
        .post(`/assignments/${id}/submit`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['task'] });
    },
  });
};

export const useReviewAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, note }) =>
      api.post(`/assignments/${id}/review`, { decision, note }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['leaderboards'] });
      qc.invalidateQueries({ queryKey: ['task'] });
    },
  });
};

// Users
export const useUsers = (params = {}) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => api.get('/users', { params }).then((r) => r.data),
  });

export const useUser = (id) =>
  useQuery({ queryKey: ['user', id], queryFn: () => get(`/users/${id}`), enabled: !!id });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/users', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => api.patch(`/users/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const usePointsHistory = (id) =>
  useQuery({
    queryKey: ['user', id, 'points'],
    queryFn: () => get(`/users/${id}/points-history`),
    enabled: !!id,
  });

// Teams
export const useTeams = () =>
  useQuery({ queryKey: ['teams'], queryFn: () => get('/teams') });

export const useTeam = (id) =>
  useQuery({ queryKey: ['team', id], queryFn: () => get(`/teams/${id}`), enabled: !!id });

export const useAssignTeamManager = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }) =>
      api.post(`/teams/${teamId}/manager`, { userId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      qc.invalidateQueries({ queryKey: ['team'] });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Leaderboards
export const useEmployeeLeaderboard = (params = {}) =>
  useQuery({
    queryKey: ['leaderboards', 'employees', params],
    queryFn: () => api.get('/leaderboards/employees', { params }).then((r) => r.data),
  });

export const useTeamLeaderboard = () =>
  useQuery({
    queryKey: ['leaderboards', 'teams'],
    queryFn: () => get('/leaderboards/teams'),
  });

export const useGlobalLeaderboard = () =>
  useQuery({
    queryKey: ['leaderboards', 'global'],
    queryFn: () => get('/leaderboards/global'),
  });

// Notifications
export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: () => get('/notifications'),
    refetchInterval: 15_000,
  });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

// Activity
export const useActivity = (params = {}) =>
  useQuery({
    queryKey: ['activity', params],
    queryFn: () => api.get('/activity', { params }).then((r) => r.data),
  });

// Settings
export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => get('/settings') });

export const useUpdateSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }) =>
      api.patch(`/settings/${key}`, { value }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
};

export const useRunFaultScan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/settings/run-fault-scan').then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
};

// Penalties
export const useIssuePenalty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/penalties', body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

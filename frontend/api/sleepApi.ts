import { useQuery } from '@tanstack/react-query';
import { SleepEntry, SleepStats } from '../types/sleep';

// API base URL - replace with actual API endpoint when ready
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Fetches sleep entries for a specific date range
 */
const fetchSleepEntries = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<SleepEntry[]> => {
  const response = await fetch(
    `${API_BASE_URL}/sleep/${userId}?startDate=${startDate}&endDate=${endDate}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch sleep data: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetches sleep statistics for a user
 */
const fetchSleepStats = async (userId: string): Promise<SleepStats> => {
  const response = await fetch(`${API_BASE_URL}/sleep/statistics/${userId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch sleep statistics: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Adds a new sleep entry
 */
// Future implementation - uncomment when ready to add data entry features
// const addSleepEntry = async (sleepEntry: Omit<SleepEntry, 'id'>): Promise<SleepEntry> => {
//   const response = await fetch(`${API_BASE_URL}/sleep`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(sleepEntry),
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to add sleep entry: ${response.statusText}`);
//   }

//   return response.json();
// };

/**
 * Updates an existing sleep entry
 */
// Future implementation - uncomment when ready to add data entry features
// const updateSleepEntry = async (sleepEntry: SleepEntry): Promise<SleepEntry> => {
//   const response = await fetch(`${API_BASE_URL}/sleep/${sleepEntry.id}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(sleepEntry),
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to update sleep entry: ${response.statusText}`);
//   }

//   return response.json();
// };

/**
 * Deletes a sleep entry
 */
// Future implementation - uncomment when ready to add data entry features
// const deleteSleepEntry = async (sleepEntryId: string): Promise<void> => {
//   const response = await fetch(`${API_BASE_URL}/sleep/${sleepEntryId}`, {
//     method: 'DELETE',
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to delete sleep entry: ${response.statusText}`);
//   }
// };

// React Query hooks

/**
 * Hook to fetch sleep entries for a specific date range
 */
export const useSleepEntries = (userId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['sleepEntries', userId, startDate, endDate],
    queryFn: () => fetchSleepEntries(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
  });
};

/**
 * Hook to fetch sleep statistics
 */
export const useSleepStats = (userId: string) => {
  return useQuery({
    queryKey: ['sleepStats', userId],
    queryFn: () => fetchSleepStats(userId),
    enabled: !!userId,
  });
};

/**
 * Hook to add a new sleep entry
 */
// export const useAddSleepEntry = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: addSleepEntry,
//     onSuccess: () => {
//       // Invalidate relevant queries after adding a new sleep entry
//       queryClient.invalidateQueries({ queryKey: ['sleepEntries'] });
//       queryClient.invalidateQueries({ queryKey: ['sleepStats'] });
//     },
//   });
// };

/**
 * Hook to update an existing sleep entry
 */
// export const useUpdateSleepEntry = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: updateSleepEntry,
//     onSuccess: (data) => {
//       // Invalidate relevant queries after updating a sleep entry
//       queryClient.invalidateQueries({ queryKey: ['sleepEntries'] });
//       queryClient.invalidateQueries({ queryKey: ['sleepStats'] });
//     },
//   });
// };

/**
 * Hook to delete a sleep entry
 */
// export const useDeleteSleepEntry = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: deleteSleepEntry,
//     onSuccess: () => {
//       // Invalidate relevant queries after deleting a sleep entry
//       queryClient.invalidateQueries({ queryKey: ['sleepEntries'] });
//       queryClient.invalidateQueries({ queryKey: ['sleepStats'] });
//     },
//   });
// };

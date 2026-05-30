import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { adminApi, type AdminMe } from "./api";

export const ADMIN_ME_KEY = ["admin", "me"];

export function useAdminMe() {
  return useQuery<{ admin: AdminMe } | null>({
    queryKey: ADMIN_ME_KEY,
    queryFn: async () => {
      try {
        return await adminApi.me();
      } catch {
        return null;
      }
    },
    staleTime: 30_000,
    retry: false,
  });
}

export function useAdminLogin() {
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      adminApi.login(email, password),
    onSuccess: (data) => {
      qc.setQueryData(ADMIN_ME_KEY, data);
      setLocation("/admin");
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; email: string }) =>
      adminApi.updateProfile(body),
    onSuccess: (data) => {
      qc.setQueryData(ADMIN_ME_KEY, data);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      adminApi.changePassword(body),
  });
}

export function useAdminLogout() {
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  return useMutation({
    mutationFn: () => adminApi.logout(),
    onSuccess: () => {
      qc.setQueryData(ADMIN_ME_KEY, null);
      qc.clear();
      setLocation("/admin/login");
    },
  });
}

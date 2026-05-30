import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminMe, useUpdateProfile, useChangePassword } from "../lib/use-admin";

export default function AdminSettings() {
  const { data } = useAdminMe();
  const admin = data?.admin;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  useEffect(() => {
    if (admin) {
      setName(admin.name);
      setEmail(admin.email);
    }
  }, [admin]);

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate(
      { name, email },
      {
        onSuccess: () => toast.success("Profile updated successfully"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success("Password changed successfully");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update your name, email address, and password.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Profile
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Change your display name and login email
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This is the email you use to log in.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                "Saving..."
              ) : updateProfile.isSuccess ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Saved
                </span>
              ) : (
                "Save profile"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Password
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Must be at least 8 characters
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSave} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? "Changing..." : "Change password"}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Current session
        </div>
        <div className="flex items-center gap-4">
          <div className="grid place-items-center w-10 h-10 rounded-full bg-emerald-600 text-white font-semibold text-sm">
            {admin?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {admin?.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {admin?.email} &middot;{" "}
              <span className="capitalize">
                {admin?.role?.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

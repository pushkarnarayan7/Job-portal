import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface Preference {
  id: string;
  label: string;
  description: string;
}

const preferences: Preference[] = [
  {
    id: "email-alerts",
    label: "Email job alerts",
    description: "Receive a daily digest of new jobs that match your profile.",
  },
  {
    id: "application-updates",
    label: "Application updates",
    description: "Get notified when a recruiter views or updates your application.",
  },
  {
    id: "marketing",
    label: "Product news",
    description: "Occasional updates about new TalentHub features.",
  },
];

export function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    "email-alerts": true,
    "application-updates": true,
    marketing: false,
  });
  const [confirmClear, setConfirmClear] = useState(false);

  const toggle = (id: string) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const clearLocalData = () => {
    localStorage.clear();
    setConfirmClear(false);
    logout();
    toast.success("Local data cleared");
    navigate("/");
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-slate-500">Manage your notification and account preferences.</p>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-card">
        <h2 className="border-b border-slate-100 px-6 py-4 font-semibold text-slate-900">
          Notifications
        </h2>
        {preferences.map((pref) => (
          <div
            key={pref.id}
            className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 last:border-0"
          >
            <div>
              <p className="font-medium text-slate-900">{pref.label}</p>
              <p className="text-sm text-slate-500">{pref.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled[pref.id]}
              aria-label={pref.label}
              onClick={() => toggle(pref.id)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                enabled[pref.id] ? "bg-primary-600" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  enabled[pref.id] ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-red-200 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-sm text-slate-500">
          Clears your saved jobs, applications, notifications, and profile stored in this
          browser, and signs you out.
        </p>
        <Button variant="danger" className="mt-4" onClick={() => setConfirmClear(true)}>
          Clear local data
        </Button>
      </section>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all local data?"
      >
        <p className="text-sm text-slate-600">
          This removes your saved jobs, applications, notifications, and profile from this
          browser. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmClear(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={clearLocalData}>
            Yes, clear everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}

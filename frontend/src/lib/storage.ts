import type { LocalApplication, LocalNotification } from "@/types";

/**
 * The backend currently has no endpoints for bookmarks, applications,
 * notifications, or user profiles. These helpers persist that data in
 * localStorage so the UX is complete; swap them for API calls when the
 * corresponding endpoints exist.
 */

const KEYS = {
  bookmarks: "jobportal.bookmarks",
  applications: "jobportal.applications",
  notifications: "jobportal.notifications",
  profile: "jobportal.profile",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const bookmarkStore = {
  getAll(): string[] {
    return read<string[]>(KEYS.bookmarks, []);
  },
  has(jobId: string): boolean {
    return this.getAll().includes(jobId);
  },
  toggle(jobId: string): boolean {
    const all = this.getAll();
    const idx = all.indexOf(jobId);
    if (idx >= 0) {
      all.splice(idx, 1);
      write(KEYS.bookmarks, all);
      return false;
    }
    all.push(jobId);
    write(KEYS.bookmarks, all);
    return true;
  },
};

export const applicationStore = {
  getAll(): LocalApplication[] {
    return read<LocalApplication[]>(KEYS.applications, []);
  },
  has(jobId: string): boolean {
    return this.getAll().some((a) => a.jobId === jobId);
  },
  add(app: LocalApplication): void {
    const all = this.getAll();
    if (!all.some((a) => a.jobId === app.jobId)) {
      all.unshift(app);
      write(KEYS.applications, all);
    }
  },
};

export const notificationStore = {
  getAll(): LocalNotification[] {
    return read<LocalNotification[]>(KEYS.notifications, []);
  },
  add(title: string, body: string): void {
    const all = this.getAll();
    all.unshift({
      id: crypto.randomUUID(),
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
    });
    write(KEYS.notifications, all.slice(0, 50));
  },
  markAllRead(): void {
    write(
      KEYS.notifications,
      this.getAll().map((n) => ({ ...n, read: true }))
    );
  },
  unreadCount(): number {
    return this.getAll().filter((n) => !n.read).length;
  },
};

export interface StoredProfile {
  name: string;
  email: string;
  headline: string;
  location: string;
  about: string;
  skills: string[];
  resumeFileName: string | null;
}

const emptyProfile: StoredProfile = {
  name: "",
  email: "",
  headline: "",
  location: "",
  about: "",
  skills: [],
  resumeFileName: null,
};

export const profileStore = {
  get(): StoredProfile {
    return read<StoredProfile>(KEYS.profile, emptyProfile);
  },
  save(profile: Partial<StoredProfile>): StoredProfile {
    const merged = { ...this.get(), ...profile };
    write(KEYS.profile, merged);
    return merged;
  },
};

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { profileStore, type StoredProfile } from "@/lib/storage";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  headline: z.string().max(100, "Keep the headline under 100 characters"),
  location: z.string(),
  about: z.string().max(1000, "Keep the summary under 1000 characters"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const [profile, setProfile] = useState<StoredProfile>(() => profileStore.get());
  const [skillInput, setSkillInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      headline: profile.headline,
      location: profile.location,
      about: profile.about,
    },
  });

  const onSubmit = (data: ProfileForm) => {
    const saved = profileStore.save(data);
    setProfile(saved);
    toast.success("Profile saved");
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;
    if (profile.skills.includes(skill)) {
      setSkillInput("");
      return;
    }
    const saved = profileStore.save({ skills: [...profile.skills, skill] });
    setProfile(saved);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    const saved = profileStore.save({ skills: profile.skills.filter((s) => s !== skill) });
    setProfile(saved);
  };

  const onResumeSelected = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be under 5 MB");
      return;
    }
    // Note: only the file name is stored — the backend has no upload endpoint yet.
    const saved = profileStore.save({ resumeFileName: file.name });
    setProfile(saved);
    toast.success("Resume attached to your profile");
  };

  const removeResume = () => {
    const saved = profileStore.save({ resumeFileName: null });
    setProfile(saved);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-1 text-slate-500">
        This information is shared with recruiters when you apply.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" error={errors.name?.message} {...register("name")} />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
        <Input
          label="Headline"
          placeholder="e.g. Final-year CS student passionate about frontend"
          error={errors.headline?.message}
          {...register("headline")}
        />
        <Input
          label="Location"
          placeholder="e.g. Bengaluru, India"
          error={errors.location?.message}
          {...register("location")}
        />
        <Textarea
          label="About"
          rows={5}
          placeholder="A short professional summary..."
          error={errors.about?.message}
          {...register("about")}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Save profile
        </Button>
      </form>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-slate-900">Skills</h2>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="e.g. React"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addSkill}>
            Add
          </Button>
        </div>
        {profile.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="text-primary-400 hover:text-primary-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-slate-900">Resume</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload your resume as a PDF (max 5 MB).
        </p>

        {profile.resumeFileName ? (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-slate-700">
                {profile.resumeFileName}
              </span>
              <Badge tone="emerald">Attached</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={removeResume}>
              Remove
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-6 py-8 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/30"
          >
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              Click to upload your resume
            </span>
            <span className="text-xs text-slate-400">PDF only, up to 5 MB</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => onResumeSelected(e.target.files?.[0])}
        />
      </section>
    </div>
  );
}

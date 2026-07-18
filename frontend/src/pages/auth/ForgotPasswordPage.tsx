import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

type ForgotForm = z.infer<typeof schema>;

/**
 * UI-only flow: the backend has no password-reset endpoint yet.
 * When one exists, submit the email to it here.
 */
export function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(schema) });

  const onSubmit = (data: ForgotForm) => {
    setSubmittedEmail(data.email);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Back to sign in
          </Link>
        </>
      }
    >
      {submittedEmail ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <MailCheck className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">Check your inbox</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            If an account exists for <span className="font-medium">{submittedEmail}</span>,
            you will receive a password reset link shortly.
          </p>
          <Link to="/login">
            <Button variant="outline" className="mt-6 w-full">
              Return to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <p className="text-sm text-slate-600">
            Enter the email associated with your account and we&apos;ll send you a link
            to reset your password.
          </p>
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

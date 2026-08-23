import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setSubmitting(true);
    signup(username.trim(), email.trim(), password)
      .then(() => navigate("/", { replace: true }))
      .catch((err) => toast.error(err.message || "Could not create your account"))
      .finally(() => setSubmitting(false));
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Keep your own subjects, work and progress."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. alex"
            autoComplete="username"
            autoFocus
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.edu"
            autoComplete="email"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={submitting || !username.trim() || password.length < 6}
        >
          {submitting ? "Creating account…" : "Sign up"}
        </Button>
      </form>
    </AuthShell>
  );
}

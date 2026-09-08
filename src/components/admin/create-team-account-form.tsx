"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTeamAccount } from "@/actions/team";

const ROLES = [
  { value: "staff", label: "Staff" },
  { value: "warehouse", label: "Warehouse" },
  { value: "driver", label: "Driver" },
  { value: "admin", label: "Admin" },
];

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function CreateTeamAccountForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [role, setRole] = useState("staff");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }
    setSubmitting(true);
    const result = await createTeamAccount({ email, password, fullName, role });
    setSubmitting(false);
    if (result.success) {
      setCreated({ email, password });
      toast.success("Account created.");
      setFullName("");
      setEmail("");
      setPassword(generatePassword());
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {created && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-semibold">Account created — share these credentials securely:</p>
            <p className="mt-1 font-mono">{created.email}</p>
            <p className="font-mono">{created.password}</p>
            <p className="mt-1 text-xs text-emerald-700">
              This password is shown only once. The new team member can change it after logging in via
              &quot;Forgot password?&quot; on the Staff Login page.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full Name" htmlFor="team_name" required>
            <Input id="team_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </FormField>
          <FormField label="Email" htmlFor="team_email" required>
            <Input id="team_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <FormField label="Role" htmlFor="team_role">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="team_role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Temporary Password" htmlFor="team_password" required hint="Auto-generated - you can edit it">
            <div className="flex gap-2">
              <Input id="team_password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="button" variant="outline" onClick={() => setPassword(generatePassword())}>
                Regenerate
              </Button>
            </div>
          </FormField>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              Create Account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

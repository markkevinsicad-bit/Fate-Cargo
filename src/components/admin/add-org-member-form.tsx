"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORG_MEMBER_ROLES, type OrgMemberRole } from "@/lib/constants";
import { addOrganizationMember } from "@/actions/organizations";

export function AddOrgMemberForm({ organizationId }: { organizationId: string }) {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<OrgMemberRole>("member");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setSubmitting(true);
    const result = await addOrganizationMember(organizationId, phone, role);
    setSubmitting(false);
    if (result.success) {
      toast.success("Member added.");
      setPhone("");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <FormField
        label="Add Member by Phone"
        htmlFor="member_phone"
        hint="They must already have a FATE Cargo 360 account."
        className="flex-1"
      >
        <Input id="member_phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+639171234567" />
      </FormField>
      <FormField label="Role" htmlFor="member_role">
        <Select value={role} onValueChange={(v) => setRole(v as OrgMemberRole)}>
          <SelectTrigger id="member_role" className="w-36 capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORG_MEMBER_ROLES.map((r) => (
              <SelectItem key={r} value={r} className="capitalize">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <Button type="submit" disabled={submitting}>
        Add Member
      </Button>
    </form>
  );
}

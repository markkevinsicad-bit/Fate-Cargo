import { Settings } from "lucide-react";
import { ComingSoonModule } from "@/components/admin/coming-soon";

export default function AdminSettingsPage() {
  return (
    <ComingSoonModule
      icon={Settings}
      title="Settings"
      description="System-wide configuration (pricing rules, roles, audit logs) is built out through later phases."
    />
  );
}

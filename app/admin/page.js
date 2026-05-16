import AdminDashboard from "./_components/admin-dashboard";
import SiteFooter from "../_components/site-footer";
import { getSiteContent } from "@/lib/site-content";

export const metadata = {
  title: "Anytime, Anywhere | Admin Dashboard",
  description: "Manage bookings, homepage content, vehicles, pricing, and media.",
};

export default async function AdminPage() {
  const siteContent = await getSiteContent();

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <AdminDashboard />
      <SiteFooter siteContent={siteContent} />
    </div>
  );
}

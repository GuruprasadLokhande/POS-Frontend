
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BillEase POS",
  description: "Manage your shop billing, inventory and customers.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full overflow-hidden">
      {children}
    </div>
  );
}
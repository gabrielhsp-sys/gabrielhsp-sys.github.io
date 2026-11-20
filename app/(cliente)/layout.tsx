import { ClientChrome } from "@/components/client-chrome";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return <ClientChrome>{children}</ClientChrome>;
}

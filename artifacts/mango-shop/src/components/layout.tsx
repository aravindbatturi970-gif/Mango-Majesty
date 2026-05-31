import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { FloatingWhatsApp } from "./floating-whatsapp";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground pb-24">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <BottomNav />
      <FloatingWhatsApp />
    </div>
  );
}

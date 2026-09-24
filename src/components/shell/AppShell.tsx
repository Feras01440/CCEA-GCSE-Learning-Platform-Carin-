import { BottomTabs, SideRail } from "./Nav";

export function AppShell({ children, productName }: { children: React.ReactNode; productName: string }) {
  return (
    <div className="flex min-h-screen">
      <SideRail productName={productName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-5 sm:px-6 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>
      <BottomTabs />
    </div>
  );
}

import ClientSidebar from "@/components/layout/ClientSidebar";


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <ClientSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  )
}
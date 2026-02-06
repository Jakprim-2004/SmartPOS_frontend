import Sidebar from "@/components/Sidebar";

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 max-h-screen overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

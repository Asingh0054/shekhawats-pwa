import { Outlet } from "react-router-dom";
// import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
// import { AppSidebar } from "../components/AppSidebar";
import { Calendar } from "lucide-react";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm flex items-center px-4 gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Home Expense Tracker
              </h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

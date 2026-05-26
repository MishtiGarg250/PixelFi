import {Sidebar} from "./sidebar";
import { Navbar } from "./navbar";

export const DashboardLayout = ({children}:{children:React.ReactNode}) => {
     return (
    <div className="flex bg-black text-white min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
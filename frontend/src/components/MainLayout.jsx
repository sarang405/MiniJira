import { useState, useEffect } from "react";
import SidebarComponent from "./SidebarComponents";
import NavbarComponent from "./NavbarComponent";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "flowbite-react";
import api from "../api/axios";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobileStatus = width < 1024;
      setIsMobile(mobileStatus);
      
      if (mobileStatus) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("access_token");
      if (!token || token === "undefined" || token === "null") {
        localStorage.removeItem("access_token");
        navigate("/login", { state: { from: location } });
        return;
      }
      try {
        await api.get("/accounts/profile/");
        setIsAuthChecking(false);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
        } else {
          setIsAuthChecking(false);
        }
      }
    };
    verifySession();
  }, [navigate, location]);

  if (isAuthChecking) {
    return (
      <div className="flex h-screen flex-col gap-6 items-center justify-center bg-slate-50">
        <Spinner size="xl" />
        <p className="text-blue-700 font-bold uppercase tracking-widest text-xs">Verifying Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      
      <div 
        className={`transition-all duration-300 ease-in-out z-50 
          ${isMobile ? "fixed inset-y-0 left-0" : "fixed inset-y-0 left-0"}
          ${isMobile && collapsed ? "-translate-x-full" : "translate-x-0"}
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        <SidebarComponent collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {!collapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div 
        className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden p-2 lg:p-4 transition-all duration-300
          ${isMobile ? "ml-0" : collapsed ? "ml-20" : "ml-64"}
        `}
      >
        <div className="bg-[#f8f9fa] rounded-[1rem] lg:rounded-[1rem] h-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col overflow-hidden">
          
          <NavbarComponent isMobile={isMobile} setCollapsed={setCollapsed} collapsed={collapsed} />

          <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
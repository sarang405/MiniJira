import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  FolderOpen,
  CheckSquare,
  Users,
  ChevronLeft,
  ChevronRight,
  Layers,
  ChevronDown
} from "lucide-react";

const iconMap = {
  dashboard: LayoutGrid,
  projects: FolderOpen,
  task: CheckSquare,
  contacts: Users,
  messages: Users, 
};

const SidebarComponent = ({ collapsed, setCollapsed }) => {
  const [menu, setMenu] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  useEffect(() => {
    setMenu([
      { name: "Dashboard", path: "/", icon: "dashboard" },
      {
        name: "Projects",
        icon: "projects",
        children: [
          { name: "My Projects", path: "/my-projects" },
          { name: "Joined Projects", path: "/joined-projects" }
        ]
      },
      { name: "My Tasks", path: "/tasks", icon: "task" },
      { name: "Contacts", path: "/contact", icon: "contacts" }, 
      { name: "Chat", path: "/messages", icon:"messages"}
    ]);
  }, []);

  const toggleSubmenu = (name) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const colors = {
    mainBg: "#164a6c",      
    headerBg: "#164a6c",    
    activeItem: "#3730a3",  
    textMain: "#ffffff",    
    textMuted: "#c7d2fe",   
    border: "#6366f1"      
  };

  return (
    <aside
      className="fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out border-r shadow-2xl"
      style={{ 
        width: collapsed ? "80px" : "260px", 
        backgroundColor: colors.mainBg,
        borderColor: colors.border 
      }}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <div 
            className="flex items-center gap-3 px-6 h-24 border-b"
            style={{ borderColor: colors.border, backgroundColor: colors.headerBg }}
          >
            <div className="bg-white p-2 rounded-xl shrink-0 shadow-lg">
              <Layers size={22} style={{ color: colors.mainBg }} />
            </div>
            {!collapsed && (
              <span className="font-black text-2xl tracking-tighter italic text-white">
                HUSTLEHUB
              </span>
            )}
          </div>

          <nav className="p-4 mt-6 space-y-2">
            {menu.map((item, index) => {
              const Icon = iconMap[item.icon] || LayoutGrid;
              const isActive = location.pathname === item.path;
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus[item.name];

              if (hasChildren && !collapsed) {
                return (
                  <div key={index} className="space-y-1">
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold hover:bg-white/10"
                      style={{ color: colors.textMuted }}
                    >
                      <Icon size={20} className="shrink-0" style={{ color: "#ffffff" }} />
                      <span className="flex-1 text-left text-sm">{item.name}</span>
                      <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="pl-11 space-y-1">
                        {item.children.map((child, i) => (
                          <Link
                            key={i}
                            to={child.path}
                            className="block p-2 text-[13px] font-bold rounded-lg transition-colors"
                            style={{ 
                              color: location.pathname === child.path ? "#ffffff" : colors.textMuted,
                              backgroundColor: location.pathname === child.path ? colors.activeItem : "transparent"
                            }}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all font-bold group"
                  style={{ 
                    justifyContent: collapsed ? "center" : "flex-start",
                    backgroundColor: isActive ? colors.activeItem : "transparent",
                    color: "#ffffff",
                    boxShadow: isActive ? "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)" : "none"
                  }}
                >
                  <Icon 
                    size={20} 
                    className="shrink-0 transition-colors" 
                    style={{ color: isActive ? "#ffffff" : colors.textMuted }} 
                  />
                  {!collapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div 
          className="p-4 border-t" 
          style={{ borderColor: colors.border, backgroundColor: "rgba(0,0,0,0.05)" }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-3 rounded-xl transition-all border border-white/20 text-white/70 hover:text-white hover:bg-white/10"
          >
            {collapsed ? <ChevronRight size={20} /> : (
              <div className="flex items-center gap-2">
                <ChevronLeft size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Minimize</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SidebarComponent;
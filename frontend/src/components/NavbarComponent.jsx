import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import { HiOutlineBell, HiPlus } from "react-icons/hi";
import { MdLogout, MdPersonOutline, MdSettings } from "react-icons/md";

import { Avatar } from "flowbite-react";
import CreateProjectModal from "./CreateProjectModal";

const NavbarComponent = () => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const navigate = useNavigate();
  const profileRef = useRef(null);
  const brandColor = "#164a6c";

  const fetchUser = async () => {
    const res = await api.get("/accounts/profile/");
    setUser(res.data);
  };

  const fetchNotifications = async () => {
    const res = await api.get("/communications/notification/");
    setNotifications(res.data);
  };

  const fetchUnread = async () => {
    const res = await api.get("/communications/notification/unread-count/");
    setUnreadCount(res.data.unread);
  };

  const fetchAll = async () => {
    try {
      await Promise.all([fetchUser(), fetchNotifications(), fetchUnread()]);
    } catch (err) {
      console.error("Navbar fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnread();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.post(`/communications/notification/${id}/read/`);
      fetchUnread();
      fetchNotifications();
    } catch (err) {
      console.error("Mark read failed", err);
    }
  };

  const handleOpenNotifications = () => {
    setShowNotifDropdown(!showNotifDropdown);
    setShowProfileDropdown(false);
  };

  const markAllRead = async () => {
    await api.post("/communications/notification/");
    fetchUnread();
    fetchNotifications();
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await api.post("/accounts/logout/", { refresh: refreshToken });
      }
    } finally {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  return (
    <div
      className="w-full flex items-center justify-between px-6 md:px-10 py-4 sticky top-0 z-30 shadow-xl"
      style={{ backgroundColor: brandColor }}
    >
      <div className="flex-1" />

      <div className="flex items-center gap-4 md:gap-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-[#164a6c] px-6 py-2.5 rounded-xl text-sm font-black hover:bg-slate-100 flex items-center gap-2 shadow-lg"
        >
          <HiPlus size={20} />
          <span>New Project</span>
        </button>

        <div className="relative">
          <button
            onClick={handleOpenNotifications}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl relative transition-all"
          >
            <HiOutlineBell size={24} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* START OF STYLISH NOTIFICATION DROPDOWN */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-4 w-96 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-3xl z-50 overflow-hidden border border-slate-100">
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-50 bg-slate-50/50 backdrop-blur-md">
                <div>
                  <h3 className="text-sm font-black text-[#164a6c]">Notifications</h3>
                  <p className="text-[10px] text-slate-500 font-medium">You have {unreadCount} unread messages</p>
                </div>
                <button 
                  onClick={markAllRead} 
                  className="text-[#164a6c] text-[11px] font-bold hover:underline bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 transition-all"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-[450px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.project) navigate(`/projects/${n.project}/board`);
                      }}
                      className={`group relative p-5 border-b border-slate-50 transition-all cursor-pointer ${
                        !n.is_read ? "bg-blue-50/40 hover:bg-blue-50" : "hover:bg-slate-50"
                      }`}
                    >
                      {!n.is_read && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                      )}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm leading-tight ${!n.is_read ? "font-bold text-[#164a6c]" : "font-semibold text-slate-700"}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                            {formatTime(n.created_at).split(',')[1]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 group-hover:bg-white transition-colors">System</span>
                          <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <HiOutlineBell size={30} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">All caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* END OF STYLISH NOTIFICATION DROPDOWN */}
        </div>

        <div className="relative border-l border-white/20 pl-4 md:pl-8" ref={profileRef}>
          <div
            className="p-0.5 rounded-full cursor-pointer"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifDropdown(false);
            }}
          >
            <Avatar
              img={`https://ui-avatars.com/api/?name=${user?.username || "U"}`}
              rounded
              size="sm"
            />
          </div>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-4 w-60 bg-white shadow-2xl rounded-2xl z-50">
              <div className="px-5 py-5 border-b">
                <p className="text-sm font-black">{user?.username}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button onClick={() => navigate("/profile")} className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center gap-2">
                <MdPersonOutline /> Profile
              </button>
              <button onClick={() => navigate("/settings")} className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center gap-2">
                <MdSettings /> Settings
              </button>
              <button onClick={handleLogout} className="w-full px-5 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
                <MdLogout /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={() => navigate("/my-projects")}
      />
    </div>
  );
};

export default NavbarComponent;
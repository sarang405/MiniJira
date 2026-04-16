const SidebarLink = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
    active ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'
  }`}>
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);
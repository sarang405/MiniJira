import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import CommentSection from "../components/CommentSection";
import {
  FiPaperclip,
  FiArrowLeft,
  FiTrash2,
  FiDownload,
  FiX,
  FiChevronDown,
  FiFileText,
  FiExternalLink
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [storyDraft, setStoryDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // UI STATES
  const [newSubtask, setNewSubtask] = useState("");
  const [tags, setTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchData = async () => {
    try {
      const [taskRes, userRes] = await Promise.all([
        api.get(`/issues/${taskId}/`),
        api.get("/accounts/profile/"),
      ]);

      setTask(taskRes.data);
      setStoryDraft(taskRes.data.story || "");
      setCurrentUser(userRes.data);
    } catch {
      toast.error("Task not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) fetchData();

    api.get("/issues/tags/")
      .then(res => setTags(res.data.results || res.data))
      .catch(() => console.error("Failed to load tags"));

  }, [taskId]);

  const handleUpdate = async (data) => {
    setIsSaving(true);
    try {
      const res = await api.patch(`/issues/${taskId}/`, data);
      setTask(res.data);
      toast.success("Saved");
    } catch {
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = async (tagId) => {
    if (!canEdit || isSaving) return;

    const currentTagIds = task.tags?.map(t => t.id) || [];
    const updatedTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter(id => id !== tagId)
      : [...currentTagIds, tagId];

    await handleUpdate({ tag_ids: updatedTagIds });
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    try {
      await api.post("/issues/subtasks/", {
        title: newSubtask,
        issue: taskId,
      });
      setNewSubtask("");
      fetchData();
      toast.success("Subtask added");
    } catch {
      toast.error("Failed to add subtask");
    }
  };

  const toggleSubtask = async (id) => {
    try {
      await api.patch(`/issues/subtasks/${id}/toggle/`);
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteSubtask = async (id) => {
    if (!window.confirm("Delete subtask?")) return;
    try {
      await api.delete(`/issues/subtasks/${id}/`);
      fetchData();
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("issue", taskId);
    try {
      await api.post("/issues/attachments/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await api.get(`/issues/${taskId}/`);
      setTask(res.data);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleDeleteAttachment = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await api.delete(`/issues/attachments/${id}/`);
      const res = await api.get(`/issues/${taskId}/`);
      setTask(res.data);
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const isImage = (url) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase());
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!task) return <div className="p-10 text-center">Not found</div>;

  const isAdmin = currentUser?.is_staff || currentUser?.is_admin;
  const isAssignee = Number(task.assignee) === Number(currentUser?.id);
  const isCreator = Number(task.created_by) === Number(currentUser?.id);
  const canEdit = isAdmin || isAssignee || isCreator;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-3xl border p-8 space-y-8">

        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <FiArrowLeft /> Back
          </button>
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
            SCRUM-{task.id}
          </span>
        </div>

        <input
          readOnly={!canEdit}
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          onBlur={() => canEdit && handleUpdate({ title: task.title })}
          className="text-3xl font-black w-full outline-none text-slate-800 placeholder:text-slate-300"
          placeholder="Task Title"
        />

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Story</label>
          <textarea
            readOnly={!canEdit}
            value={storyDraft}
            onChange={(e) => setStoryDraft(e.target.value)}
            className="w-full border-2 border-slate-50 rounded-2xl p-4 outline-none focus:border-blue-100 transition-all min-h-[120px] text-slate-600 leading-relaxed"
            placeholder="Describe the user story..."
          />
          {canEdit && (
            <button
              onClick={() => handleUpdate({ story: storyDraft })}
              className="px-6 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
            >
              {isSaving ? "Saving..." : "Save Story"}
            </button>
          )}
        </div>

        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <button 
              disabled={!canEdit}
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-blue-600 transition-colors disabled:cursor-not-allowed"
            >
              Tags <FiChevronDown />
            </button>

            <div className="flex flex-wrap gap-2">
              {task.tags?.map(tag => (
                <span 
                  key={tag.id} 
                  className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-2 border border-blue-100"
                >
                  {tag.name}
                  {canEdit && (
                    <FiX 
                      className="cursor-pointer hover:text-red-500" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTag(tag.id);
                      }} 
                    />
                  )}
                </span>
              ))}
            </div>
          </div>

          {showDropdown && canEdit && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
              <div className="absolute left-0 mt-2 w-56 bg-white border-2 border-slate-900 shadow-2xl rounded-2xl z-20 py-3 animate-in fade-in zoom-in duration-100">
                <p className="px-4 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Tags</p>
                <div className="max-h-60 overflow-y-auto">
                  {tags.map(tag => {
                    const isActive = task.tags?.some(t => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`w-full text-left px-4 py-3 text-xs flex justify-between items-center transition-colors border-b border-slate-50 last:border-0 ${
                          isActive 
                            ? "bg-blue-50 text-blue-700 font-black" 
                            : "text-slate-600 hover:bg-slate-50 font-bold"
                        }`}
                      >
                        {tag.name}
                        {isActive && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtasks</label>
          {canEdit && (
            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="border-2 border-slate-50 p-3 rounded-xl w-full text-sm outline-none focus:border-blue-100 transition-all"
                placeholder="What needs to be done?"
              />
              <button
                onClick={handleAddSubtask}
                className="bg-slate-900 hover:bg-blue-600 text-white px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md"
              >
                Add
              </button>
            </div>
          )}

          <div className="space-y-2 mt-4">
            {task.subtasks?.length > 0 ? (
              task.subtasks.map((sub) => (
                <div key={sub.id} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-0 transition-all cursor-pointer"
                      checked={sub.is_done}
                      onChange={() => toggleSubtask(sub.id)}
                    />
                    <span className={`text-sm font-bold ${sub.is_done ? "line-through text-slate-300" : "text-slate-600"}`}>
                      {sub.title}
                    </span>
                  </div>
                  {canEdit && (
                    <button 
                      onClick={() => deleteSubtask(sub.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-300 italic">No subtasks found.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attachments</label>
            {canEdit && (
              <label className="flex gap-2 items-center bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl cursor-pointer text-xs font-black uppercase tracking-widest transition-all">
                <FiPaperclip /> Upload File
                <input type="file" hidden onChange={handleFileUpload} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {task.attachments?.length > 0 ? (
              task.attachments.map((file) => {
                const fileUrl = file.file;
                const fileName = fileUrl.split("/").pop();
                const isImg = isImage(fileUrl);

                return (
                  <div key={file.id} className="group relative border-2 border-slate-50 rounded-[2rem] overflow-hidden bg-slate-50/30 hover:border-blue-100 transition-all">
                    
                    <div className="aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                      {isImg ? (
                        <img 
                          src={fileUrl} 
                          alt={fileName} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                           <FiFileText size={40} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Document</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white flex justify-between items-center">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-slate-700 truncate pr-4">{fileName}</span>
                        <a 
                          href={fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:underline"
                        >
                          View Full <FiExternalLink size={10}/>
                        </a>
                      </div>
                      
                      <div className="flex gap-2">
                         <a 
                            href={fileUrl} 
                            download 
                            className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <FiDownload size={16} />
                          </a>
                        {canEdit && (
                          <button 
                            onClick={() => handleDeleteAttachment(file.id)} 
                            className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                 <FiPaperclip size={24} className="mb-2 opacity-20" />
                 <p className="text-xs font-bold italic">No attachments uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100">
           <CommentSection issueId={task.id} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
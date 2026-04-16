import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { FiSend, FiTrash2, FiEdit2, FiCheck, FiX } from "react-icons/fi";


const CommentSection = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const timerRef = useRef(null);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/issues/comments/?issue=${issueId}`)
      setComments(res.data.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComments();

    return () => clearInterval(timerRef.current);
  }, [issueId]);

  const handleAdd = async () => {
    if (!newText.trim()) return;

    const temp = {
      id: `tmp-${Date.now()}`,
      content: newText,
      author_detail: { username: "You" },
      created_at: new Date().toISOString(),
      isTemp: true,
    };

    setComments((prev) => [temp, ...prev]);
    setNewText("");

    try {
      await api.post(`/issues/comments/`, {
        issue: issueId,
        content: temp.content,
      });
      fetchComments();
    } catch (e) {
      // rollback
      setComments((prev) => prev.filter((c) => c.id !== temp.id));
    }
  };

  const handleDelete = async (id) => {
    const backup = comments;
    setComments((prev) => prev.filter((c) => c.id !== id));

    try {
      await api.delete(`/issues/comments/${id}/`);
    } catch (e) {
      setComments(backup);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditText(c.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;

    const backup = comments;
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: editText } : c))
    );

    try {
      await api.patch(`/issues/comments/${id}/`, { content: editText });
      setEditingId(null);
    } catch (e) {
      setComments(backup);
    }
  };

  const fmtTime = (t) =>
    new Date(t).toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });

  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {comments.map((c) => (
          <div
            key={c.id}
            className="group bg-slate-50/80 border border-slate-100 rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black text-slate-700">
                {c.author_detail?.username || "User"}
              </span>
              <span className="text-[10px] text-slate-400">
                {fmtTime(c.created_at)}
              </span>
            </div>

            {editingId === c.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 text-xs px-2 py-1 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500"
                />
                <button onClick={() => saveEdit(c.id)} className="text-green-600">
                  <FiCheck size={14} />
                </button>
                <button onClick={cancelEdit} className="text-slate-400">
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed">
                {c.content}
              </p>
            )}

            {!c.isTemp && editingId !== c.id && (
              <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => startEdit(c)}
                  className="text-slate-400 hover:text-blue-600"
                >
                  <FiEdit2 size={12} />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-blue-500 font-semibold"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white p-2 rounded-xl hover:scale-105 transition"
        >
          <FiSend size={14} />
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
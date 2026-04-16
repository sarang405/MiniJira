import React from "react";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import CommentSection from "../components/CommentSection";

const TaskCard = ({
  issue,
  index,
  provided,
  snapshot,
  isAdmin,
  project,
  handleDeleteTask,
  activeDropdown,
  setActiveDropdown,
  handleAssign,
  getPriorityColor,
  currentUser, 
}) => {
const userId = Number(currentUser?.id);
console.log(issue);
console.log("ASSIGNEE:", issue.assignee?.id);
console.log("USER ID:", userId);
console.log("FULL currentUser:", currentUser); 

const isOverdue =
  issue.due_date && new Date(issue.due_date) < new Date();

const isResponsible =
  isAdmin || Number(issue.assignee?.id) === userId;
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`
        group bg-white p-5 rounded-3xl shadow-sm border 
        ${isOverdue && isResponsible ? "border-red-400 bg-red-50/30" : "border-slate-100"} 
        hover:shadow-md hover:border-slate-300 transition-all 
        ${snapshot.isDragging ? "rotate-2 scale-105 z-50 shadow-2xl border-slate-500" : ""}
      `}
    >
      <Link to={`/projects/${project.id}/task/${issue.id}`} className="block">
        <div className="flex justify-between items-start mb-3">
          <span
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${getPriorityColor(issue.priority)}`}
          >
            {issue.priority}
          </span>

          {isAdmin && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteTask(issue.id);
              }}
              className="md:opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>

        <h4 className="text-sm font-bold text-slate-800 mb-2 leading-relaxed">
          {issue.title}
        </h4>

        {issue.due_date && (
          <p
            className={`text-[10px] font-bold uppercase tracking-wide mb-2 ${
              isOverdue && isResponsible
                ? "text-red-500"
                : "text-slate-400"
            }`}
          >
            Due: {new Date(issue.due_date).toLocaleDateString()}
          </p>
        )}

        {issue.tags && issue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {issue.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 uppercase"
              >
                {tag.name || tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      <CommentSection issueId={issue.id} />

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50/50">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
          SCRUM-{issue.id}
        </span>

        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isAdmin)
                setActiveDropdown(
                  activeDropdown === issue.id ? null : issue.id
                );
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black uppercase transition-all ${
              isAdmin
                ? "bg-slate-900 text-white active:bg-blue-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {issue.assignee?.username?.slice(0, 2) || "?"}
          </button>

          {isAdmin && activeDropdown === issue.id && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(null);
                }}
              ></div>

              <div
                className="absolute right-0 bottom-full mb-3 w-48 bg-white border-2 border-slate-800 rounded-2xl shadow-2xl z-20 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  Assign To
                </p>

                <div className="max-h-40 overflow-y-auto">
                  {project.members?.map((m) => (
                    <button
                      key={`mem-${m.user.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAssign(issue.id, m.user.id);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-0"
                    >
                      {m.user.username}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
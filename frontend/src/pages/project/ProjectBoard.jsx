import React, { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  FiPlus,
  FiX,
  FiTrash2,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useEffect } from "react";

import api from "../../api/axios";
import { toast } from "react-hot-toast";
import CommentSection from "../../components/CommentSection";
import TaskCard from "../../components/TaskCard";

const ProjectBoard = () => {
  const { project, isAdmin, refreshProject } = useOutletContext();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    api.get("/accounts/profile/")
      .then(res => setCurrentUser(res.data))
      .catch(() => console.error("Failed to load user"));
  }, []);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedColumn, setExpandedColumn] = useState("todo");

  if (!project || !project.id)
    return (
      <div className="p-10 text-center font-bold text-slate-400">
        Loading...
      </div>
    );

  const columns = [
    { id: "todo", label: "To Do" },
    { id: "in_progress", label: "In Progress" },
    { id: "in_review", label: "In Review" },
    { id: "done", label: "Done" },
  ];

  const handleDeleteTask = async (issueId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/issues/${issueId}/`);
      refreshProject();
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    try {
      await api.patch(`/issues/${draggableId}/`, {
        status: destination.droppableId,
      });
      refreshProject();
      toast.success(`Moved to ${destination.droppableId.replace("_", " ")}`);
    } catch (err) {
      toast.error("Failed to move task");
    }
  };

  const handleCreateTask = async (e) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) {
      setIsCreating(false);
      return;
    }
    try {
      await api.post(`/issues/`, {
        title: newTaskTitle.trim(),
        status: "todo",
        priority: newTaskPriority,
        project: project.id,
        due_date: newTaskDueDate || null,
      });
      setNewTaskTitle("");
      setNewTaskPriority("medium");
      setNewTaskDueDate("");
      setIsCreating(false);
      refreshProject();
      toast.success("Issue created");
    } catch (err) {
      toast.error("Failed to create issue");
    }
  };

  const handleAssign = async (issueId, userId) => {
    try {
      await api.patch(`/issues/${issueId}/`, { assignee: userId });
      setActiveDropdown(null);
      refreshProject();
      toast.success("Assignee updated");
    } catch (err) {
      toast.error("Assignment failed");
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "high":
        return "bg-red-100 text-red-600";
      case "medium":
        return "bg-amber-100 text-amber-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-220px)] space-y-4 px-2 md:px-0">
      <div className="flex justify-start">
        {isCreating ? (
          <form
            onSubmit={handleCreateTask}
            className="flex flex-col gap-3 bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-xl animate-in fade-in zoom-in duration-200 w-full md:w-80"
          >
            <input
              autoFocus
              className="border-none focus:ring-0 text-sm font-bold text-slate-700 w-full p-0 placeholder:text-slate-300"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="text-[10px] font-black uppercase tracking-wider bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 py-1 px-2"
            />
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="text-[10px] font-black uppercase tracking-wider bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 py-1 pl-2 pr-8 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FiX size={18} />
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all w-full md:w-auto justify-center md:justify-start shadow-md"
          >
            <FiPlus /> New Task
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-y-auto lg:overflow-x-auto lg:overflow-y-hidden pb-6 custom-scrollbar px-1">
          {columns.map((col) => {
            const columnTasks =
              project.tasks?.filter((i) => {
                if (col.id === "todo")
                  return i.status === "todo" || i.status === "backlog";
                return i.status === col.id;
              }) || [];

            const isExpanded = expandedColumn === col.id;

            return (
              <div
                key={col.id}
                className={`
                  flex flex-col transition-all duration-300 
                  ${isExpanded ? "flex-1" : "flex-none"} 
                  lg:min-w-[320px] lg:w-[320px] lg:max-h-full
                  bg-slate-50 border-2 border-slate-300 rounded-[2.5rem]
                `}
              >
                <button
                  onClick={() => setExpandedColumn(col.id)}
                  className="w-full lg:cursor-default flex items-center justify-between p-4 lg:p-5 border-b border-slate-200"
                >
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${isExpanded ? "bg-slate-900" : "bg-slate-300"}`}
                    ></span>
                    {col.label}
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[9px] text-slate-400 font-bold">
                      {columnTasks.length}
                    </span>
                  </h3>
                  <div className="lg:hidden p-1 text-slate-400">
                    {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                  </div>
                </button>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`
                        ${isExpanded ? "flex" : "hidden"} lg:flex 
                        flex-col flex-1 px-3 pb-4 space-y-4 mt-2
                        overflow-y-auto transition-colors duration-300 
                        ${snapshot.isDraggingOver ? "bg-blue-100/30" : "bg-transparent"}
                        min-h-[200px] lg:min-h-0
                      `}
                    >
                      {columnTasks.map((issue, index) => (
                        <Draggable
                          key={issue.id.toString()}
                          draggableId={issue.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <TaskCard
                              issue={issue}
                              provided={provided}
                              snapshot={snapshot}
                              isAdmin={isAdmin}
                              project={project}
                              handleDeleteTask={handleDeleteTask}
                              activeDropdown={activeDropdown}
                              setActiveDropdown={setActiveDropdown}
                              handleAssign={handleAssign}
                              getPriorityColor={getPriorityColor}
                              currentUser={currentUser} // ✅ added
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ProjectBoard;

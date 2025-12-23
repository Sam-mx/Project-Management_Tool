import React, { useEffect, useState } from "react";
import { HiOutlineBell } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import {
  getNotifications,
  markNotificationsRead,
} from "../../services/notifcationService";
import useClose from "../../hooks/useClose";
import { format } from "timeago.js";
import { socket } from "../../App";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // 1. Close dropdown when clicking outside (Standard behavior)
  const ref = useClose(() => setIsOpen(false));

  // Fetch initial history
  const { data: notifications = [] } = useQuery(
    ["getNotifications"],
    getNotifications,
    {
      initialData: [],
      refetchOnWindowFocus: false,
    }
  );

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n: any) => !n.isRead).length;

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (newNote: any) => {
      queryClient.setQueryData(["getNotifications"], (oldData: any = []) => {
        return [newNote, ...oldData];
      });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [queryClient]);

  const handleToggle = () => {
    setIsOpen(!isOpen);

    // Mark as read immediately when opening
    if (!isOpen && unreadCount > 0) {
      markNotificationsRead();
      queryClient.setQueryData(["getNotifications"], (oldData: any) => {
        return Array.isArray(oldData)
          ? oldData.map((n: any) => ({ ...n, isRead: true }))
          : [];
      });
    }
  };

  return (
    <div className="relative mr-4" ref={ref}>
      {/* 2. Reverted to onClick (Click the dropdown to open) */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-violet-600 transition-colors focus:outline-none"
      >
        <HiOutlineBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b font-semibold text-gray-700">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto">
            {safeNotifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-center text-gray-500">
                No notifications yet.
              </div>
            ) : (
              safeNotifications.map((note: any) => (
                <div
                  key={note._id}
                  // 3. REMOVED onClick redirect logic
                  // Added 'hover:bg-gray-50' for visual effect
                  // Removed 'cursor-pointer' so it doesn't look like a link
                  className={`px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !note.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start">
                    <span className="mr-2 text-xl select-none">
                      {note.type === "MENTION" && "💬"}
                      {note.type === "ASSIGNMENT" && "📌"}
                      {note.type === "SPACE_INVITE" && "👋"}
                      {note.type === "BOARD_INVITE" && "📋"}
                      {note.type === "DEADLINE" && "⏰"}
                      {note.type === "SYSTEM" && "⚙️"}
                    </span>

                    <div>
                      <p className="text-sm text-gray-800">{note.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(note.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

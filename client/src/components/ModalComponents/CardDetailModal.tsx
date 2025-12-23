import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import axiosInstance from "../../axiosInstance";
import { CardDetailObj } from "../../types";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch } from "react-redux";
import { addToast } from "../../redux/features/toastSlice";
import { BOARD_ROLES, ERROR, SUCCESS } from "../../types/constants";
import ErrorCard from "../ErrorCard/ErrorCard";
import CardDetailSkeleton from "../Skeletons/CardDetailSkeleton";
import { hideModal } from "../../redux/features/modalSlice";
import CardDetailName from "../CardDetail/CardDetailName";
import { RiWindowFill } from "react-icons/ri";
import Profile from "../Profile/Profile";
import {
  HiMenuAlt2,
  HiOutlineChatAlt,
  HiOutlineTrash,
  HiOutlineRefresh,
} from "react-icons/hi";
import CardDescription from "../CardDetail/CardDescription";
import AddComment from "../CardDetail/AddComment";
import Comment from "../CardDetail/Comment";
import AddMemberBtn from "../CardDetail/AddMemberBtn";
import AddLabelBtn from "../CardDetail/AddLabelBtn";
import DueDateBtn from "../CardDetail/DueDateBtn";
import AddCoverBtn from "../CardDetail/AddCoverBtn";
import { format } from "date-fns";
import { AxiosError } from "axios";
import DueDateStatus from "../CardDetail/DueDateStatus";

interface Props {
  _id: string;
  boardId: string;
  spaceId: string;
}

const CATEGORY_COLORS = [
  "#cdb4db",
  "#ffafcc",
  "#a2d2ff",
  "#ff595e",
  "#ffca3a",
  "#90be6d",
  "#61BD4F",
  "#F1D737",
  "#FA9F2E",
  "#EB5A46",
];

const AVAILABLE_CATEGORIES = [
  "Marketing",
  "Sales",
  "Development",
  "HR",
  "Analytics",
  "Product Management",
  "QA",
  "Finance",
  "Design",
  "Operations",
  "Legal",
  "Cyber Security",
  "General",
];

// Hash function to map any category string to a palette color index
const hashStringToColorIndex = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % CATEGORY_COLORS.length;
};

// Function to get color from category
const getCategoryColor = (category: string) => {
  const index = hashStringToColorIndex(category);
  return CATEGORY_COLORS[index];
};

// Helper for Priority Colors (1-5 Scale)
const getPriorityBadgeInfo = (priority?: number) => {
  switch (priority) {
    case 1:
      return { label: "Critical", classes: "bg-red-600 text-white" };
    case 2:
      return { label: "High", classes: "bg-orange-500 text-white" };
    case 3:
      return { label: "Medium", classes: "bg-yellow-500 text-white" };
    case 4:
      return { label: "Low", classes: "bg-blue-500 text-white" };
    case 5:
      return { label: "Very Low", classes: "bg-gray-400 text-white" };
    default:
      return { label: "None", classes: "bg-gray-200 text-gray-500" };
  }
};

// Helper for Ranking Colors (1-3 Scale)
const getRankingBadgeInfo = (score?: number) => {
  switch (score) {
    case 1:
      return { label: "High Impact", classes: "bg-purple-700 text-white" };
    case 2:
      return { label: "Medium Impact", classes: "bg-purple-500 text-white" };
    case 3:
      return { label: "Low Impact", classes: "bg-purple-300 text-gray-800" };
    default:
      return { label: "None", classes: "bg-gray-200 text-gray-500" };
  }
};

const triggerAiProcessing = async (cardId: string) => {
  return axiosInstance.post("/ai/process-task", { cardId });
};

const CardDetailModal = ({ _id, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showDescEdit, setShowDescEdit] = useState(false);

  const deleteCard = (_id: string) => {
    axiosInstance
      .delete(`/cards/${_id}`)
      .then(() => {
        if (queryClient.getQueryData(["getLists", boardId])) {
          queryClient.setQueryData(["getLists", boardId], (oldData: any) => {
            return {
              ...oldData,
              cards: oldData.cards.filter((c: any) => c._id !== _id),
            };
          });
        }
        queryClient.invalidateQueries(["getAllMyCards"]);
        dispatch(hideModal());
      })
      .catch((error: AxiosError) => {
        // Error handling logic kept same as original
        if (error.response) {
          const response = error.response as any; // Cast to any to access data
          const message = response.data?.message || "Error occurred";
          dispatch(addToast({ kind: ERROR, msg: message }));
        }
      });
  };

  const toggleIsComplete = (cardId: string) => {
    axiosInstance
      .put(`/cards/${cardId}/isComplete`)
      .then((response) => {
        const { data } = response.data;
        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => ({
          ...oldValue,
          isComplete: data.isComplete,
        }));
        queryClient.invalidateQueries(["getAllMyCards"]);
        queryClient.invalidateQueries(["getLists", boardId]);
      })
      .catch((error: AxiosError) => {
        // simplified error handling for brevity
        dispatch(addToast({ kind: ERROR, msg: "Failed to update status" }));
      });
  };

  const updateCategory = async (newCategory: string) => {
    // 1. Optimistic UI Update (optional, but feels faster)
    // You can skip this if you prefer waiting for the server

    // 2. Call API
    try {
      await axiosInstance.put(`/cards/${card?._id}/category`, {
        category: newCategory,
      });

      // 3. Invalidate to refetch fresh data
      queryClient.invalidateQueries(["getCard", _id]);
      queryClient.invalidateQueries(["getLists", boardId]);

      dispatch(
        addToast({
          kind: SUCCESS,
          msg: "Category updated & AI training triggered!",
        })
      );
    } catch (error) {
      dispatch(addToast({ kind: ERROR, msg: "Failed to update category" }));
    }
  };

  const getCard = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/cards/${queryKey[1]}`);
    const { data } = response.data;
    return data;
  };

  const {
    data: card,
    isLoading,
    isRefetching,
    error,
  } = useQuery<CardDetailObj | undefined, any, CardDetailObj, string[]>(
    ["getCard", _id],
    getCard
  );

  if (isLoading) return <CardDetailSkeleton />;

  if (error) {
    return (
      <ErrorCard
        isRefetching={isRefetching}
        queryKey={["getCard", _id]}
        msg={"Error loading card"}
      />
    );
  }

  // Calculate Badge Data safely
  const priorityInfo = getPriorityBadgeInfo(card?.priority);
  const rankingInfo = getRankingBadgeInfo(card?.rankingScore);

  // Temporary Debug Log
  console.log("DEBUG CARD DATA:", {
    priority: card?.priority,
    rankingScore: card?.rankingScore,
    category: card?.category,
  });

  return (
    <div className="card-detail-modal">
      {card && (
        <div className="card-detail-modal-content pb-8">
          {/* Cover Image */}
          {card.color && (
            <div
              className="card-cover rounded-t"
              style={{
                width: "100%",
                height: "200px",
                background: `${card.color}`,
              }}
            >
              {card.coverImg && (
                <img
                  src={card.coverImg}
                  className="object-contain w-full h-full object-top rounded-t"
                  alt="card-cover"
                />
              )}
            </div>
          )}

          {/* Name Section */}
          <div className="card-name px-4 mt-6 mr-8 flex items-center mb-6">
            <RiWindowFill size={22} className="mr-2" />
            {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(card.role) ? (
              <CardDetailName
                spaceId={spaceId}
                cardId={card._id}
                boardId={boardId}
                initialValue={card.name}
              />
            ) : (
              <h3 className="cursor-default font-semibold text-lg px-1.5 py-1 h-8">
                {card.name}
              </h3>
            )}
          </div>

          <div className="card-body px-4 flex">
            {/* LEFT COLUMN */}
            <div className="left flex flex-col mr-6" style={{ width: "600px" }}>
              {/* Due Date */}
              {card.dueDate && (
                <div className="due-date mb-6">
                  <span className="text-sm font-bold text-slate-600 block mb-2">
                    Due Date
                  </span>
                  <div className="bg-slate-200 px-2 py-1 rounded w-max flex items-center">
                    {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(
                      card.role
                    ) && (
                      <div className="toggle-isComplete mr-2">
                        <input
                          type="checkbox"
                          checked={card.isComplete ? true : false}
                          onChange={() => toggleIsComplete(card._id)}
                        />
                      </div>
                    )}
                    <span className="date">
                      {format(new Date(card.dueDate), "dd MMM, yyyy")}
                    </span>
                    <DueDateStatus
                      date={card.dueDate}
                      isComplete={card.isComplete}
                    />
                  </div>
                </div>
              )}

              {/* Members */}
              {card.members && card.members.length > 0 && (
                <div className="members mb-6">
                  <span className="text-sm font-bold text-slate-600 block mb-2">
                    Assignee
                  </span>
                  <div className="members-content flex items-center flex-wrap gap-2">
                    {card.members.map((m) => (
                      <Profile
                        key={m._id}
                        classes="w-7 h-7 cursor-default"
                        src={m.profile}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Labels */}
              {card.labels && card.labels.length > 0 && (
                <div className="labels mb-6">
                  <span className="text-sm font-bold text-slate-600 block mb-2">
                    Labels
                  </span>
                  <div className="labels flex items-center flex-wrap gap-4 mb-6">
                    {card.labels
                      .sort((a: any, b: any) =>
                        a.pos > b.pos ? 1 : b.pos > a.pos ? -1 : 0
                      )
                      .map((l) => (
                        <div
                          key={l._id}
                          className="label text-sm p-1 rounded font-semibold text-white"
                          style={{ background: l.color }}
                        >
                          {l.name}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="description mb-6">
                <div className="top flex items-center mb-2">
                  <HiMenuAlt2 size={22} className="mr-2" />
                  <h3 className="text-lg font-semibold text-slate-700 mr-4">
                    Description
                  </h3>
                  {!showDescEdit &&
                    [BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(
                      card.role
                    ) && (
                      <button
                        className="btn-gray"
                        onClick={() => setShowDescEdit(true)}
                      >
                        Edit
                      </button>
                    )}
                </div>
                <div className="content pl-4">
                  {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(
                    card.role
                  ) && showDescEdit ? (
                    <CardDescription
                      showDescEdit={showDescEdit}
                      setShowDescEdit={setShowDescEdit}
                      boardId={boardId}
                      cardId={card._id}
                      initialValue={card.description || ""}
                      spaceId={spaceId}
                    />
                  ) : (
                    <p>{card.description}</p>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div className="comments mb-6">
                <div className="top flex items-center mb-4">
                  <HiOutlineChatAlt size={22} className="mr-2" />
                  <h3 className="text-lg font-semibold text-slate-700">
                    Comments
                  </h3>
                </div>
                <div className="content flex flex-col">
                  {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(
                    card.role
                  ) && (
                    <AddComment
                      queryKey={["getCard", _id]}
                      cardId={card._id}
                      boardId={boardId}
                      spaceId={spaceId}
                    />
                  )}
                  <div className="actual-comments">
                    {card.comments &&
                      card.comments.map((c: any) => (
                        <Comment
                          key={c._id}
                          comment={c}
                          myRole={card.role}
                          cardId={card._id}
                          boardId={boardId}
                          spaceId={spaceId}
                        />
                      ))}
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------- */}
              {/* AI TAGS SECTION (UPDATED FOR INTEGER VALUES)         */}
              {/* ----------------------------------------------------- */}
              <div className="ai-section border-t pt-4 mt-2">
                {/* 1. Category (Editable) */}
                <div className="mb-4 flex items-center gap-2">
                  <strong>Category:</strong>

                  {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(
                    card.role
                  ) ? (
                    // EDITABLE DROPDOWN
                    <select
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white shadow-sm cursor-pointer outline-none border-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
                      style={{
                        backgroundColor: getCategoryColor(
                          card.category || "Uncategorized"
                        ),
                        // Hides the default arrow in some browsers for a cleaner look (optional)
                        WebkitAppearance: "none",
                        textAlign: "center",
                      }}
                      value={card.category || "General"}
                      onChange={(e) => updateCategory(e.target.value)}
                    >
                      {AVAILABLE_CATEGORIES.map((cat) => (
                        <option
                          key={cat}
                          value={cat}
                          style={{ color: "black", backgroundColor: "white" }} // Options need standard colors
                        >
                          {cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    // READ ONLY (For Observers)
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white shadow-sm"
                      style={{
                        backgroundColor: getCategoryColor(
                          card.category || "Uncategorized"
                        ),
                      }}
                    >
                      {card.category || "Uncategorized"}
                    </span>
                  )}
                </div>

                {/* 2. Priority Score (1-5) */}
                <div className="mb-4 flex items-center gap-2">
                  <strong>Priority Level:</strong>
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-semibold shadow-sm ${priorityInfo.classes}`}
                  >
                    {card.priority ? priorityInfo.label : "N/A"}
                  </span>
                </div>

                {/* 3. Ranking Score (1-3) */}
                <div className="mb-4 flex items-center gap-2">
                  <strong>Impact Ranking:</strong>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${rankingInfo.classes}`}
                  >
                    {card.rankingScore ? rankingInfo.label : "N/A"}
                  </span>
                </div>
              </div>
              {/* ----------------------------------------------------- */}
            </div>

            {/* RIGHT COLUMN (Buttons) */}
            {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(card.role) && (
              <div
                className="right flex flex-col gap-y-4"
                style={{ width: "150px" }}
              >
                {/* REFRESH AI BUTTON */}
                <button
                  className="bg-blue-600 rounded text-sm text-white p-2 flex items-center font-normal hover:bg-blue-700 transition shadow-md"
                  onClick={async () => {
                    try {
                      dispatch(
                        addToast({
                          kind: SUCCESS,
                          msg: "AI Processing started...",
                        })
                      );

                      await triggerAiProcessing(card._id);

                      await queryClient.invalidateQueries([
                        "getCard",
                        card._id,
                      ]);
                      queryClient.invalidateQueries(["getLists", boardId]);

                      dispatch(
                        addToast({
                          kind: SUCCESS,
                          msg: "AI analysis finished!",
                        })
                      );
                    } catch {
                      dispatch(
                        addToast({
                          kind: ERROR,
                          msg: "Failed to refresh AI analysis",
                        })
                      );
                    }
                  }}
                >
                  <HiOutlineRefresh size={16} className="mr-1" />
                  Refresh AI
                </button>

                <AddMemberBtn
                  members={card.members}
                  listId={card.listId}
                  cardId={card._id}
                  boardId={boardId}
                  spaceId={spaceId}
                />
                <AddLabelBtn
                  listId={card.listId}
                  cardId={card._id}
                  boardId={boardId}
                  spaceId={spaceId}
                />
                <DueDateBtn
                  dueDate={card.dueDate}
                  listId={card.listId}
                  cardId={card._id}
                  boardId={boardId}
                  spaceId={spaceId}
                />
                <AddCoverBtn
                  coverImg={card.coverImg}
                  color={card.color}
                  listId={card.listId}
                  cardId={card._id}
                  boardId={boardId}
                  spaceId={spaceId}
                />

                <button
                  className="bg-red-400 rounded text-sm text-white p-2 flex items-center font-normal mt-4 hover:bg-red-500 transition"
                  onClick={() => deleteCard(card._id)}
                >
                  <HiOutlineTrash size={16} className="mr-1" />
                  Delete Card
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardDetailModal;

import { AxiosError } from "axios";
import React, { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../axiosInstance";
import useClose from "../../hooks/useClose";
import { RootState } from "../../redux/app";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { CommentObj } from "../../types";
import { BOARD_ROLES, ERROR } from "../../types/constants";
import { getDate } from "../../utils/helpers";
import Profile from "../Profile/Profile";
import MentionInput from "../Common/MentionInput"; // <--- 1. Import MentionInput

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  comment: CommentObj;
  cardId: string;
  boardId: string;
  spaceId: string;
}

const Comment = ({ myRole, comment, cardId, spaceId, boardId }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { user } = useSelector((state: RootState) => state.auth);
  const [value, setValue] = useState(comment.comment);
  const [isEdit, setIsEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [isFirst, setIsFirst] = useState(true);

  // 2. Get Board Members from Cache for the Mention Dropdown
  const boardData: any = queryClient.getQueryData(["getBoard", boardId]);
  const members = boardData?.members || [];

  const ref = useClose(() => setShowDelete(false));

  const refMain = useClose(() => {
    setIsEdit(false);
    setIsFirst(true);
    setValue(comment.comment);
  });

  // 3. Helper function to highlight @mentions in View Mode
  const renderCommentContent = (text: string) => {
    // Split text by mentions (e.g., @Name)
    const parts = text.split(/(@\w+)/g);

    return parts.map((part, index) => {
      // If part matches @Word, render it styled
      if (part.match(/^@\w+$/)) {
        return (
          <span
            key={index}
            className="text-violet-600 font-bold bg-violet-50 px-1 rounded"
          >
            {part}
          </span>
        );
      }
      // Otherwise render plain text
      return <span key={index}>{part}</span>;
    });
  };

  const updateComment = (
    cardId: string,
    commentId: string,
    newComment: string
  ) => {
    // send PUT request to backend
    axiosInstance
      .put(
        `/cards/${cardId}/comments`,
        {
          comment: newComment,
          commentId: commentId,
        },
        {
          headers: {
            ContentType: "application/json",
          },
        }
      )
      .then((response) => {
        setIsEdit(false);

        queryClient.invalidateQueries(["getAllMyCards"]);

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          return {
            ...oldValue,
            comments: oldValue.comments.map((c: CommentObj) => {
              if (c._id === commentId) {
                return {
                  ...c,
                  comment: newComment,
                  isUpdated: true, // Mark as edited locally
                };
              }
              return c;
            }),
          };
        });
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              dispatch(addToast({ kind: ERROR, msg: message }));
              // Invalidate queries...
              break;
            case 404:
              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));
              // Invalidate queries...
              break;
            case 400:
            case 500:
              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            default:
              dispatch(
                addToast({ kind: ERROR, msg: "Oops, something went wrong" })
              );
              break;
          }
        } else if (error.request) {
          dispatch(
            addToast({ kind: ERROR, msg: "Oops, something went wrong" })
          );
        } else {
          dispatch(addToast({ kind: ERROR, msg: `Error: ${error.message}` }));
        }
      });
  };

  const deleteComment = (commentId: string, cardId: string) => {
    axiosInstance
      .delete(`/cards/${cardId}/comments`, {
        data: {
          commentId: commentId,
        },
        headers: {
          ContentType: "application/json",
        },
      })
      .then((response) => {
        setShowDelete(false);
        queryClient.invalidateQueries(["getAllMyCards"]);
        queryClient.invalidateQueries(["getLists", boardId]);

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          return {
            ...oldValue,
            comments: oldValue.comments.filter(
              (c: CommentObj) => c._id !== commentId
            ),
          };
        });
      })
      .catch((error: AxiosError) => {
        // ... error handling code ...
      });
  };

  return (
    <div
      ref={refMain}
      className="comment flex items-start w-full mb-6 last:mb-0"
    >
      <Profile
        classes="w-7 h-7 cursor-pointer mr-4"
        src={comment.user.profile}
      />

      <div className="right flex flex-col w-full">
        <div className="top mb-2 text-sm">
          <span className="username font-semibold mr-2">
            {comment.user.username}
          </span>
          <span className="time mr-1">{getDate(comment.createdAt)}</span>
          {comment.isUpdated && (
            <span className="isUpdated text-xs text-gray-400">(edited)</span>
          )}
        </div>

        {isEdit ? (
          <div className="flex flex-col w-full">
            {/* 4. REPLACED TEXTAREA WITH MENTIONINPUT */}
            <div className="mb-4">
              <MentionInput
                value={value}
                onChange={(e: any) => setValue(e.target.value)}
                members={members}
              />
            </div>

            <div className="buttons flex items-center">
              <button
                disabled={value === ""}
                onClick={() => updateComment(cardId, comment._id, value)}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed w-20 mr-2"
              >
                Save
              </button>
              <button
                className="text-sm text-slate-700"
                onClick={(e) => {
                  setIsEdit(false);
                  setIsFirst(true);
                  setValue(comment.comment);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="comment shadow-sm w-full p-3 bg-white border border-gray-100 rounded-md mb-2 text-sm text-gray-800">
            {/* 5. USE HELPER TO RENDER HIGHLIGHTS */}
            {renderCommentContent(comment.comment)}
          </div>
        )}

        {!isEdit && (
          <div className="buttons text-xs flex items-center">
            {comment.user._id === user?._id && (
              <button
                className="text-slate-500 hover:underline mr-2"
                onClick={(e) => setIsEdit(true)}
              >
                Edit
              </button>
            )}
            {(comment.user._id === user?._id ||
              (comment.user._id !== user?._id &&
                !comment.user.isAdmin &&
                myRole === BOARD_ROLES.ADMIN)) && (
              <div className="relative" ref={ref}>
                <button
                  onClick={() => {
                    setShowDelete((prevValue) => !prevValue);
                    setIsEdit(false);
                  }}
                  className="text-slate-500 hover:underline mr-2 relative"
                >
                  Delete
                </button>

                {showDelete && (
                  <div
                    className="delete-confirmation rounded absolute top-5 text-base left-0 z-50 bg-white shadow-xl border"
                    style={{
                      width: "300px",
                    }}
                  >
                    <header className="flex items-center justify-between p-3 border-b mb-2">
                      <span className="font-semibold text-sm">
                        Delete comment?
                      </span>
                      <button onClick={() => setShowDelete(false)}>
                        <HiOutlineX size={16} />
                      </button>
                    </header>

                    <div className="body p-3">
                      <p className="mb-4 text-sm text-gray-600">
                        Deleting a comment is forever. There is no undo.
                      </p>

                      <button
                        className="btn-danger w-full text-sm py-2"
                        onClick={() => deleteComment(comment._id, cardId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;

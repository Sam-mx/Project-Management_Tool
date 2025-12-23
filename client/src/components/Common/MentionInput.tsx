import React, { useState } from "react";
import { MentionsInput, Mention } from "react-mentions";

interface Props {
  value: string;
  onChange: (e: any) => void;
  members: any[]; // List of board members to suggest
  placeholder?: string;
}

const MentionInput = ({ value, onChange, members, placeholder }: Props) => {
  // Convert your member list to the format react-mentions needs: { id, display }
  const data = members.map((m) => ({
    id: m.memberId.username || "unknown", // The value to insert (e.g., @Sam)
    display: m.memberId.username || "Unknown", // The text to show in the list
    profile: m.memberId.profile, // Optional: for custom rendering
  }));

  return (
    <div className="mention-wrapper">
      <MentionsInput
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Write a comment... (Type @ to mention)"}
        className="mentions-input"
        style={defaultStyle}
      >
        <Mention
          trigger="@"
          data={data}
          style={mentionStyle}
          // Custom rendering for the dropdown list item
          renderSuggestion={(suggestion, search, highlightedDisplay) => (
            <div className="flex items-center gap-2 px-2 py-1">
              {/* You can add profile image here if available in your data */}
              <span className="font-medium">{suggestion.display}</span>
            </div>
          )}
          // How it looks in the text area after selection
          displayTransform={(id, display) => `@${display}`}
          markup="@__display__" // This sends plain text like @Sam to the backend
        />
      </MentionsInput>
    </div>
  );
};

// --- STYLES ---
// react-mentions uses inline styles for the core logic
const defaultStyle = {
  control: {
    backgroundColor: "#fff",
    fontSize: 14,
    fontWeight: "normal",
    minHeight: 60,
  },
  highlighter: {
    overflow: "hidden",
  },
  input: {
    margin: 0,
    border: "1px solid #e5e7eb", // gray-200
    borderRadius: "0.375rem", // rounded-md
    padding: "8px",
    outline: "none",
    overflow: "auto",
  },
  suggestions: {
    list: {
      backgroundColor: "white",
      border: "1px solid #e5e7eb",
      fontSize: 14,
      borderRadius: "6px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      zIndex: 9999,
    },
    item: {
      padding: "5px 15px",
      borderBottom: "1px solid rgba(0,0,0,0.05)",
      "&focused": {
        backgroundColor: "#ede9fe", // violet-100
        color: "#5b21b6", // violet-800
      },
    },
  },
};

const mentionStyle = {
  backgroundColor: "#ddd6fe", // violet-200
  borderRadius: 2,
  fontWeight: "bold",
  color: "#5b21b6",
};

export default MentionInput;

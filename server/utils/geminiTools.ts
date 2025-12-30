// server/utils/geminiTools.ts
import { Tool, SchemaType } from "@google/generative-ai";

export const AI_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "get_all_user_workspaces",
        description: "Fetch all spaces, their boards, and basic stats for the user.",
        parameters: { type: SchemaType.OBJECT, properties: {} }
      },
      {
        name: "create_space",
        description: "Create a new workspace.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: "Name of the new space" }
          },
          required: ["name"]
        }
      },
      {
        name: "create_board",
        description: "Create a new board within a specific space.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: "Name of the new board" },
            spaceName: { type: SchemaType.STRING, description: "The name of the space to put this board in" }
          },
          required: ["name", "spaceName"]
        }
      },
      {
        name: "get_board_data",
        description: "Fetch all lists and tasks. Note: Priority is calculated based on the due date.",
        parameters: { type: SchemaType.OBJECT, properties: {} }
      },
      {
        name: "create_task",
        description: "Create a new task. Note: Setting a due date automatically determines the priority.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: "Title of the task" },
            listName: { type: SchemaType.STRING, description: "List name" },
            dueDate: { type: SchemaType.STRING, format: "date-time", description: "ISO date (e.g. 2025-12-25)" }
          },
          required: ["name", "listName"]
        }
      },
      {
        name: "update_task",
        description: "Update task details or change the due date to shift priority.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            currentTaskName: { type: SchemaType.STRING },
            dueDate: { type: SchemaType.STRING, format: "date-time" },
            newListName: { type: SchemaType.STRING },
            isCompleted: { type: SchemaType.BOOLEAN }
          },
          required: ["currentTaskName"]
        }
      },
      {
  name: "get_ai_mode",
  description: "Check if the AI is currently in 'Command' (action-oriented) or 'Consultant' (advice-oriented) mode.",
  parameters: { type: SchemaType.OBJECT, properties: {} }
}
    ]
  }
];
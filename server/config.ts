// Server Configuration

// Base API Path
export const BASE_PATH = "/api/v1";

// Server URL (Dynamic for Cloud Deployment)
// Uses SERVER_URL env var (e.g. from Render) or defaults to localhost
const SERVER_URL = process.env.SERVER_URL || "http://localhost:8000";
export const BASE_PATH_COMPLETE = SERVER_URL + BASE_PATH;

// Client URL (Dynamic for Cloud Deployment)
// Uses CLIENT_URL env var (e.g. from Vercel) or defaults to localhost
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Paths
export const STATIC_PATH = "/static";

// Directory Names
export const PUBLIC_DIR_NAME = "public";
export const PROFILE_PICS_DIR_NAME = "profiles";
export const SPACE_ICONS_DIR_NAME = "space_icons";

// Token Settings
export const EMAIL_TOKEN_VALIDITY = 1800; // 1800s = 30mins
export const EMAIL_TOKEN_LENGTH = 94;
export const FORGOT_PASSWORD_TOKEN_LENGTH = 124;

// Image Dimensions
export const SPACE_ICON_SIZE = {
  WIDTH: 64,
  HEIGHT: 64,
};

export const PROFILE_SIZE = {
  WIDTH: 250,
  HEIGHT: 250,
};
export const Departments = ["CS", "Math", "English", "French", "Engineering"];

export const Departments_Options = Departments.map((department) => ({
    label: department,
    value: department
}))

export const CLASS_TEACHERS = [
  { id: 1, name: "J. DOE" },
  { id: 2, name: "A. SMITH" },
  { id: 3, name: "M. JOHNSON" },
];

export const CLASS_SUBJECTS = [
  { id: 1, name: "COMPUTER SCIENCE", code: "CS" },
  { id: 2, name: "MATHEMATICS", code: "MATH" },
  { id: 3, name: "ENGINEERING", code: "ENG" },
];

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
export const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const readOptionalEnv = (name: string, value: string | undefined) => {
  const trimmed = value?.trim();
  if (value !== undefined && !trimmed) {
    throw new Error(`${name} is set but empty.`);
  }
  return trimmed || undefined;
};

const readUrlEnv = (
  name: string,
  value: string | undefined,
  required = false,
) => {
  const configured = readOptionalEnv(name, value);
  if (!configured) {
    if (required) {
      throw new Error(`${name} must be set in the frontend environment.`);
    }
    return undefined;
  }

  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${name} must use http or https.`);
  }

  return configured.replace(/\/+$/, "");
};

export const CLOUDINARY_UPLOAD_URL = readUrlEnv(
  "VITE_CLOUDINARY_UPLOAD_URL",
  import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
);
export const CLOUDINARY_CLOUD_NAME = readOptionalEnv(
  "VITE_CLOUDINARY_CLOUD_NAME",
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
);
export const BACKEND_BASE_URL = readUrlEnv(
  "VITE_BACKEND_BASE_URL",
  import.meta.env.VITE_BACKEND_BASE_URL,
  true,
)!;

export const BASE_URL = readUrlEnv(
  "VITE_API_URL",
  import.meta.env.VITE_API_URL,
);
export const ACCESS_TOKEN_KEY = readOptionalEnv(
  "VITE_ACCESS_TOKEN_KEY",
  import.meta.env.VITE_ACCESS_TOKEN_KEY,
);
export const REFRESH_TOKEN_KEY = readOptionalEnv(
  "VITE_REFRESH_TOKEN_KEY",
  import.meta.env.VITE_REFRESH_TOKEN_KEY,
);

export const REFRESH_TOKEN_URL = BASE_URL
  ? `${BASE_URL}/refresh-token`
  : undefined;
export const CLOUDINARY_UPLOAD_PRESET = readOptionalEnv(
  "VITE_CLOUDINARY_UPLOAD_PRESET",
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
);

if (CLOUDINARY_CLOUD_NAME && !/^[\w-]+$/.test(CLOUDINARY_CLOUD_NAME)) {
  throw new Error("VITE_CLOUDINARY_CLOUD_NAME contains invalid characters.");
}

if (Boolean(CLOUDINARY_CLOUD_NAME) !== Boolean(CLOUDINARY_UPLOAD_PRESET)) {
  throw new Error(
    "Set both VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to enable Cloudinary uploads.",
  );
}

if (
  CLOUDINARY_UPLOAD_URL &&
  new URL(CLOUDINARY_UPLOAD_URL).hostname !== "api.cloudinary.com"
) {
  throw new Error(
    "VITE_CLOUDINARY_UPLOAD_URL must use the api.cloudinary.com host.",
  );
}
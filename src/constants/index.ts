export const Departments = ["CS", "IT", "ECE", "EEE", "MECH", "CIVIL"];

export const DepartmentOptions = Departments.map((department) => ({
    value: department,
    label: department
}))

export const MAX_FILE_SIZE = 3 * 1024 * 1024;

export const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
];

const readOptionalEnv = (key: string, value: string | undefined) => {
    const trimmedValue = value?.trim();

    if (value !== undefined && !trimmedValue) {
        throw new Error(`${key} is set but empty. Add a value or remove the variable.`);
    }

    return trimmedValue || undefined;
};

const readUrlEnv = (
    key: string,
    value: string | undefined,
    allowedProtocols: string[],
) => {
    const configuredValue = readOptionalEnv(key, value);
    if (!configuredValue) return undefined;

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(configuredValue);
    } catch {
        throw new Error(`${key} must be a valid absolute URL.`);
    }

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
        throw new Error(`${key} must use ${allowedProtocols.join(" or ")}.`);
    }

    return configuredValue.replace(/\/+$/, "");
};

const cloudinaryUploadUrl = readUrlEnv(
    "VITE_CLOUDINARY_UPLOAD_URL",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
    ["https:"],
);

const cloudinaryCloudName = readOptionalEnv(
    "VITE_CLOUDINARY_CLOUD_NAME",
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
);

if (
    cloudinaryCloudName &&
    !/^[A-Za-z0-9_-]+$/.test(cloudinaryCloudName)
) {
    throw new Error(
        "VITE_CLOUDINARY_CLOUD_NAME may only contain letters, numbers, underscores, and hyphens.",
    );
}

export const CLOUDINARY_UPLOAD_PRESET = readOptionalEnv(
    "VITE_CLOUDINARY_UPLOAD_PRESET",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
);

if (
    (cloudinaryUploadUrl || cloudinaryCloudName) &&
    !CLOUDINARY_UPLOAD_PRESET
) {
    throw new Error(
        "Cloudinary is partially configured. Set VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
}

export const CLOUDINARY_UPLOAD_URL = cloudinaryUploadUrl;
export const CLOUDINARY_CLOUD_NAME = cloudinaryCloudName;
export const BACKEND_BASE_URL = readUrlEnv(
    "VITE_BACKEND_BASE_URL",
    import.meta.env.VITE_BACKEND_BASE_URL,
    ["http:", "https:"],
);

export const BASE_URL = readUrlEnv(
    "VITE_API_URL",
    import.meta.env.VITE_API_URL,
    ["http:", "https:"],
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

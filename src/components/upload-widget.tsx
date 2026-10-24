import { Button } from "@/components/ui/button";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  MAX_FILE_SIZE,
} from "@/constants";
import { ImagePlus, LoaderCircle, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type UploadWidgetProps = {
  value?: string;
  onChange: (imageUrl?: string) => void;
  onPublicIdChange: (publicId?: string) => void;
};

type CloudinaryUploadInfo = {
  secure_url?: string;
  public_id?: string;
};

type CloudinaryUploadWidgetResult = {
  event: string;
  info?: CloudinaryUploadInfo | string;
};

type CloudinaryUploadWidget = {
  open: () => void;
  destroy: () => void;
};

type CloudinaryUploadWidgetOptions = {
  cloudName: string;
  uploadPreset: string;
  sources: string[];
  multiple: boolean;
  resourceType: "image";
  maxFileSize: number;
  clientAllowedFormats: string[];
};

type CloudinaryWindow = Window & {
  cloudinary?: {
    createUploadWidget: (
      options: CloudinaryUploadWidgetOptions,
      callback: (
        error: { message?: string } | null,
        result?: CloudinaryUploadWidgetResult,
      ) => void,
    ) => CloudinaryUploadWidget;
  };
};

const UPLOAD_WIDGET_SCRIPT_ID = "cloudinary-upload-widget-script";
const UPLOAD_WIDGET_SCRIPT_URL =
  "https://upload-widget.cloudinary.com/global/all.js";

const UploadWidget = ({
  value,
  onChange,
  onPublicIdChange,
}: UploadWidgetProps) => {
  const widgetRef = useRef<CloudinaryUploadWidget | null>(null);
  const onChangeRef = useRef(onChange);
  const onPublicIdChangeRef = useRef(onPublicIdChange);
  const [widgetReady, setWidgetReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [previewUrl, setPreviewUrl] = useState(value);

  useEffect(() => {
    onChangeRef.current = onChange;
    onPublicIdChangeRef.current = onPublicIdChange;
  }, [onChange, onPublicIdChange]);

  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  useEffect(() => {
    const cloudName = CLOUDINARY_CLOUD_NAME;
    const uploadPreset = CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      setUploadError(
        "Image upload is not configured. Set the Cloudinary cloud name and upload preset in the frontend environment.",
      );
      return;
    }

    let cancelled = false;
    let widget: CloudinaryUploadWidget | undefined;

    const initializeWidget = () => {
      const cloudinaryWindow = window as CloudinaryWindow;
      if (cancelled || !cloudinaryWindow.cloudinary) {
        return;
      }

      widget = cloudinaryWindow.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: [
            "local",
            "url",
            "camera",
            "image_search",
            "google_drive",
            "dropbox",
            "shutterstock",
            "gettyimages",
            "istock",
            "unsplash",
          ],
          multiple: false,
          resourceType: "image",
          maxFileSize: MAX_FILE_SIZE,
          clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
        },
        (error, result) => {
          if (error) {
            setUploading(false);
            setUploadError(error.message ?? "Cloudinary upload failed.");
            return;
          }

          if (result?.event === "upload-added") {
            setUploadError(undefined);
            setUploading(true);
          }

          if (
            result?.event === "success" &&
            result.info &&
            typeof result.info !== "string"
          ) {
            if (!result.info.secure_url || !result.info.public_id) {
              setUploading(false);
              setUploadError(
                "Cloudinary response did not include image details.",
              );
              return;
            }

            setPreviewUrl(result.info.secure_url);
            onChangeRef.current(result.info.secure_url);
            onPublicIdChangeRef.current(result.info.public_id);
            setUploading(false);
            setUploadError(undefined);
          }

          if (result?.event === "close") {
            setUploading(false);
          }
        },
      );

      widgetRef.current = widget;
      setWidgetReady(true);
    };

    const existingScript = document.getElementById(
      UPLOAD_WIDGET_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    const cloudinaryWindow = window as CloudinaryWindow;
    if (cloudinaryWindow.cloudinary) {
      initializeWidget();
    } else if (existingScript) {
      existingScript.addEventListener("load", initializeWidget);
      existingScript.addEventListener("error", () => {
        setUploadError("Could not load the Cloudinary upload widget.");
      });
    } else {
      const script = document.createElement("script");
      script.id = UPLOAD_WIDGET_SCRIPT_ID;
      script.src = UPLOAD_WIDGET_SCRIPT_URL;
      script.async = true;
      script.addEventListener("load", initializeWidget);
      script.addEventListener("error", () => {
        setUploadError("Could not load the Cloudinary upload widget.");
      });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      widget?.destroy();
      if (widgetRef.current === widget) {
        widgetRef.current = null;
      }
    };
  }, []);

  const removeImage = () => {
    setPreviewUrl(undefined);
    onChangeRef.current(undefined);
    onPublicIdChangeRef.current(undefined);
    setUploadError(undefined);
  };

  return (
    <div className="space-y-2">
      <div className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-input bg-muted/20 px-4 py-4 text-center sm:min-h-28">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Uploaded image preview"
            className="max-h-28 max-w-full rounded-md object-contain"
          />
        ) : (
          <ImagePlus
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => widgetRef.current?.open()}
            disabled={!widgetReady || uploading}
            className="gap-2"
          >
            {uploading ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            {uploading
              ? "Uploading..."
              : previewUrl
                ? "Change image"
                : widgetReady
                  ? "Upload image"
                  : "Loading uploader..."}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              onClick={removeImage}
              disabled={uploading}
              className="gap-2"
            >
              <X className="size-4" aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>
        {!previewUrl && (
          <p className="text-xs text-muted-foreground">
            Upload from your device, URL, camera, cloud storage, or supported
            image libraries. Maximum size 3 MB.
          </p>
        )}
      </div>
      {uploadError && (
        <p role="alert" className="text-sm text-destructive">
          {uploadError}
        </p>
      )}
    </div>
  );
};

export default UploadWidget;

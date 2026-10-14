import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ImagePlus, LoaderCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ALLOWED_TYPES,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL,
  MAX_FILE_SIZE,
} from '@/constants';

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

type CloudinaryResponse = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

type StoredUpload = {
  key: string;
  file: File;
};

type UploadStatus = 'empty' | 'queued' | 'offline' | 'uploading' | 'uploaded' | 'error';

type UploadwidgetsProps = {
  id: string;
  label: string;
  hint?: string;
  folder?: string;
  onUploadComplete?: (result: CloudinaryUploadResult | null) => void;
};

const QUEUE_DB_NAME = 'classroom-image-uploads';
const QUEUE_STORE_NAME = 'pending-files';

// Keep offline files in IndexedDB so they remain queued after a page reload.
const openUploadQueue = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(QUEUE_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(QUEUE_STORE_NAME)) {
        database.createObjectStore(QUEUE_STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local upload storage.'));
  });

const saveQueuedFile = async (key: string, file: File) => {
  const database = await openUploadQueue();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(QUEUE_STORE_NAME, 'readwrite');
      transaction.objectStore(QUEUE_STORE_NAME).put({ key, file } satisfies StoredUpload);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not save the offline upload.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Saving the offline upload was cancelled.'));
    });
  } finally {
    database.close();
  }
};

const readQueuedFile = async (key: string) => {
  const database = await openUploadQueue();
  try {
    return await new Promise<File | undefined>((resolve, reject) => {
      const request = database.transaction(QUEUE_STORE_NAME, 'readonly')
        .objectStore(QUEUE_STORE_NAME)
        .get(key);
      request.onsuccess = () => resolve((request.result as StoredUpload | undefined)?.file);
      request.onerror = () => reject(request.error ?? new Error('Could not restore the offline upload.'));
    });
  } finally {
    database.close();
  }
};

const removeQueuedFile = async (key: string) => {
  const database = await openUploadQueue();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(QUEUE_STORE_NAME, 'readwrite');
      transaction.objectStore(QUEUE_STORE_NAME).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not remove the queued upload.'));
    });
  } finally {
    database.close();
  }
};

const getUploadUrl = () => {
  if (CLOUDINARY_UPLOAD_URL) return CLOUDINARY_UPLOAD_URL;
  if (CLOUDINARY_CLOUD_NAME) {
    return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  }
  return '';
};

const Uploadwidgets = ({
  id,
  label,
  hint = 'PNG, JPG, or WebP. Maximum file size: 3 MB.',
  folder,
  onUploadComplete,
}: UploadwidgetsProps) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<UploadStatus>('empty');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const pendingFileRef = useRef<File | null>(null);
  const previewObjectUrlRef = useRef('');
  const uploadingRef = useRef(false);
  const mountedRef = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFileRef = useRef<() => Promise<void>>(async () => {});
  const onUploadCompleteRef = useRef(onUploadComplete);
  const queueKey = `${window.location.pathname}:${id}`;

  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete;
  }, [onUploadComplete]);

  const setLocalPreview = (file: File) => {
    if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current);
    const localUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = localUrl;
    setPreviewUrl(localUrl);
    setFileName(file.name);
  };

  const uploadPendingFile = useCallback(async () => {
    const file = pendingFileRef.current;
    if (!file || uploadingRef.current) return;

    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    const uploadUrl = getUploadUrl();
    if (!uploadUrl || !CLOUDINARY_UPLOAD_PRESET) {
      setStatus('error');
      setError('Cloudinary is not configured. Set the upload URL or cloud name and upload preset.');
      return;
    }

    uploadingRef.current = true;
    setStatus('uploading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      if (folder) formData.append('folder', folder);

      const response = await fetch(uploadUrl, { method: 'POST', body: formData });
      const result = (await response.json()) as CloudinaryResponse;

      if (!response.ok || !result.secure_url || !result.public_id) {
        throw new Error(result.error?.message || 'Cloudinary could not upload this image.');
      }

      await removeQueuedFile(queueKey);
      if (!mountedRef.current) return;

      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = '';
      }
      pendingFileRef.current = null;
      setPreviewUrl(result.secure_url);
      setStatus('uploaded');
      onUploadCompleteRef.current?.({
        secure_url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (uploadError) {
      if (!mountedRef.current) return;

      if (!navigator.onLine) {
        setStatus('offline');
        setError('');
      } else {
        setStatus('error');
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : 'An unexpected error occurred while uploading the image.',
        );
      }
    } finally {
      uploadingRef.current = false;
    }
  }, [folder, queueKey]);

  useEffect(() => {
    uploadFileRef.current = uploadPendingFile;
  }, [uploadPendingFile]);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const restoreQueuedFile = async () => {
      try {
        const file = await readQueuedFile(queueKey);
        if (cancelled || !file) return;
        pendingFileRef.current = file;
        setLocalPreview(file);
        setStatus(navigator.onLine ? 'queued' : 'offline');
        if (navigator.onLine) void uploadFileRef.current();
      } catch (restoreError) {
        if (!cancelled) {
          setStatus('error');
          setError(
            restoreError instanceof Error
              ? restoreError.message
              : 'Could not restore the queued upload.',
          );
        }
      }
    };

    const handleOnline = () => void uploadFileRef.current();
    window.addEventListener('online', handleOnline);
    void restoreQueuedFile();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current);
    };
  }, [queueKey]);

  const acceptFile = async (file?: File) => {
    if (!file) return;
    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus('error');
      setError('Choose a PNG, JPG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setStatus('error');
      setError('Image must be 3 MB or smaller.');
      return;
    }

    pendingFileRef.current = file;
    setLocalPreview(file);
    setStatus('queued');
    onUploadCompleteRef.current?.(null);

    try {
      await saveQueuedFile(queueKey, file);
    } catch (queueError) {
      if (!mountedRef.current) return;
      setStatus('error');
      setError(
        queueError instanceof Error
          ? `Could not save this image for offline upload: ${queueError.message}`
          : 'Could not save this image for offline upload.',
      );
      return;
    }

    if (navigator.onLine) void uploadFileRef.current();
    else setStatus('offline');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void acceptFile(event.currentTarget.files?.[0]);
    event.currentTarget.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void acceptFile(event.dataTransfer.files[0]);
  };

  const clearPreview = async () => {
    pendingFileRef.current = null;
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = '';
    }
    setPreviewUrl('');
    setFileName('');
    setError('');
    setStatus('empty');
    onUploadCompleteRef.current?.(null);
    try {
      await removeQueuedFile(queueKey);
    } catch (removeError) {
      setStatus('error');
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Could not remove the queued upload.',
      );
    }
  };

  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const statusMessage = {
    empty: 'Drop an image here or choose a file',
    queued: 'Image queued for upload',
    offline: 'Saved on this device. Upload will resume when you are online.',
    uploading: 'Uploading image…',
    uploaded: 'Image uploaded successfully',
    error: 'Upload needs attention',
  }[status];

  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      <div
        aria-busy={status === 'uploading'}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        className={`relative flex min-h-36 min-w-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors focus-within:ring-[3px] focus-within:ring-primary/20 ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-foreground/25 bg-background hover:border-primary/60 hover:bg-primary/5'
        }`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={`${label} preview`} className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-background/75 backdrop-blur-[2px]" />
            <div className="pointer-events-none relative z-10 flex min-w-0 flex-col items-center gap-2">
              <img src={previewUrl} alt="" className="size-20 rounded-lg border border-border object-cover shadow-sm" />
              <span className="max-w-full truncate text-sm font-medium text-foreground">{fileName}</span>
              <span className="text-xs text-muted-foreground">{statusMessage}</span>
            </div>
          </>
        ) : (
          <span className="pointer-events-none flex flex-col items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImagePlus aria-hidden="true" className="size-5" />
            </span>
            <span className="text-sm font-medium text-foreground">{statusMessage}</span>
            <span className="text-xs text-muted-foreground">PNG, JPG, or WebP up to 3 MB</span>
          </span>
        )}

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          aria-label={label}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hintId}
          disabled={status === 'uploading'}
          className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait"
          onChange={handleFileChange}
        />

        {status === 'uploading' && (
          <span className="absolute right-3 top-3 z-30 rounded-full bg-background/90 p-2 text-primary shadow">
            <LoaderCircle aria-label="Uploading" className="size-4 animate-spin" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 items-start justify-between gap-2">
        <div aria-live="polite" className="min-w-0 text-sm">
          {error ? (
            <p id={errorId} className="wrap-break-word text-destructive">{error}</p>
          ) : (
            <p id={hintId} className="text-muted-foreground">{hint}</p>
          )}
        </div>
        {previewUrl && status !== 'uploading' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1 px-2"
            onClick={() => void clearPreview()}
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <X aria-hidden="true" className="size-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

export default Uploadwidgets;

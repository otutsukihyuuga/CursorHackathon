import { useState, useCallback } from 'react';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface UseFileSaveReturn {
  saveState: SaveState;
  saveError: string | null;
  save: (blob: Blob, filename: string) => Promise<void>;
  resetSaveState: () => void;
}

/**
 * Saves an audio Blob to the user's local filesystem.
 *
 * Strategy:
 * 1. File System Access API (showSaveFilePicker) — Chrome 86+, Edge 86+
 *    Presents a native "Save As" dialog. The file is written directly to
 *    the chosen path on disk with no copy going to the Downloads folder.
 *
 * 2. Fallback: <a download> — all browsers
 *    Creates a temporary object URL and triggers a programmatic click on a
 *    hidden anchor element. The browser downloads the file to its configured
 *    Downloads folder (or shows a "Save As" dialog if the browser is set up
 *    that way). The object URL is revoked immediately after to free memory.
 *
 * Known limitations:
 * - Firefox: showSaveFilePicker is behind a flag (disabled by default as of 2024).
 *   The fallback download is used automatically.
 * - Safari: showSaveFilePicker is not supported. Fallback download is used.
 * - On iOS/Android, the fallback download behaviour varies by browser and OS
 *   version. Some mobile browsers may open audio inline rather than saving.
 * - The File System Access API requires a secure context (HTTPS or localhost).
 */
export function useFileSave(): UseFileSaveReturn {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = useCallback(async (blob: Blob, filename: string) => {
    setSaveState('saving');
    setSaveError(null);

    try {
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        // File System Access API path — write directly to chosen location
        const ext = filename.split('.').pop() ?? 'webm';
        // Strip codec parameters (e.g. "audio/webm;codecs=opus" → "audio/webm")
        // because showSaveFilePicker's accept object only accepts bare MIME types.
        const mimeType = (blob.type || `audio/${ext}`).split(';')[0];

        // Type assertion needed because showSaveFilePicker is not yet in
        // the TypeScript lib DOM types in all TS versions
        const fileHandle = await (
          window as Window & { showSaveFilePicker: (opts: object) => Promise<FileSystemFileHandle> }
        ).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'Audio file',
              accept: { [mimeType]: [`.${ext}`] },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        // Fallback: trigger browser download
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        // Delay revoke slightly to ensure the download has started
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      setSaveState('saved');
    } catch (err) {
      // AbortError means the user dismissed the save dialog — not an error
      if (err instanceof DOMException && err.name === 'AbortError') {
        setSaveState('idle');
        return;
      }
      setSaveError('Could not save the file. Please try again.');
      setSaveState('error');
    }
  }, []);

  const resetSaveState = useCallback(() => {
    setSaveState('idle');
    setSaveError(null);
  }, []);

  return { saveState, saveError, save, resetSaveState };
}

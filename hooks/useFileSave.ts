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
 */
export function useFileSave(): UseFileSaveReturn {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = useCallback(async (blob: Blob, filename: string) => {
    setSaveState('saving');
    setSaveError(null);

    try {
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        const ext = filename.split('.').pop() ?? 'webm';
        const mimeType = blob.type || `audio/${ext}`;

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

'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';

interface FileUploadProps {
  /** Called when the user selects or drops a valid audio file */
  onFileSelected: (file: File, url: string) => void;
  /** Currently selected file name — passed in by parent to allow external reset */
  currentFileName?: string | null;
}

const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',       // .mp3
  'audio/wav',        // .wav
  'audio/ogg',        // .ogg
  'audio/webm',       // .webm
  'audio/mp4',        // .m4a / .mp4
  'audio/aac',        // .aac
  'audio/flac',       // .flac
  'audio/x-m4a',      // .m4a alternate
];

function isAudioFile(file: File): boolean {
  return (
    ACCEPTED_AUDIO_TYPES.includes(file.type) ||
    // Fallback: accept any file whose name ends with a common audio extension
    /\.(mp3|wav|ogg|webm|mp4|m4a|aac|flac)$/i.test(file.name)
  );
}

/**
 * Drag-and-drop / click-to-browse audio file uploader.
 *
 * Validates that the selected file is an audio type and creates a local
 * object URL for preview. The parent is responsible for revoking the URL
 * when it is no longer needed.
 */
export default function FileUpload({ onFileSelected, currentFileName }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setValidationError(null);

    if (!isAudioFile(file)) {
      setValidationError('Please select an audio file (MP3, WAV, OGG, WEBM, M4A, AAC, or FLAC).');
      return;
    }

    const url = URL.createObjectURL(file);
    onFileSelected(file, url);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected after a discard
    e.target.value = '';
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload audio file. Click or drag and drop."
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? inputRef.current?.click() : undefined}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
          isDragging
            ? 'border-purple-400 bg-purple-500/10'
            : currentFileName
            ? 'border-green-500/40 bg-green-500/5'
            : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
        }`}
      >
        <span className="text-4xl" aria-hidden="true">
          {currentFileName ? '🎵' : '☁️'}
        </span>

        {currentFileName ? (
          <div className="text-center">
            <p className="text-green-400 font-medium text-sm">File selected</p>
            <p className="text-slate-300 text-sm mt-1 break-all max-w-xs">{currentFileName}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-slate-200 font-medium">
              {isDragging ? 'Drop your audio file here' : 'Drag & drop an audio file'}
            </p>
            <p className="text-slate-400 text-sm mt-1">or click to browse</p>
            <p className="text-slate-500 text-xs mt-2">MP3, WAV, OGG, WEBM, M4A, AAC, FLAC</p>
          </div>
        )}
      </div>

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        onChange={onInputChange}
      />

      {/* Validation error */}
      {validationError && (
        <p role="alert" className="text-red-400 text-sm px-1">
          {validationError}
        </p>
      )}
    </div>
  );
}

from __future__ import annotations

import json
import shutil
import sys
import threading
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

import soundfile as sf
import torch
from fastapi import UploadFile
from huggingface_hub import snapshot_download

from app.config import (
    LUXTTS_DIR,
    MODEL_WEIGHTS_DIR,
    OUTPUTS_DIR,
    UPLOADS_DIR,
    VOICES_DIR,
    settings,
)
from app.schemas import VoiceProfileMetadata, VoiceProfileResponse

if str(LUXTTS_DIR) not in sys.path:
    sys.path.insert(0, str(LUXTTS_DIR))

from zipvoice.luxvoice import LuxTTS


class LuxTTSService:
    def __init__(self) -> None:
        self._model: LuxTTS | None = None
        self._model_lock = threading.Lock()
        self._inference_lock = threading.Lock()
        for directory in (UPLOADS_DIR, VOICES_DIR, OUTPUTS_DIR, MODEL_WEIGHTS_DIR):
            directory.mkdir(parents=True, exist_ok=True)

    def model_loaded(self) -> bool:
        return self._model is not None

    def weights_cached(self) -> bool:
        required_files = (
            MODEL_WEIGHTS_DIR / "config.json",
            MODEL_WEIGHTS_DIR / "model.pt",
            MODEL_WEIGHTS_DIR / "tokens.txt",
            MODEL_WEIGHTS_DIR / "vocoder" / "config.yaml",
            MODEL_WEIGHTS_DIR / "vocoder" / "vocos.bin",
        )
        return all(path.exists() for path in required_files)

    def weights_path(self) -> Path:
        return MODEL_WEIGHTS_DIR

    def ensure_model_downloaded(self) -> Path:
        if self.weights_cached():
            return MODEL_WEIGHTS_DIR

        snapshot_download(
            repo_id=settings.model_repo,
            local_dir=str(MODEL_WEIGHTS_DIR),
        )
        return MODEL_WEIGHTS_DIR

    def available_voices(self) -> int:
        return len(list(VOICES_DIR.glob("*.json")))

    def list_voices(self) -> list[VoiceProfileMetadata]:
        voices: list[VoiceProfileMetadata] = []
        for metadata_path in sorted(VOICES_DIR.glob("*.json")):
            with metadata_path.open() as handle:
                voices.append(VoiceProfileMetadata.model_validate_json(handle.read()))
        return voices

    def get_model(self) -> LuxTTS:
        if self._model is not None:
            return self._model

        with self._model_lock:
            if self._model is None:
                self.ensure_model_downloaded()
                self._model = LuxTTS(
                    str(MODEL_WEIGHTS_DIR),
                    device=settings.device,
                    threads=settings.cpu_threads,
                )
        return self._model

    def create_voice_profile(
        self,
        reference_audio: UploadFile,
        voice_id: str | None,
        duration: float,
        rms: float,
    ) -> VoiceProfileResponse:
        profile_id = voice_id or uuid4().hex
        suffix = Path(reference_audio.filename or "reference.wav").suffix or ".wav"
        upload_path = UPLOADS_DIR / f"{profile_id}{suffix}"
        profile_path = VOICES_DIR / f"{profile_id}.pt"
        metadata_path = VOICES_DIR / f"{profile_id}.json"

        with upload_path.open("wb") as buffer:
            shutil.copyfileobj(reference_audio.file, buffer)

        model = self.get_model()
        with self._inference_lock:
            encoded_prompt = model.encode_prompt(
                str(upload_path),
                duration=duration,
                rms=rms,
            )

        cpu_prompt = {
            key: value.detach().cpu() if torch.is_tensor(value) else value
            for key, value in encoded_prompt.items()
        }
        torch.save(cpu_prompt, profile_path)

        metadata = VoiceProfileMetadata(
            voice_id=profile_id,
            original_filename=reference_audio.filename or upload_path.name,
            reference_audio_path=str(upload_path),
            profile_path=str(profile_path),
            duration=duration,
            rms=rms,
            created_at=datetime.now(UTC).isoformat(),
        )
        metadata_path.write_text(metadata.model_dump_json(indent=2))

        return VoiceProfileResponse(
            voice_id=profile_id,
            reference_audio_path=str(upload_path),
            profile_path=str(profile_path),
            duration=duration,
            rms=rms,
        )

    def synthesize(
        self,
        voice_id: str,
        text: str,
        num_steps: int,
        guidance_scale: float,
        t_shift: float,
        speed: float,
        return_smooth: bool,
    ) -> Path:
        profile_path = VOICES_DIR / f"{voice_id}.pt"
        if not profile_path.exists():
            raise FileNotFoundError(f"Unknown voice profile: {voice_id}")

        model = self.get_model()
        encode_dict = torch.load(profile_path, map_location="cpu")
        encode_dict = self._move_encode_dict_to_runtime_device(encode_dict, model.device)

        with self._inference_lock:
            waveform = model.generate_speech(
                text=text,
                encode_dict=encode_dict,
                num_steps=num_steps,
                guidance_scale=guidance_scale,
                t_shift=t_shift,
                speed=speed,
                return_smooth=return_smooth,
            )

        output_path = OUTPUTS_DIR / f"{voice_id}-{datetime.now(UTC).strftime('%Y%m%dT%H%M%S')}.wav"
        sf.write(output_path, waveform.numpy().squeeze(), 48_000)
        return output_path

    @staticmethod
    def _move_encode_dict_to_runtime_device(
        encode_dict: dict[str, Any],
        device: str,
    ) -> dict[str, Any]:
        prepared: dict[str, Any] = {}
        for key, value in encode_dict.items():
            if torch.is_tensor(value):
                prepared[key] = value.to(device)
            else:
                prepared[key] = value
        return prepared


service = LuxTTSService()

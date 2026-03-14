from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
VOICES_DIR = DATA_DIR / "voices"
OUTPUTS_DIR = DATA_DIR / "outputs"
MODEL_WEIGHTS_DIR = ROOT_DIR / "ModelWeights" / "LuxTTS"
LUXTTS_DIR = ROOT_DIR / "vendor" / "LuxTTS"


@dataclass(frozen=True)
class Settings:
    model_repo: str = os.getenv("LUXTTS_MODEL_REPO", "YatharthS/LuxTTS")
    device: str = os.getenv("LUXTTS_DEVICE", "cpu")
    cpu_threads: int = int(os.getenv("LUXTTS_CPU_THREADS", "2"))
    default_ref_duration: float = float(os.getenv("LUXTTS_REF_DURATION", "5"))
    default_rms: float = float(os.getenv("LUXTTS_RMS", "0.01"))
    download_weights_on_startup: bool = os.getenv("LUXTTS_DOWNLOAD_WEIGHTS_ON_STARTUP", "true").lower() == "true"


settings = Settings()

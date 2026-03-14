from __future__ import annotations

from pydantic import BaseModel, Field


class VoiceProfileResponse(BaseModel):
    voice_id: str
    reference_audio_path: str
    profile_path: str
    duration: float
    rms: float


class VoiceProfileMetadata(BaseModel):
    voice_id: str
    original_filename: str
    reference_audio_path: str
    profile_path: str
    duration: float
    rms: float
    created_at: str


class SynthesisRequest(BaseModel):
    voice_id: str = Field(..., description="Previously encoded voice profile ID")
    text: str = Field(..., min_length=1)
    num_steps: int = Field(4, ge=1, le=16)
    guidance_scale: float = Field(3.0, gt=0)
    t_shift: float = Field(0.5, gt=0)
    speed: float = Field(1.0, gt=0)
    return_smooth: bool = False


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    configured_device: str
    weights_cached: bool
    weights_path: str
    available_voices: int

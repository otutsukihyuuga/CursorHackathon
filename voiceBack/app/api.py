from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.config import settings
from app.schemas import HealthResponse, SynthesisRequest, VoiceProfileMetadata, VoiceProfileResponse
from app.service import service


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.download_weights_on_startup:
        service.ensure_model_downloaded()
    yield


app = FastAPI(
    title="LuxTTS Backend",
    version="0.1.0",
    description="Zero-shot voice cloning API backed by LuxTTS.",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=service.model_loaded(),
        configured_device=settings.device,
        weights_cached=service.weights_cached(),
        weights_path=str(service.weights_path()),
        available_voices=service.available_voices(),
    )


@app.get("/voices", response_model=list[VoiceProfileMetadata])
def list_voices() -> list[VoiceProfileMetadata]:
    return service.list_voices()


@app.post("/voices", response_model=VoiceProfileResponse)
def create_voice_profile(
    reference_audio: UploadFile = File(...),
    voice_id: str | None = Form(default=None),
    duration: float = Form(default=settings.default_ref_duration),
    rms: float = Form(default=settings.default_rms),
) -> VoiceProfileResponse:
    if not reference_audio.filename:
        raise HTTPException(status_code=400, detail="Reference audio filename is required.")

    try:
        return service.create_voice_profile(
            reference_audio=reference_audio,
            voice_id=voice_id,
            duration=duration,
            rms=rms,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/synthesize")
def synthesize(request: SynthesisRequest) -> FileResponse:
    try:
        output_path = service.synthesize(
            voice_id=request.voice_id,
            text=request.text,
            num_steps=request.num_steps,
            guidance_scale=request.guidance_scale,
            t_shift=request.t_shift,
            speed=request.speed,
            return_smooth=request.return_smooth,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return FileResponse(
        path=output_path,
        media_type="audio/wav",
        filename=output_path.name,
    )

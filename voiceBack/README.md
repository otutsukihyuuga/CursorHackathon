# LuxTTS FastAPI Backend

Small `uv`-managed backend for zero-shot voice cloning with [LuxTTS](https://github.com/ysharma3501/LuxTTS).

## What this does

- Clones the LuxTTS repo locally under `vendor/LuxTTS`
- Exposes a FastAPI service for:
  - uploading a reference clip and caching a voice profile
  - synthesizing new speech from text using that cached profile
- Stores generated files under `data/`

## Model weights

The model weights are **not** checked into git, but the app now downloads them on startup into:

```bash
voiceBack/ModelWeights/LuxTTS
```

The backend uses that local folder for inference instead of relying on the default Hugging Face cache path.

Startup behavior:

- On app startup, a weights check runs automatically.
- If the LuxTTS weights are missing, they are downloaded from `YatharthS/LuxTTS`.
- If the files are already present in `voiceBack/ModelWeights/LuxTTS`, no re-download happens.

You can disable startup downloading with:

```bash
export LUXTTS_DOWNLOAD_WEIGHTS_ON_STARTUP=false
```

Check weight status with:

```bash
curl http://127.0.0.1:8000/health
```

## Run

```bash
uv run --no-sync python main.py
```

Or:

```bash
uv run --no-sync uvicorn app.api:app --host 0.0.0.0 --port 8000
```

Or use `make` shortcuts:

```bash
make run
make health
make download-weights
```

On this machine, `cpu` is the recommended backend device. `mps` can load the model but currently fails during synthesis due to a PyTorch MPS backend issue in this stack.

## Create a voice profile

Upload a clean 3-8 second sample once and keep the returned `voice_id`.

```bash
curl -X POST http://127.0.0.1:8000/voices \
  -F "reference_audio=@/absolute/path/to/my-voice.wav" \
  -F "voice_id=me" \
  -F "duration=5" \
  -F "rms=0.01"
```

## Generate speech

```bash
curl -X POST http://127.0.0.1:8000/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "voice_id": "me",
    "text": "This is a cloned version of my voice.",
    "num_steps": 4,
    "guidance_scale": 3.0,
    "t_shift": 0.5,
    "speed": 1.0,
    "return_smooth": false
  }' \
  --output output.wav
```

## API endpoints

- `GET /health`
- `GET /voices`
- `POST /voices`
- `POST /synthesize`

## Docker

Build the container:

```bash
make docker-build
```

Run it:

```bash
make docker-run
```

Or with plain Docker Compose:

```bash
docker compose up --build
```

The container runs on `cpu` and persists these folders from your repo:

- `ModelWeights/` -> `/app/ModelWeights`
- `data/` -> `/app/data`

That means downloaded weights and generated audio survive container restarts.

Stop it with:

```bash
make docker-stop
```

## Notes

- Default device is `cpu`. Override with `LUXTTS_DEVICE`.
- `make run` defaults to `DEVICE=cpu`.
- `make docker-run` also uses `cpu` by default.
- For this project, voice cloning is zero-shot and profile-based: you upload reference audio once, then reuse the saved profile for future synthesis requests.
- Model weights are stored under `ModelWeights/LuxTTS`.
- Reference audio is saved under `data/uploads/`, profiles under `data/voices/`, and outputs under `data/outputs/`.

.PHONY: help run run-no-download health voices download-weights clean-weights device-info docker-build docker-run docker-stop docker-logs

PYTHON := ./.venv/bin/python
HOST ?= 127.0.0.1
PORT ?= 8000
DEVICE ?= cpu

help:
	@echo "Available commands:"
	@echo "  make run DEVICE=$(DEVICE)              Start the FastAPI app"
	@echo "  make run-no-download DEVICE=$(DEVICE)  Start app without startup weight download"
	@echo "  make health                            Call the /health endpoint"
	@echo "  make voices                            Call the /voices endpoint"
	@echo "  make download-weights                  Download LuxTTS weights into ModelWeights/"
	@echo "  make clean-weights                     Remove downloaded model weights"
	@echo "  make device-info                       Show Python arch and MPS support"
	@echo "  make docker-build                      Build the Docker image"
	@echo "  make docker-run                        Start the app with Docker Compose"
	@echo "  make docker-stop                       Stop the Docker Compose app"
	@echo "  make docker-logs                       Tail Docker Compose logs"
	@echo ""
	@echo "Recommended on this machine: DEVICE=cpu"

run:
	LUXTTS_DEVICE=$(DEVICE) $(PYTHON) -m uvicorn app.api:app --host $(HOST) --port $(PORT)

run-no-download:
	LUXTTS_DEVICE=$(DEVICE) LUXTTS_DOWNLOAD_WEIGHTS_ON_STARTUP=false $(PYTHON) -m uvicorn app.api:app --host $(HOST) --port $(PORT)

health:
	curl http://$(HOST):$(PORT)/health

voices:
	curl http://$(HOST):$(PORT)/voices

download-weights:
	$(PYTHON) -c "from app.service import service; print(service.ensure_model_downloaded())"

clean-weights:
	rm -rf ModelWeights/LuxTTS

device-info:
	$(PYTHON) -c "import platform, torch; print('python_arch=', platform.machine()); print('mps_built=', torch.backends.mps.is_built()); print('mps_available=', torch.backends.mps.is_available())"

docker-build:
	docker compose build

docker-run:
	docker compose up --build

docker-stop:
	docker compose down

docker-logs:
	docker compose logs -f

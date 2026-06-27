# withoutBG Open Weights Inference (v3)

Docker images and FastAPI service for the withoutBG open weights ONNX model.

## Images

| Image | Description |
|-------|-------------|
| `withoutbg-openweights-v3-service-cpu` | Inference API only (CPU) |
| `withoutbg-openweights-v3-service-gpu` | Inference API only (GPU) |
| `withoutbg-openweights-v3-app-cpu` | Web UI + API (CPU) |
| `withoutbg-openweights-v3-app-gpu` | Web UI + API (GPU) |

Docker Hub: `withoutbg/withoutbg-openweights-v3-*`

## Build

```bash
docker buildx bake -f docker-bake.hcl
```

Build a single image:

```bash
docker buildx bake -f docker-bake.hcl app-cpu
```

## Run

```bash
docker run --rm -p 8000:8000 withoutbg-openweights-v3-service-cpu
docker run --rm -p 8080:8080 withoutbg-openweights-v3-app-cpu
```

After baking, use Compose:

```bash
docker compose up app-cpu
```

## Development

Production Docker images bake the ~500 MB model at build time and do not hot-reload. For day-to-day work, use native dev with a one-time model download:

```bash
# 1. Download model once (~500 MB, cached in .cache/model/)
./scripts/dev-download-model.sh

# 2. API with hot reload (port 8000)
./scripts/dev-api.sh

# 3. UI with hot reload (port 3000, proxies /api → :8000)
cd ui && npm install && npm run dev
```

Edit Python under `service/` or `model/` and uvicorn reloads automatically. Edit React under `ui/src/` and Next.js hot-reloads.

**UI-only work** (no real inference): `NEXT_PUBLIC_USE_MOCK=true npm run dev` in `ui/`.

**Docker dev** (same hot reload, cached model mount):

```bash
./scripts/dev-download-model.sh
docker compose -f docker-compose.dev.yml up --build
```

The first `docker compose -f docker-compose.dev.yml build` installs Python deps only (no model download). Rebuild only when `pyproject.toml` changes.

**Production-like testing** still uses `docker buildx bake` + `docker compose up service-cpu`.

## License

Apache-2.0 for this repository's code. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for upstream model attribution.

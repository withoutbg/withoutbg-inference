# withoutBG Open Weights Inference (v3)

![withoutBG Docker](docs/docker-hero.webp)

**Self-host background removal. Docker images and FastAPI for the withoutBG open weights ONNX model — CPU or NVIDIA GPU.**

Run a browser UI, a headless API, or both. Same open-weights quality as the Python package and Mac app, on your own server.

**[Docker docs →](https://withoutbg.com/docs/open-model/docker?utm_source=github&utm_medium=withoutbg-inference-readme&utm_campaign=main-readme)** · **[GPU docs →](https://withoutbg.com/docs/open-model/docker-gpu?utm_source=github&utm_medium=withoutbg-inference-readme&utm_campaign=main-readme)** · **[Local API docs →](https://withoutbg.com/docs/open-model/local-api?utm_source=github&utm_medium=withoutbg-inference-readme&utm_campaign=main-readme)**

## See the results

![Example 1](sample-results/open-weights/example1.png)
![Example 2](sample-results/open-weights/example2.png)
![Example 3](sample-results/open-weights/example3.png)

**[Open Weights results →](https://withoutbg.com/open-model/results?utm_source=github&utm_medium=withoutbg-inference-readme&utm_campaign=main-readme)** · **[Cloud API results →](https://withoutbg.com/pro-model/results?utm_source=github&utm_medium=withoutbg-inference-readme&utm_campaign=main-readme)** · **[Compare →](https://withoutbg.com/compare/withoutbg-open-model-vs-pro-model?utm_source=github&utm_medium=withoutbg-inference-readme&utm_campaign=main-readme)**

## Images

| Image | Description |
|-------|-------------|
| `withoutbg-openweights-v3-service-cpu` | Inference API only (CPU), headless |
| `withoutbg-openweights-v3-service-gpu` | Inference API only (GPU), headless |
| `withoutbg-openweights-v3-app-cpu` | Web UI + API (CPU) |
| `withoutbg-openweights-v3-app-gpu` | Web UI + API (GPU) |

Docker Hub: `withoutbg/withoutbg-openweights-v3-*`

CPU images are published for **linux/amd64** and **linux/arm64** (Intel/AMD and Apple Silicon / ARM servers). GPU images are **linux/amd64** only (NVIDIA CUDA).

**App image (web UI + API)** — drag-and-drop background removal in the browser, same API under `/api`:

![withoutBG Docker web app showing a cutout preview after background removal](docs/docker-app.webp)

**Service image (API only / headless)** — FastAPI with no UI. Interactive OpenAPI / Swagger at `/docs`:

![Swagger UI for the withoutBG headless Docker service listing remove-background and health endpoints](docs/docker-service-swagger.webp)

## Quick start

```bash
# Web UI + API (CPU) — open http://localhost:8080
docker run --rm -p 8080:8080 withoutbg/withoutbg-openweights-v3-app-cpu:latest

# API only (CPU) — OpenAPI at http://localhost:8000/docs
docker run --rm -p 8000:8000 withoutbg/withoutbg-openweights-v3-service-cpu:latest
```

GPU images require an NVIDIA GPU and the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html):

```bash
docker run --rm --gpus all -p 8000:8000 withoutbg/withoutbg-openweights-v3-service-gpu:latest
docker run --rm --gpus all -p 8080:8080 withoutbg/withoutbg-openweights-v3-app-gpu:latest
```

After baking locally, use Compose:

```bash
docker compose up app-cpu
```

## Build

```bash
docker buildx bake -f docker-bake.hcl
```

Build a single image:

```bash
docker buildx bake -f docker-bake.hcl app-cpu
```

Build for one platform locally (faster on Apple Silicon):

```bash
docker buildx bake -f docker-bake.hcl app-cpu --set '*.platform=linux/arm64'
```

CI downloads the ~455 MB model once via `huggingface_hub`. Add a [`HF_TOKEN`](https://huggingface.co/settings/tokens) repository secret for reliable Hugging Face downloads from GitHub Actions.

## Development

Production Docker images bake the ~455 MB model at build time and do not hot-reload. For day-to-day work, use native dev with a one-time model download:

```bash
# 1. Download model once (~455 MB, cached in .cache/model/)
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

## More than Docker

This repo is the **self-host** path: HTTP API and browser UI on your own machine or server. Same open-weights technology powers the rest of the ecosystem:

| Surface | Choose when |
|---|---|
| **[Python package](https://github.com/withoutbg/withoutbg-python)** | You want to embed withoutBG in scripts, notebooks, or backends |
| **[Mac app](https://withoutbg.com/mac?utm_source=github&utm_medium=withoutbg-inference-readme&utm_campaign=main-readme)** | You want a native desktop cutout tool, with an optional Local API for plugins and scripts |
| **[GIMP plugin](https://github.com/withoutbg/withoutbg-gimp)** | You edit in GIMP 3 and want a private, mask-first workflow via Mac Local API or this Docker service |
| **[Hugging Face](https://huggingface.co/withoutbg/withoutbg-openweights-onnx)** · **[Space](https://huggingface.co/spaces/withoutbg/withoutbg)** | You want to try a demo or download the ONNX weights directly |
| **[Cloud API](https://withoutbg.com/pro-model?utm_source=github&utm_medium=withoutbg-inference-readme&utm_campaign=main-readme)** | You need maximum quality without running inference yourself |

```bash
# In-process Python (no Docker)
# https://github.com/withoutbg/withoutbg-python
uv add withoutbg
```

## Model

The withoutBG Open Weights Model is a unified ONNX graph hosted at [withoutbg/withoutbg-openweights-onnx](https://huggingface.co/withoutbg/withoutbg-openweights-onnx). Depth, segmentation, matting, and refinement run in one pass. Built with DINOv3.

Licensed under the [withoutBG Open Model License](https://withoutbg.com/open-model/license?utm_source=github&utm_medium=withoutbg-inference-readme&utm_campaign=main-readme) (Apache 2.0 for withoutBG portions; Meta DINOv3 License for DINOv3 backbone weights).

## License

Apache-2.0 for this repository's code. Built with DINOv3. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for upstream model attribution.

## Support

- **Bugs / questions:** [GitHub Issues](https://github.com/withoutbg/withoutbg-inference/issues)
- **Docker docs:** [withoutbg.com/docs/open-model/docker](https://withoutbg.com/docs/open-model/docker?utm_source=github&utm_medium=withoutbg-inference-readme&utm_campaign=main-readme)
- **Commercial:** [contact@withoutbg.com](mailto:contact@withoutbg.com)

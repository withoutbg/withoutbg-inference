# withoutBG Open Weights v3 — Inference API (GPU)

Self-hosted [withoutBG](https://withoutbg.com) open weights background removal API with GPU acceleration. Runs the v3 ONNX model via CUDA for faster inference.

## Quick start

Requires an NVIDIA GPU and the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html).

```bash
docker run --rm --gpus all -p 8000:8000 withoutbg/withoutbg-openweights-v3-service-gpu:latest
```

Health check: `http://localhost:8000/health`

## Platforms

Published for **linux/amd64** only (NVIDIA CUDA on x86_64).

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Liveness probe |
| `/ready` | GET | Readiness probe (model loaded) |
| `/v1/remove-background` | POST | Remove image background (JSON or raw image body) |
| `/v1/licenses` | GET | Model and dependency licenses |
| `/docs` | GET | OpenAPI / Swagger UI |

Example (JSON — web UI and scripting):

```bash
curl -X POST http://localhost:8000/v1/remove-background \
  -H "Content-Type: application/json" \
  -d '{"image":"<base64-encoded-image>"}'
```

Example (raw PNG — GIMP plugin and other local clients):

```bash
curl -X POST "http://localhost:8000/v1/remove-background?output=matte" \
  -H "Content-Type: image/png" \
  --data-binary @photo.png \
  -o matte.png
```

## Related images

| Image | Use case |
|-------|----------|
| `withoutbg/withoutbg-openweights-v3-service-cpu` | Same API, CPU only |
| `withoutbg/withoutbg-openweights-v3-app-cpu` | Web UI + API (CPU) |
| `withoutbg/withoutbg-openweights-v3-app-gpu` | Web UI + API (GPU) |

## Links

- [withoutBG open weights model](https://withoutbg.com/open-weights-model)
- [Source on GitHub](https://github.com/withoutbg/withoutbg-inference)
- License: Apache-2.0 (see `/v1/licenses` in the running container)

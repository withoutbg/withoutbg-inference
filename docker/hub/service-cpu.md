# withoutBG Open Weights v3 — Inference API (CPU)

Self-hosted [withoutBG](https://withoutbg.com) open weights background removal API. Runs the v3 ONNX model on CPU with a FastAPI service — no GPU required.

## Quick start

```bash
docker run --rm -p 8000:8000 withoutbg/withoutbg-openweights-v3-service-cpu:latest
```

Health check: `http://localhost:8000/health`

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
| `withoutbg/withoutbg-openweights-v3-service-gpu` | Same API, GPU acceleration |
| `withoutbg/withoutbg-openweights-v3-app-cpu` | Web UI + API (CPU) |
| `withoutbg/withoutbg-openweights-v3-app-gpu` | Web UI + API (GPU) |

## Links

- [withoutBG open weights model](https://withoutbg.com/open-weights-model)
- [Source on GitHub](https://github.com/withoutbg/withoutbg-inference)
- License: Apache-2.0 (see `/v1/licenses` in the running container)

# withoutBG Open Weights v3 — Inference API (CPU)

Self-hosted [withoutBG](https://withoutbg.com) open weights background removal API. Runs the v3 ONNX model on CPU with a FastAPI service — no GPU required.

## Quick start

```bash
docker run --rm -p 8000:8000 withoutbg/withoutbg-openweights-v3-service-cpu:latest
```

Health check: `http://localhost:8000/health`

## Platforms

Published for **linux/amd64** and **linux/arm64**. Docker pulls the matching architecture automatically (Intel/AMD, Apple Silicon, AWS Graviton, etc.).

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Liveness probe |
| `/ready` | GET | Readiness probe (model loaded) |
| `/v1/remove-background` | POST | Remove image background (raw image or multipart) |
| `/v1/licenses` | GET | Model and dependency licenses |
| `/docs` | GET | OpenAPI / Swagger UI |

Same input/output schema as the withoutBG Mac Local API: send a raw JPEG/PNG body (or multipart field `image`); response is `image/png` with headers `X-Latency-Ms`, `X-Route-Category` and `X-Route-Pipeline` (`matting` or `birefnet`). Use `?output=matte` for a grayscale alpha matte instead of the default cutout.

```bash
curl -X POST \
  --data-binary @photo.jpg \
  -H "Content-Type: image/jpeg" \
  http://127.0.0.1:8000/v1/remove-background \
  -o result.png
```

```bash
curl -X POST "http://127.0.0.1:8000/v1/remove-background?output=matte" \
  -H "Content-Type: image/png" \
  --data-binary @photo.png \
  -o matte.png
```

## Model

The withoutBG Open Weights 10.8.0 bundle (~1.5 GB, baked into the image): a trained router sends fine strands, soft detail and transparency to the withoutBG matting model, and hard opaque objects, flat scenes and vehicles to BiRefNet. Only the selected branch runs.

## Related images

| Image | Use case |
|-------|----------|
| `withoutbg/withoutbg-openweights-v3-service-gpu` | Same API, GPU acceleration |
| `withoutbg/withoutbg-openweights-v3-app-cpu` | Web UI + API (CPU) |
| `withoutbg/withoutbg-openweights-v3-app-gpu` | Web UI + API (GPU) |

## Links

- [withoutBG open model](https://withoutbg.com/open-model)
- [Source on GitHub](https://github.com/withoutbg/withoutbg-inference)
- License: Apache-2.0 for the code; the model is under the [withoutBG Open Weights license](https://withoutbg.com/open-model/license) and includes DINOv3, Depth Anything V2 (Apache-2.0) and BiRefNet (MIT). See `/v1/licenses` in the running container

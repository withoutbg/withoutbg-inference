# withoutBG Open Weights v3 — Web App (CPU)

Self-hosted [withoutBG](https://withoutbg.com) background removal web app with built-in API. Upload images in the browser, remove backgrounds with the open weights v3 ONNX model — no GPU required.

## Quick start

```bash
docker run --rm -p 8080:8080 withoutbg/withoutbg-openweights-v3-app-cpu:latest
```

Open `http://localhost:8080` in your browser.

The bundled API is available at `http://localhost:8080/api` (proxied to the internal FastAPI service).

## Platforms

Published for **linux/amd64** and **linux/arm64**. Docker pulls the matching architecture automatically (Intel/AMD, Apple Silicon, AWS Graviton, etc.).

## What's included

- Drag-and-drop web UI for background removal
- FastAPI inference service (`/api/v1/remove-background`)
- Health endpoint at `/health`

## Model

The withoutBG Open Weights 10.8.0 bundle (~1.5 GB, baked into the image): a trained router sends fine strands, soft detail and transparency to the withoutBG matting model, and hard opaque objects, flat scenes and vehicles to BiRefNet. Only the selected branch runs.

## Related images

| Image | Use case |
|-------|----------|
| `withoutbg/withoutbg-openweights-v3-app-gpu` | Same app, GPU acceleration |
| `withoutbg/withoutbg-openweights-v3-service-cpu` | API only (CPU) |
| `withoutbg/withoutbg-openweights-v3-service-gpu` | API only (GPU) |

## Links

- [withoutBG open model](https://withoutbg.com/open-model)
- [Source on GitHub](https://github.com/withoutbg/withoutbg-inference)
- License: Apache-2.0 for the code; the model is under the [withoutBG Open Weights license](https://withoutbg.com/open-model/license) and includes DINOv3, Depth Anything V2 (Apache-2.0) and BiRefNet (MIT). See `/v1/licenses` in the running container

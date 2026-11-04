# withoutBG Open Weights v4 — Web App (CPU)

Self-hosted [withoutBG](https://withoutbg.com?utm_source=dockerhub&utm_medium=readme&utm_campaign=open-weights-v4&utm_content=withoutbg-inference-home) background removal web app with built-in API. Upload images in the browser, remove backgrounds with the open weights v4 ONNX model — no GPU required.

**New in v4: Smart brush.** Paint what to keep and what to remove; a small stroke-edit network fixes the cutout. Open a result and choose *Smart brush*.

## Quick start

```bash
docker run --rm -p 8080:8080 withoutbg/withoutbg-openweights-v4-app-cpu:latest
```

Open `http://localhost:8080` in your browser.

The bundled API is available at `http://localhost:8080/api` (proxied to the internal FastAPI service).

## Platforms

Published for **linux/amd64** and **linux/arm64**. Docker pulls the matching architecture automatically (Intel/AMD, Apple Silicon, AWS Graviton, etc.).

## What's included

- Drag-and-drop web UI for background removal
- FastAPI inference service (`/api/v1/remove-background`)
- Health endpoint at `/health`

## Optional: withoutBG Pro

Set `-e WITHOUTBG_API_KEY=sk_your_key` and an **Open weights / Pro** switch appears in the web UI. Pro uploads the image to api.withoutbg.com (1 credit each). The open weights stay the default and never send images anywhere. Keys: [withoutBG Pro](https://withoutbg.com/pro-model-api?utm_source=dockerhub&utm_medium=readme&utm_campaign=open-weights-v4&utm_content=withoutbg-inference-pro-model-api).

## Model

The withoutBG Open Weights 10.8.0 bundle (~1.5 GB, baked into the image): a trained router sends fine strands, soft detail and transparency to the withoutBG matting model, and hard opaque objects, flat scenes and vehicles to BiRefNet. Only the selected branch runs.

## Related images

| Image | Use case |
|-------|----------|
| `withoutbg/withoutbg-openweights-v4-app-gpu` | Same app, GPU acceleration |
| `withoutbg/withoutbg-openweights-v4-service-cpu` | API only (CPU) |
| `withoutbg/withoutbg-openweights-v4-service-gpu` | API only (GPU) |

## Links

- [withoutBG open model](https://withoutbg.com/open-model?utm_source=dockerhub&utm_medium=readme&utm_campaign=open-weights-v4&utm_content=withoutbg-inference-open-model)
- [Source on GitHub](https://github.com/withoutbg/withoutbg-inference)
- License: Apache-2.0 for the code; the model is under the [withoutBG Open Weights license](https://withoutbg.com/open-model/license?utm_source=dockerhub&utm_medium=readme&utm_campaign=open-weights-v4&utm_content=withoutbg-inference-open-model-license) and includes DINOv3, Depth Anything V2 (Apache-2.0) and BiRefNet (MIT). See `/v1/licenses` in the running container

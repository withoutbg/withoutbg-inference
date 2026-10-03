# withoutBG Open Weights v3 — Web App (GPU)

Self-hosted [withoutBG](https://withoutbg.com) background removal web app with GPU-accelerated inference. Upload images in the browser and remove backgrounds using the open weights v3 ONNX model on CUDA.

## Quick start

Requires an NVIDIA GPU and the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html).

```bash
docker run --rm --gpus all -p 8080:8080 withoutbg/withoutbg-openweights-v3-app-gpu:latest
```

Open `http://localhost:8080` in your browser.

The bundled API is available at `http://localhost:8080/api` (proxied to the internal FastAPI service).

## Platforms

Published for **linux/amd64** only (NVIDIA CUDA on x86_64).

## What's included

- Drag-and-drop web UI for background removal
- FastAPI inference service (`/api/v1/remove-background`)
- Health endpoint at `/health`

## Model

The withoutBG Open Weights 10.8.0 bundle (~1.5 GB, baked into the image): a trained router sends fine strands, soft detail and transparency to the withoutBG matting model, and hard opaque objects, flat scenes and vehicles to BiRefNet. Only the selected branch runs.

## Related images

| Image | Use case |
|-------|----------|
| `withoutbg/withoutbg-openweights-v3-app-cpu` | Same app, CPU only |
| `withoutbg/withoutbg-openweights-v3-service-cpu` | API only (CPU) |
| `withoutbg/withoutbg-openweights-v3-service-gpu` | API only (GPU) |

## Links

- [withoutBG open model](https://withoutbg.com/open-model)
- [Source on GitHub](https://github.com/withoutbg/withoutbg-inference)
- License: Apache-2.0 for the code; the model is under the [withoutBG Open Weights license](https://withoutbg.com/open-model/license) and includes DINOv3, Depth Anything V2 (Apache-2.0) and BiRefNet (MIT). See `/v1/licenses` in the running container

# withoutBG Open Weights v4 — Inference API (GPU)

Self-hosted [withoutBG](https://withoutbg.com?utm_source=dockerhub&utm_medium=readme&utm_campaign=open-weights-v4&utm_content=withoutbg-inference-home) open weights background removal API with GPU acceleration. Runs the v4 ONNX model via CUDA for faster inference.

**New in v4: Smart brush.** Paint what to keep and what to remove; a small stroke-edit network fixes the cutout. Send `keep_mask` / `remove_mask` (and the previous `matte`) to `/v1/remove-background`.

## Quick start

Requires an NVIDIA GPU and the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html).

```bash
docker run --rm --gpus all -p 8000:8000 withoutbg/withoutbg-openweights-v4-service-gpu:latest
```

Health check: `http://localhost:8000/health`

## Platforms

Published for **linux/amd64** only (NVIDIA CUDA on x86_64).

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

## Optional: withoutBG Pro

Set `-e WITHOUTBG_API_KEY=sk_your_key -e WITHOUTBG_PRO_PASSWORD=<long random password>` and `POST /v1/remove-background?engine=pro` uses withoutBG Pro. Pro uploads the image to api.withoutbg.com (1 credit each). The open weights stay the default and never send images anywhere. Pro calls are charged to your key, so each one must send the password (`X-Pro-Password`; the web UI asks once). Keep a Pro-enabled server private, e.g. `-p 127.0.0.1:8080:8080`. Keys: [withoutBG Pro](https://withoutbg.com/pro-model-api?utm_source=dockerhub&utm_medium=readme&utm_campaign=open-weights-v4&utm_content=withoutbg-inference-pro-model-api).

## Model

The withoutBG Open Weights 10.8.0 bundle (~1.5 GB, baked into the image): a trained router sends fine strands, soft detail and transparency to the withoutBG matting model, and hard opaque objects, flat scenes and vehicles to BiRefNet. Only the selected branch runs.

## Related images

| Image | Use case |
|-------|----------|
| `withoutbg/withoutbg-openweights-v4-service-cpu` | Same API, CPU only |
| `withoutbg/withoutbg-openweights-v4-app-cpu` | Web UI + API (CPU) |
| `withoutbg/withoutbg-openweights-v4-app-gpu` | Web UI + API (GPU) |

## Links

- [withoutBG open model](https://withoutbg.com/open-model?utm_source=dockerhub&utm_medium=readme&utm_campaign=open-weights-v4&utm_content=withoutbg-inference-open-model)
- [Source on GitHub](https://github.com/withoutbg/withoutbg-inference)
- License: Apache-2.0 for the code; the model is under the [withoutBG Open Weights license](https://withoutbg.com/open-model/license?utm_source=dockerhub&utm_medium=readme&utm_campaign=open-weights-v4&utm_content=withoutbg-inference-open-model-license) and includes DINOv3, Depth Anything V2 (Apache-2.0) and BiRefNet (MIT). See `/v1/licenses` in the running container

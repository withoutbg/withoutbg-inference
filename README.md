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

## License

Apache-2.0 for this repository's code. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for upstream model attribution.

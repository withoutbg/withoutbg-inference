variable "PRODUCT_VERSION" {
  default = "v3"
}

variable "PLATFORMS_CPU" {
  default = ["linux/amd64", "linux/arm64"]
}

variable "PLATFORMS_GPU" {
  default = ["linux/amd64"]
}

variable "HF_REPO" {
  default = "withoutbg/withoutbg-openweights-onnx"
}

variable "MODEL_FILE" {
  default = "withoutbg-open-weights.onnx"
}

variable "HF_REVISION" {
  # Pinned Hugging Face commit, so a new upload never changes a build silently.
  default = "93afc91c44e0e27706159ead1623918b49f31d15"
}

variable "MODEL_SHA256" {
  default = "a22bc936a7be65f500f44955129bdde09a16d1ab3745a43224128638981cff32"
}

variable "HF_TOKEN" {
  default = ""
}

group "default" {
  targets = ["service-cpu", "service-gpu", "app-cpu", "app-gpu"]
}

target "model-assets" {
  dockerfile = "docker/Dockerfile.model-assets"
  context = "."
  platforms = ["linux/amd64"]
  args = {
    HF_REPO = HF_REPO
    HF_REVISION = HF_REVISION
    MODEL_FILE = MODEL_FILE
    MODEL_SHA256 = MODEL_SHA256
    HF_TOKEN = HF_TOKEN
  }
  cache-from = ["type=gha,scope=model-assets-${PRODUCT_VERSION}"]
  cache-to   = ["type=gha,mode=max,scope=model-assets-${PRODUCT_VERSION}"]
}

target "base-cpu" {
  dockerfile = "docker/Dockerfile.base-cpu"
  context = "."
  # Required: otherwise bake inherits model-assets' amd64-only platform and
  # ships amd64 binaries under a linux/arm64 manifest.
  platforms = PLATFORMS_CPU
  tags = ["withoutbg-openweights-${PRODUCT_VERSION}-base-cpu"]
  contexts = {
    model-assets = "target:model-assets"
  }
  cache-from = ["type=gha,scope=base-cpu-${PRODUCT_VERSION}"]
  cache-to   = ["type=gha,mode=max,scope=base-cpu-${PRODUCT_VERSION}"]
  args = {
    PRODUCT_VERSION = PRODUCT_VERSION
    MODEL_FILE = MODEL_FILE
  }
}

target "base-gpu" {
  dockerfile = "docker/Dockerfile.base-gpu"
  context = "."
  platforms = PLATFORMS_GPU
  tags = ["withoutbg-openweights-${PRODUCT_VERSION}-base-gpu"]
  contexts = {
    model-assets = "target:model-assets"
  }
  cache-from = ["type=gha,scope=base-gpu-${PRODUCT_VERSION}"]
  cache-to   = ["type=gha,mode=max,scope=base-gpu-${PRODUCT_VERSION}"]
  args = {
    PRODUCT_VERSION = PRODUCT_VERSION
    MODEL_FILE = MODEL_FILE
  }
}

target "service-cpu" {
  dockerfile = "docker/Dockerfile.service-cpu"
  context = "."
  platforms = PLATFORMS_CPU
  contexts = {
    "withoutbg-openweights-${PRODUCT_VERSION}-base-cpu" = "target:base-cpu"
  }
  tags = ["withoutbg-openweights-${PRODUCT_VERSION}-service-cpu"]
  cache-from = ["type=gha,scope=service-cpu-${PRODUCT_VERSION}"]
  cache-to   = ["type=gha,mode=max,scope=service-cpu-${PRODUCT_VERSION}"]
  args = {
    PRODUCT_VERSION = PRODUCT_VERSION
  }
}

target "service-gpu" {
  dockerfile = "docker/Dockerfile.service-gpu"
  context = "."
  platforms = PLATFORMS_GPU
  contexts = {
    "withoutbg-openweights-${PRODUCT_VERSION}-base-gpu" = "target:base-gpu"
  }
  tags = ["withoutbg-openweights-${PRODUCT_VERSION}-service-gpu"]
  cache-from = ["type=gha,scope=service-gpu-${PRODUCT_VERSION}"]
  cache-to   = ["type=gha,mode=max,scope=service-gpu-${PRODUCT_VERSION}"]
  args = {
    PRODUCT_VERSION = PRODUCT_VERSION
  }
}

target "app-cpu" {
  dockerfile = "docker/Dockerfile.app-cpu"
  context = "."
  platforms = PLATFORMS_CPU
  contexts = {
    "withoutbg-openweights-${PRODUCT_VERSION}-base-cpu" = "target:base-cpu"
  }
  tags = ["withoutbg-openweights-${PRODUCT_VERSION}-app-cpu"]
  cache-from = ["type=gha,scope=app-cpu-${PRODUCT_VERSION}"]
  cache-to   = ["type=gha,mode=max,scope=app-cpu-${PRODUCT_VERSION}"]
  args = {
    PRODUCT_VERSION = PRODUCT_VERSION
  }
}

target "app-gpu" {
  dockerfile = "docker/Dockerfile.app-gpu"
  context = "."
  platforms = PLATFORMS_GPU
  contexts = {
    "withoutbg-openweights-${PRODUCT_VERSION}-base-gpu" = "target:base-gpu"
  }
  tags = ["withoutbg-openweights-${PRODUCT_VERSION}-app-gpu"]
  cache-from = ["type=gha,scope=app-gpu-${PRODUCT_VERSION}"]
  cache-to   = ["type=gha,mode=max,scope=app-gpu-${PRODUCT_VERSION}"]
  args = {
    PRODUCT_VERSION = PRODUCT_VERSION
  }
}

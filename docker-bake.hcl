variable "PRODUCT_VERSION" {
  default = "v3"
}

group "default" {
  targets = ["service-cpu", "service-gpu", "app-cpu", "app-gpu"]
}

target "base-cpu" {
  dockerfile = "docker/Dockerfile.base-cpu"
  context = "."
  tags = ["withoutbg-openweights-${PRODUCT_VERSION}-base-cpu"]
  cache-from = ["type=gha,scope=base-cpu-${PRODUCT_VERSION}"]
  cache-to   = ["type=gha,mode=max,scope=base-cpu-${PRODUCT_VERSION}"]
  args = {
    PRODUCT_VERSION = PRODUCT_VERSION
  }
}

target "base-gpu" {
  dockerfile = "docker/Dockerfile.base-gpu"
  context = "."
  tags = ["withoutbg-openweights-${PRODUCT_VERSION}-base-gpu"]
  cache-from = ["type=gha,scope=base-gpu-${PRODUCT_VERSION}"]
  cache-to   = ["type=gha,mode=max,scope=base-gpu-${PRODUCT_VERSION}"]
  args = {
    PRODUCT_VERSION = PRODUCT_VERSION
  }
}

target "service-cpu" {
  dockerfile = "docker/Dockerfile.service-cpu"
  context = "."
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

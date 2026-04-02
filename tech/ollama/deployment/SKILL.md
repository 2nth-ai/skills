---
name: tech/ollama/deployment
description: |
  Ollama deployment skill. Use when:
  (1) running Ollama in Docker — containerised inference with GPU passthrough,
  (2) running as a Linux systemd service — persistent background server,
  (3) deploying on Kubernetes — GPU node scheduling, resource limits,
  (4) exposing Ollama to a network — remote access, reverse proxy, auth header,
  (5) running on Apple Silicon — Metal GPU, performance tuning,
  (6) integrating with Open WebUI — ChatGPT-style UI for local models.
license: MIT
compatibility: Ollama v0.5+, Docker, Kubernetes, systemd
improves:
  - tech/ollama
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
  categories: "Ollama, Docker, Kubernetes, systemd, deployment, GPU, CUDA, Apple Silicon, Open WebUI, reverse proxy"
---

# Ollama — Deployment

> **Stub** — core patterns below.

## Linux Service (systemd)

Ollama installs as a systemd service automatically via the install script:

```bash
curl -fsSL https://ollama.com/install.sh | sh

# Check status
systemctl status ollama

# View logs
journalctl -u ollama -f

# Restart
systemctl restart ollama

# Configure via override file
sudo systemctl edit ollama
```

`/etc/systemd/system/ollama.service.d/override.conf`:
```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_KEEP_ALIVE=24h"
Environment="OLLAMA_MAX_LOADED_MODELS=2"
Environment="OLLAMA_FLASH_ATTENTION=1"
```

```bash
sudo systemctl daemon-reload && sudo systemctl restart ollama
```

## Docker (CPU)

```bash
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama

# Pull a model into the container
docker exec ollama ollama pull llama3.2

# Run a prompt
docker exec ollama ollama run llama3.2 "Hello"
```

## Docker (NVIDIA GPU)

```bash
# Requires: nvidia-container-toolkit installed on host
docker run -d \
  --name ollama \
  --gpus all \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  -e OLLAMA_FLASH_ATTENTION=1 \
  ollama/ollama
```

## Docker (AMD GPU / ROCm)

```bash
docker run -d \
  --name ollama \
  --device /dev/kfd \
  --device /dev/dri \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama:rocm
```

## Docker Compose

```yaml
services:
  ollama:
    image: ollama/ollama
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
      - OLLAMA_KEEP_ALIVE=24h
      - OLLAMA_FLASH_ATTENTION=1
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    volumes:
      - open_webui_data:/app/backend/data
    depends_on:
      - ollama
    restart: unless-stopped

volumes:
  ollama_data:
  open_webui_data:
```

## Kubernetes (GPU Node)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
  namespace: ai
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      nodeSelector:
        cloud.google.com/gke-accelerator: nvidia-l4
      containers:
        - name: ollama
          image: ollama/ollama
          ports:
            - containerPort: 11434
          env:
            - name: OLLAMA_HOST
              value: "0.0.0.0:11434"
            - name: OLLAMA_KEEP_ALIVE
              value: "24h"
          resources:
            requests:
              memory: "8Gi"
              nvidia.com/gpu: "1"
            limits:
              memory: "16Gi"
              nvidia.com/gpu: "1"
          volumeMounts:
            - name: ollama-data
              mountPath: /root/.ollama
      volumes:
        - name: ollama-data
          persistentVolumeClaim:
            claimName: ollama-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: ollama
  namespace: ai
spec:
  selector:
    app: ollama
  ports:
    - port: 11434
      targetPort: 11434
```

## Nginx Reverse Proxy with Basic Auth

```nginx
server {
    listen 443 ssl;
    server_name ollama.internal.example.com;

    ssl_certificate /etc/ssl/certs/ollama.crt;
    ssl_certificate_key /etc/ssl/private/ollama.key;

    auth_basic "Ollama";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://127.0.0.1:11434;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;  # Long timeout for streaming
        proxy_buffering off;        # Required for streaming responses
    }
}
```

## Apple Silicon (macOS)

```bash
# Install — uses Metal GPU automatically
brew install ollama
# or
curl -fsSL https://ollama.com/install.sh | sh

# Start as a background service
brew services start ollama
# or
ollama serve &

# Performance tips
export OLLAMA_FLASH_ATTENTION=1    # Faster attention on M-series
export OLLAMA_MAX_LOADED_MODELS=2  # Load multiple models if RAM allows

# M1/M2/M3 VRAM is unified — 16GB Mac can run 13B models comfortably
ollama pull llama3.1:8b    # Runs well on 8GB Mac
ollama pull llama3.1:70b   # Needs 64GB Mac
```

## Open WebUI

Provides a ChatGPT-style interface in the browser, connected to your local Ollama instance:

```bash
# Docker — quickest setup
docker run -d \
  --name open-webui \
  -p 3000:8080 \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  -v open_webui_data:/app/backend/data \
  ghcr.io/open-webui/open-webui:main

# Open in browser
open http://localhost:3000
```

Features: model selection, system prompt UI, RAG file upload, conversation history, user management, API keys.

## Security Considerations

- Ollama binds to `127.0.0.1` by default — safe for local use
- To expose remotely, always put it behind a reverse proxy with auth
- There is no built-in API key auth — add it at the proxy layer
- Model files contain weights only — no training data or user conversations
- Logs go to systemd journal or stdout — no sensitive data logged by default

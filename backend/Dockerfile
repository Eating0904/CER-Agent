FROM python:3.11-slim AS builder

WORKDIR /app

# Install build-time system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        gcc \
        libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install uv
ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"

# Use uv to install the dependencies
COPY uv.lock* pyproject.toml* ./
RUN uv venv --python $(uv python find) .venv && \
    . .venv/bin/activate && \
    uv sync --frozen --no-cache --no-dev
COPY . .


# ---- Final Stage ----
FROM python:3.11-slim AS final

WORKDIR /app

# Install runtime system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        libpq5 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app .

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=UTF-8

RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

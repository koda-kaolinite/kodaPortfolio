FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y build-essential curl git python3 libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 22.18.0
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && \
    . $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default && \
    corepack enable

ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin:${PATH}"

WORKDIR /app

RUN node -v
RUN pnpm -v

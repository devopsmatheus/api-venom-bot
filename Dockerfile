FROM node:20-bullseye

# Instalar Chromium + dependências necessárias
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Definir caminho do Chromium (binário oficial do Debian)
ENV CHROMIUM_PATH=/usr/bin/chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Diretório da aplicação
WORKDIR /app

# Instalar dependências do Node
COPY package*.json ./
RUN npm install

# Copiar o restante do projeto
COPY . .

# Rodar aplicação
CMD ["node", "index.js"]

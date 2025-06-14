FROM node:20 AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

# Set npm config for better reliability
RUN npm config set fetch-retry-mintimeout 30000 \
    && npm config set fetch-retry-maxtimeout 180000 \
    && npm config set fetch-retries 10 \
    && npm config set registry https://registry.npmjs.org/

# Install global dependencies
RUN npm install -g rimraf @nestjs/cli

# Install with retry logic including dev dependencies
RUN for i in {1..3}; do \
      npm install --legacy-peer-deps --include=dev && break || \
      (echo "Attempt $i failed, retrying..." && \
       sleep 10 && \
       npm cache clean --force); \
    done

COPY . .

RUN npm run build

FROM node:20

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 4004
#      - product-service: 4001
#      - customer-adapter-service: 4006
#      - order-service: 4002
#      - cart-service: 4005
#      - payment-service: 4003
#      - shipment-service: 4004

CMD ["npm", "run", "start:prod"]
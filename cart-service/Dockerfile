FROM node:20 AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm config set registry https://registry.npmmirror.com && npm set fetch-timeout 60000 && npm set fetch-retries 5 && npm install --legacy-peer-deps --force

COPY . .

RUN npm run build

FROM node:20-alpine

# Install curl for health checks
RUN apk --no-cache add curl

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 4003
# Ports:
# - product-service: 4001
# - customer-adapter-service: 4006
# - order-service: 4002
# - cart-service: 4003
# - payment-service: 4003
# - shipment-service: 4004

CMD ["npm", "run", "start:prod"]

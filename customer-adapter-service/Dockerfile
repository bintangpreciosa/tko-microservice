FROM node:20 AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:20

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 4006
#      - product-service: 4001
#      - customer-adapter-service: 4006
#      - order-service: 4002
#      - cart-service: 4005
#      - payment-service: 4003
#      - shipment-service: 4004

CMD ["npm", "run", "start:prod"]


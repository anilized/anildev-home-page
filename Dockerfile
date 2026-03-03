FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build with /links base path by default so assets resolve under anildev.io/links
ARG APP_BASE_PATH=/links/
ARG VITE_GA_MEASUREMENT_ID=
ENV VITE_GA_MEASUREMENT_ID=${VITE_GA_MEASUREMENT_ID}
RUN npx tsc && npx vite build --base=${APP_BASE_PATH}

FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/links

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]

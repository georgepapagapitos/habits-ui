FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create .env file for production if it doesn't exist
RUN if [ ! -f .env ]; then \
    echo "VITE_API_URL=/api" > .env && \
    echo "VITE_BACKEND_URL=http://backend:5050" >> .env; \
    fi

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add debugging tools
RUN apk add --no-cache curl iputils

EXPOSE 80

# Create a startup script
COPY --from=build /app/.env /usr/share/nginx/html/.env
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'echo "Container environment: $(date)"' >> /docker-entrypoint.sh && \
    echo 'echo "Backend URL: $BACKEND_URL"' >> /docker-entrypoint.sh && \
    echo 'if [ -n "$BACKEND_URL" ]; then' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|http://backend:5050|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --no-frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Enable corepack for pnpm access in the builder stage
RUN if [ -f pnpm-lock.yaml ]; then corepack enable pnpm; fi

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app and socket server
RUN \
  if [ -f yarn.lock ]; then yarn build:next && yarn build:socket; \
  elif [ -f package-lock.json ]; then npm run build:next  && npm run build:socket; \
  elif [ -f pnpm-lock.yaml ]; then pnpm run build:next  && pnpm run build:socket; \
  else echo "Lockfile not found." && exit 1; \
  fi

  # RUN \
  # if [ -f yarn.lock ]; then yarn build:next && yarn obf && yarn build:socket; \
  # elif [ -f package-lock.json ]; then npm run build:next && npm run obf && npm run build:socket; \
  # elif [ -f pnpm-lock.yaml ]; then pnpm run build:next && pnpm run obf && pnpm run build:socket; \
  # else echo "Lockfile not found." && exit 1; \
  # fi


# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install production dependencies only
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile --production; \
  elif [ -f package-lock.json ]; then npm ci --omit=dev; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --no-frozen-lockfile --prod; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next

# Copy built artifacts from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/dist_socket ./dist_socket
# COPY --from=builder --chown=nextjs:nodejs /app/css-obfuscator ./css-obfuscator
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Generate Prisma client in the runner stage
RUN npx prisma generate

# Create the entrypoint script file
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000
EXPOSE 3001

# Use entrypoint script to run migrations before starting the app
ENTRYPOINT ["/app/docker-entrypoint.sh"]
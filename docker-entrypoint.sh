#!/bin/sh
set -e

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start Next.js server and Socket server in parallel
echo "Starting servers..."
node server.js & 
node dist_socket/server.mjs
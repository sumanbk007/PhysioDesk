#!/bin/sh
set -e

echo "==> Waiting for database..."
python - << 'PYEOF'
import os, sys, time
import psycopg2

url = os.environ.get("DATABASE_URL", "")
# Strip SQLAlchemy scheme prefix for psycopg2
dsn = url.replace("postgresql+psycopg2://", "postgresql://")

for attempt in range(1, 31):
    try:
        conn = psycopg2.connect(dsn)
        conn.close()
        print(f"   DB is ready (attempt {attempt}).")
        sys.exit(0)
    except Exception as e:
        print(f"   [{attempt}/30] not ready: {e}")
        time.sleep(1)

print("ERROR: database did not become ready in 30s")
sys.exit(1)
PYEOF

echo "==> Running migrations..."
alembic upgrade head

if [ "${SEED_ON_BOOT}" = "true" ]; then
  echo "==> Seeding demo data..."
  python -m scripts.seed
fi

echo "==> Starting server..."
exec "$@"

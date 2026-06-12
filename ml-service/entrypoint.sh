#!/bin/bash

# Execute background event worker
python -m src.workers.kafka_worker &

# Execute foreground web server
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000

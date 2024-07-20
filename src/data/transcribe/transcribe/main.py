"""Wip"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .health import router as health_router
from .api import router as api_router
from .conf import settings

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Health checks
app.include_router(health_router)
app.include_router(api_router, prefix='/api/v1')

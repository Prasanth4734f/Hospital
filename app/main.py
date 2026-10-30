import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text

from app.core.config import settings
from app.database.session import SessionLocal
from app.utils.responses import api_success, api_error

from app.routers import (
    auth,
    users,
    patients,
    doctors,
    appointments,
    medical_records,
    prescriptions,
    pharmacy,
    billing,
    notifications,
    dashboard,
    reports,
    settings as settings_router
)

app = FastAPI(
    title="MediCore – Intelligent Hospital Management Ecosystem",
    description="Standardized REST API Backend for MediCore Hospital Management Ecosystem",
    version=settings.PROJECT_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Exact frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Exception Handlers complying with Standard API Response format
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=api_error(message=str(exc.detail), data=None)
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    # Format first error into clear message
    first_msg = errors[0].get("msg", "Validation error") if errors else "Invalid request data"
    field = ".".join(str(x) for x in errors[0].get("loc", [])) if errors else ""
    msg = f"Validation error at '{field}': {first_msg}" if field else first_msg

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=api_error(message=msg, data=errors)
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # Log exception internally but return clean error contract without stack trace
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=api_error(message="An internal server error occurred. Please contact system support.", data=None)
    )

# Root and Health check endpoints
@app.get("/", tags=["Health"])
def root():
    return api_success(
        "MediCore Backend Running",
        {
            "service": "MediCore API",
            "version": settings.PROJECT_VERSION
        }
    )

@app.get("/health", tags=["Health"])
def health_check():
    db_status = "healthy"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1;"))
        db.close()
    except Exception:
        db_status = "unhealthy"

    return api_success(
        "MediCore health check",
        {
            "status": "UP" if db_status == "healthy" else "DEGRADED",
            "database": db_status,
            "version": settings.PROJECT_VERSION
        }
    )

# Standardized /api/v1 prefix router inclusions
API_V1_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_V1_PREFIX)
app.include_router(users.router, prefix=API_V1_PREFIX)
app.include_router(patients.router, prefix=API_V1_PREFIX)
app.include_router(doctors.router, prefix=API_V1_PREFIX)
app.include_router(appointments.router, prefix=API_V1_PREFIX)
app.include_router(medical_records.router, prefix=API_V1_PREFIX)
app.include_router(prescriptions.router, prefix=API_V1_PREFIX)
app.include_router(pharmacy.router, prefix=API_V1_PREFIX)
app.include_router(billing.router, prefix=API_V1_PREFIX)
app.include_router(notifications.router, prefix=API_V1_PREFIX)
app.include_router(dashboard.router, prefix=API_V1_PREFIX)
app.include_router(reports.router, prefix=API_V1_PREFIX)
app.include_router(settings_router.router, prefix=API_V1_PREFIX)

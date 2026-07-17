"""
JWT verification for Clerk-issued tokens.

The frontend sends the Clerk session token in the Authorization header.
This module validates it using Clerk's JWKS endpoint.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import httpx

from app.core.config import settings

_bearer = HTTPBearer(auto_error=False)


async def _get_clerk_jwks() -> dict:
    """Fetch Clerk's public JWKS for token verification."""
    jwks_url = f"{settings.clerk_jwt_issuer}/.well-known/jwks.json"
    async with httpx.AsyncClient() as client:
        response = await client.get(jwks_url)
        response.raise_for_status()
        return response.json()


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    """
    Dependency that validates a Clerk JWT and returns the decoded payload.
    In development mode (no issuer configured) it skips verification.
    """
    if not settings.clerk_jwt_issuer:
        # Development: skip auth when Clerk is not configured
        return {"sub": "dev-user"}

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token.",
        )

    try:
        jwks = await _get_clerk_jwks()
        payload = jwt.decode(
            credentials.credentials,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        )

"""Authentication endpoints: login (JSON + form) and current-user."""

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserMe
from app.services.auth_service import authenticate, issue_token

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in with JSON body and receive a JWT access token",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = authenticate(db, payload.username, payload.password)
    token, expires_in = issue_token(user)
    return TokenResponse(access_token=token, expires_in=expires_in)


@router.post(
    "/token",
    response_model=TokenResponse,
    summary="OAuth2 password grant (form-encoded). Used by Swagger's Authorize button.",
)
def login_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = authenticate(db, form_data.username, form_data.password)
    token, expires_in = issue_token(user)
    return TokenResponse(access_token=token, expires_in=expires_in)


@router.get(
    "/me",
    response_model=UserMe,
    summary="Get the currently authenticated user",
)
def me(current_user: User = Depends(get_current_user)) -> UserMe:
    return UserMe.model_validate(current_user)

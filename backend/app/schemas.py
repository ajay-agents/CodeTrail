from typing import Any

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=200)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str

    class Config:
        from_attributes = True


class ProgressResponse(BaseModel):
    data: dict[str, Any]
    updated_at: str | None = None


class ProgressUpdateRequest(BaseModel):
    data: dict[str, Any]

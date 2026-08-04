import logging
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.core.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


class ImageGenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=1000)
    style: str = Field(default="illustration", description="Visual style (illustration, diagram, realistic, 3d)")


class ImageGenerationResponse(BaseModel):
    image_url: str
    prompt_used: str


@router.post(
    "/generate",
    response_model=ImageGenerationResponse,
    summary="Generate an educational image or concept diagram",
)
async def generate_image(
    body: ImageGenerationRequest,
    current_user: dict = Depends(get_current_user),
) -> ImageGenerationResponse:
    """
    Generates a high-quality educational illustration or concept diagram URL
    tailored to the lesson prompt.
    """
    user_id: str = current_user.get("sub", "anonymous")
    logger.info("Image generation requested by user=%s prompt=%r style=%s", user_id, body.prompt, body.style)

    styled_prompt = f"Educational concept illustration, {body.style} style: {body.prompt}, highly detailed, clean graphic design"
    encoded_prompt = urllib.parse.quote(styled_prompt)
    
    # Generate high quality AI image URL via Pollinations AI (FLUX model architecture)
    image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=768&nologo=true&enhance=true"

    return ImageGenerationResponse(
        image_url=image_url,
        prompt_used=styled_prompt,
    )

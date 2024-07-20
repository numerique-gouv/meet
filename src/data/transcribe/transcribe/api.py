
from fastapi import APIRouter, Response, File, UploadFile

import logging
import shutil
import os

import torch
from transformers import pipeline
from transformers.utils import is_flash_attn_2_available


logger = logging.getLogger(__name__)

"""
Few operator are not currently implemented for the MPS device.
As a temporary fix, you can set the environment variable `PYTORCH_ENABLE_MPS_FALLBACK=1` to use the CPU
as a fallback for missing op.
WARNING: this will be slower than running natively on MPS.

If you are on mac devices, uncomment the next line
"""
# os.environ['PYTORCH_ENABLE_MPS_FALLBACK']

router = APIRouter()

pipe = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-large-v3", # select checkpoint from https://huggingface.co/openai/whisper-large-v3#model-details
    torch_dtype=torch.float16,
    device="cuda:0", # or mps for Mac devices
    model_kwargs={"attn_implementation": "flash_attention_2"} if is_flash_attn_2_available() else {"attn_implementation": "sdpa"},
)


@router.post("/transcribe/")
async def transcribe(file: UploadFile) -> None:
    """Wip."""

    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    outputs = pipe(
        temp_file_path,
        chunk_length_s=30,
        batch_size=24,
        return_timestamps=True,
    )

    os.remove(temp_file_path)

    return outputs

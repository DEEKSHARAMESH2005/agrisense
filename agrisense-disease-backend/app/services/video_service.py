import os
import tempfile
from typing import List
import cv2
from PIL import Image
from app.config import settings
from app.services.image_service import ImageValidationError

ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".3gp", ".m4v"}


class VideoService:
    """Service responsible for validating uploaded videos and sampling RGB leaf frames."""

    @staticmethod
    def extract_frames(
        file_bytes: bytes,
        filename: str = "",
        max_frames: int = 6,
    ) -> List[Image.Image]:
        """
        Validate uploaded video bytes and extract up to `max_frames` evenly spaced RGB PIL frames.
        """
        if not file_bytes:
            raise ImageValidationError("The uploaded video file is empty (0 bytes).", status_code=400)

        file_size_bytes = len(file_bytes)
        if file_size_bytes > settings.max_video_upload_size_bytes:
            size_mb = file_size_bytes / (1024 * 1024)
            raise ImageValidationError(
                f"Video size ({size_mb:.2f} MB) exceeds maximum allowed limit of {settings.MAX_VIDEO_UPLOAD_SIZE_MB} MB.",
                status_code=413,
            )

        ext = os.path.splitext(filename or "")[1].lower()
        if ext and ext not in ALLOWED_VIDEO_EXTENSIONS:
            raise ImageValidationError(
                f"Unsupported video format '{ext}'. Allowed formats are MP4, MOV, AVI, MKV, WEBM, 3GP, and M4V.",
                status_code=415,
            )

        suffix = ext if ext else ".mp4"
        temp_path = None
        cap = None

        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(file_bytes)
                temp_path = tmp.name

            cap = cv2.VideoCapture(temp_path)
            if not cap.isOpened():
                raise ImageValidationError(
                    "The uploaded video file is corrupted or in an unsupported codec.",
                    status_code=400,
                )

            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
            frames: List[Image.Image] = []

            if total_frames > 0:
                sample_count = min(max_frames, total_frames)
                if sample_count == 1:
                    indices = [0]
                else:
                    indices = sorted(
                        {
                            int(round(i * (total_frames - 1) / (sample_count - 1)))
                            for i in range(sample_count)
                        }
                    )

                for idx in indices:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                    ok, frame = cap.read()
                    if ok and frame is not None and frame.size > 0:
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        frames.append(Image.fromarray(rgb))
            else:
                # Fallback sequential sampling when container lacks frame count metadata
                read_idx = 0
                while len(frames) < max_frames and read_idx < 180:
                    ok, frame = cap.read()
                    if not ok or frame is None:
                        break
                    if read_idx % 10 == 0 and frame.size > 0:
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        frames.append(Image.fromarray(rgb))
                    read_idx += 1

            if not frames:
                raise ImageValidationError(
                    "Could not extract any readable frames from the uploaded video.",
                    status_code=400,
                )

            return frames

        except ImageValidationError:
            raise
        except Exception as exc:
            raise ImageValidationError(
                f"The uploaded video file could not be processed. {exc}".strip(),
                status_code=400,
            )
        finally:
            if cap is not None:
                cap.release()
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except OSError:
                    pass


video_service = VideoService()

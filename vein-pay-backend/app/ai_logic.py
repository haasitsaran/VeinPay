from __future__ import annotations

import base64
from typing import List

import numpy as np

try:
    import cv2  # type: ignore
except ImportError:  # pragma: no cover - optional dependency for now
    cv2 = None

try:
    import tensorflow as tf
    from tensorflow.keras import layers, models
except ImportError:  # pragma: no cover
    tf = None
    layers = None
    models = None


def decode_base64_image(image_base64: str) -> bytes:
    # Accept both pure base64 and data URLs like: "data:image/jpeg;base64,...."
    if "," in image_base64 and image_base64.strip().lower().startswith("data:"):
        image_base64 = image_base64.split(",", 1)[1]
    return base64.b64decode(image_base64)


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    OpenCV preprocessing:
    - Decode bytes to grayscale image
    - Noise reduction (Gaussian blur)
    - Contrast enhancement (CLAHE) to make veins more visible
    - ROI extraction: crop a centered rectangle from the palm region
    - Resize + normalize to (128, 128, 1) float32
    """
    if cv2 is None:
        # Return a dummy grayscale image
        return np.random.rand(128, 128, 1).astype("float32")

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        # fallback dummy
        img = np.random.randint(0, 255, (128, 128), dtype=np.uint8)

    # Noise reduction
    img = cv2.GaussianBlur(img, (5, 5), 0)

    # Contrast enhancement (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = clahe.apply(img)

    # ROI extraction: centered rectangle (e.g., 60% width x 60% height)
    h, w = img.shape
    roi_h = int(h * 0.6)
    roi_w = int(w * 0.6)
    start_h = max((h - roi_h) // 2, 0)
    start_w = max((w - roi_w) // 2, 0)
    roi = img[start_h : start_h + roi_h, start_w : start_w + roi_w]
    roi = cv2.resize(roi, (128, 128))
    roi = roi.astype("float32") / 255.0
    roi = np.expand_dims(roi, axis=-1)
    return roi


_feature_model = None


def _build_feature_model():
    if tf is None or layers is None or models is None:
        return None
    # 2-layer CNN with 3x3 kernels + GlobalAveragePooling2D -> 128-d embedding
    model = models.Sequential(
        [
            layers.Input(shape=(128, 128, 1)),
            layers.Conv2D(32, (3, 3), padding="same", activation="relu"),
            layers.MaxPool2D((2, 2)),
            layers.Conv2D(64, (3, 3), padding="same", activation="relu"),
            layers.GlobalAveragePooling2D(),
            layers.Dense(128, activation=None, name="embedding"),
        ]
    )
    return model


def extract_feature_vector(preprocessed_image: np.ndarray) -> List[float]:
    """
    Run a lightweight 2-layer CNN to get a 128-d feature vector (embedding).
    """
    global _feature_model
    if _feature_model is None:
        _feature_model = _build_feature_model()

    if _feature_model is None:
        # TensorFlow not available: fall back to deterministic random vector
        rng = np.random.default_rng(42)
        return rng.random(128).astype("float32").tolist()

    batch = np.expand_dims(preprocessed_image, axis=0)
    features = _feature_model.predict(batch, verbose=0)[0]
    return features.astype("float32").tolist()


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    a = a.astype("float32").reshape(-1)
    b = b.astype("float32").reshape(-1)
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-8
    return float(np.dot(a, b) / denom)


def embedding_from_base64(image_b64: str) -> np.ndarray:
    image_bytes = decode_base64_image(image_b64)
    pre = preprocess_image(image_bytes)
    vec = extract_feature_vector(pre)
    return np.asarray(vec, dtype="float32")


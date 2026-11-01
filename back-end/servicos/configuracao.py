import os


class Config:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
    NOMINATIM_USER_AGENT = os.getenv(
        "NOMINATIM_USER_AGENT",
        "UrbanMobSP/1.0 (mobile urban mobility project)",
    )
    GEOCODING_TIMEOUT_SECONDS = 5

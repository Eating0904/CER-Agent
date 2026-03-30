import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=env_path)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 5434)),
    "dbname": os.getenv("DB_NAME", "cer_agent"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
}

DOCKER_CONTAINER_NAME = os.getenv("DOCKER_CONTAINER_NAME", "cer-dump-db")

CLASS_I_IDS = list(range(9, 27)) + list(range(28, 49)) + [91]  # 9~26、28~48、91
CLASS_P_IDS = list(range(49, 64)) + list(range(65, 91)) + [94]  # 49~63、65~90、94


def get_user_class(user_id: int) -> str:
    if user_id in CLASS_I_IDS:
        return "class_I"
    elif user_id in CLASS_P_IDS:
        return "class_P"
    else:
        return "unknown"

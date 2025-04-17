from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    """
    Application settings loaded from environment variables.
    """
    def __init__(self):
        # db settings
        self.DB_TYPE = self._get("DB_TYPE")
        self.DB_USER = self._get("DB_USER")
        self.DB_PASSWORD = self._get("DB_PASSWORD")
        self.DB_HOST = self._get("DB_HOST")
        self.DB_PORT = self._get("DB_PORT")
        self.DB_DATABASE = self._get("DB_DATABASE")

        # jwt settings
        self.SECRET_KEY = self._get("SECRET_KEY")
        self.ALGORITHM = self._get("ALGORITHM", default="HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(self._get("ACCESS_TOKEN_EXPIRE_MINUTES", default="15"))
        self.REFRESH_TOKEN_EXPIRE_DAYS = int(self._get("REFRESH_TOKEN_EXPIRE_DAYS", default="7"))
        # cookie settings
        # self.COOKIE_SECURE = os.getenv("COOKIE_SECURE", "False").lower() == "true"

    @staticmethod
    def _get(key: str, default: str | None = None) -> str:
        """
        Get an environment variable or return a default value.
        :param key:
        :param default:
        :return:
        """
        value = os.getenv(key, default)
        if value is None:
            raise ValueError(f"Missing required environment variable: {key}")
        return value

    def db_url(self):
        return f"{self.DB_TYPE}://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_DATABASE}"

settings = Settings()
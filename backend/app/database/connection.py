import os
from sqlalchemy import create_engine

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://samsara:change_me@localhost:5432/samsara")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

from pathlib import Path
from sqlalchemy import text
from .connection import engine


def init_db():
    schema = Path(__file__).resolve().parents[3] / "database" / "schema.sql"
    sql = schema.read_text(encoding="utf-8")
    statements = [s.strip() for s in sql.split(";") if s.strip()]
    with engine.begin() as conn:
        for statement in statements:
            conn.execute(text(statement))


if __name__ == "__main__":
    init_db()

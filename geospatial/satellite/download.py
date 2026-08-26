from pathlib import Path
from urllib.request import urlretrieve


def download(url: str, destination: str | Path) -> Path:
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    urlretrieve(url, destination)
    return destination

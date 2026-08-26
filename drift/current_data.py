import xarray as xr


def open_current_field(path: str) -> xr.Dataset:
    return xr.open_dataset(path)

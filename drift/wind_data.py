import xarray as xr


def open_wind_field(path: str) -> xr.Dataset:
    return xr.open_dataset(path)

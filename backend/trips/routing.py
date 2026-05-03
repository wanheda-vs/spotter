"""
routing.py — Geocode locations and fetch road distances + polyline.

APIs used (both free, no credit card):
  - Nominatim (OpenStreetMap) for geocoding
  - OSRM public API for routing
"""

import math
import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OSRM_URL = "http://router.project-osrm.org/route/v1/driving"
USER_AGENT = "SpotterHOSApp/1.0"


def geocode(place: str) -> tuple[float, float]:
    """
    Return (lat, lng) for a human-readable place name.
    """
    resp = requests.get(NOMINATIM_URL,
                        params={"q":place,"format":"json"},
                        headers={"User-Agent":USER_AGENT},
                        timeout=10)
    resp.raise_for_status()
    result = resp.json()
    if not result:
        raise ValueError(f"Location not found '{place}'")
    return float(result[0]["lat"]),float(result[0]["lon"])


def get_osrm_route(p1: tuple, p2: tuple) -> dict:
    """
    Return {"miles": float, "coords": [[lat, lng], ...]} for a driving route.
    """
    # OSRM expects lng,lat order (opposite of Leaflet)
    coords = f"{p1[1]},{p1[0]};{p2[1]},{p2[0]}"
    resp = requests.get(
        f"{OSRM_URL}/{coords}",
        params={"overview":"full","geometries":"geojson"},
        timeout=15
    )
    resp.raise_for_status()
    data = resp.json()
    route = data["routes"][0]
    miles = route["distance"] * 0.000621371 # meters → miles
    coords = [[c[1],c[0]] for c in route["geometry"]["coordinates"]]

    return {"miles":miles,"coords":coords}



def get_route_data(current_location: str, pickup_location: str, dropoff_location: str) -> dict:
    """
    Geocode all three stops, fetch two legs, and return a single dict:
    {
      "leg1_miles": float,        current → pickup
      "leg2_miles": float,        pickup  → dropoff
      "coords": [[lat,lng], ...], full polyline (leg1 + leg2 joined)
      "locations": {
          "current": {"lat": ..., "lng": ..., "label": ...},
          "pickup":  {"lat": ..., "lng": ..., "label": ...},
          "dropoff": {"lat": ..., "lng": ..., "label": ...},
      }
    }
  """
    p_current = geocode(current_location)
    p_pickup = geocode(pickup_location)
    p_dropoff = geocode(dropoff_location)

    leg1 = get_osrm_route(p_current,p_pickup)
    leg2 = get_osrm_route(p_pickup,p_dropoff)


    full_coords = leg1["coords"]+leg2["coords"][1:] # skip duplicate pickup point

    return {
        "leg1_miles": leg1["miles"],
        "leg2_miles": leg2["miles"],
        "coords": full_coords,
        "locations": {
            "current": {"lat": p_current[0], "lng": p_current[1], "label": current_location},
            "pickup":  {"lat": p_pickup[0], "lng": p_pickup[1], "label": pickup_location},
            "dropoff": {"lat": p_dropoff[0], "lng": p_dropoff[1], "label": dropoff_location},
          }
    }


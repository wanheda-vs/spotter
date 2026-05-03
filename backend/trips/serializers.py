from rest_framework import serializers


class TripInputSerializer(serializers.Serializer):
    current_location = serializers.CharField()
    pickup_location = serializers.CharField()
    dropoff_location = serializers.CharField()
    current_cycle_used = serializers.FloatField(min_value=0, max_value=70)


# --- Output shapes (read-only, used for documentation / optional validation) ---

class StopSerializer(serializers.Serializer):
    """One stop event on the trip (pickup, dropoff, rest, fuel, 30-min break)."""
    type = serializers.CharField()           # "pickup" | "dropoff" | "rest" | "fuel" | "break"
    location = serializers.CharField()
    arrival_time = serializers.CharField()   # e.g. "Day 1 14:30"
    departure_time = serializers.CharField()
    duration_hours = serializers.FloatField()
    lat = serializers.FloatField()
    lng = serializers.FloatField()


class LogEntrySerializer(serializers.Serializer):
    """One duty-status block on a daily log sheet."""
    # TODO: status maps to a row on the ELD grid
    #   "off_duty"  → row 0
    #   "sleeper"   → row 1
    #   "driving"   → row 2
    #   "on_duty"   → row 3 (on duty, not driving)
    status = serializers.CharField()
    start_time = serializers.FloatField()    # hours from midnight, e.g. 6.5 = 06:30
    end_time = serializers.FloatField()


class DailyLogSerializer(serializers.Serializer):
    """One full day's worth of log entries."""
    date = serializers.CharField()           # "Day 1", "Day 2", etc.
    entries = LogEntrySerializer(many=True)
    total_miles = serializers.FloatField()
    remarks = serializers.ListField(child=serializers.CharField())


class TripResultSerializer(serializers.Serializer):
    stops = StopSerializer(many=True)
    daily_logs = DailyLogSerializer(many=True)
    total_distance_miles = serializers.FloatField()
    total_duration_hours = serializers.FloatField()
    route_coords = serializers.ListField(          # polyline for map [[lat,lng],...]
        child=serializers.ListField(child=serializers.FloatField())
    )

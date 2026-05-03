from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TripInputSerializer
from .hos_calculator import calculate_trip
from .routing import get_route_data


class PlanTripView(APIView):
    def post(self, request):
        serilizer = TripInputSerializer(data=request.data)
        if not serilizer.is_valid():
            return Response(serilizer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serilizer.validated_data

        try:
            route_data= get_route_data(
                data["current_location"],
                data["pickup_location"],
                data["dropoff_location"]
            )
            result = calculate_trip(data["current_cycle_used"], route_data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Error fetching route data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

        locs = route_data["locations"]
        for stop in result["stops"]:
            if stop["type"] == "pickup":
                stop["lat"] = locs["pickup"]["lat"]
                stop["lng"] = locs["pickup"]["lng"]
            elif stop["type"] == "dropoff":
                stop["lat"] = locs["dropoff"]["lat"]
                stop["lng"] = locs["dropoff"]["lng"]

        result["locations"] = locs
        return Response(result, status=status.HTTP_200_OK)
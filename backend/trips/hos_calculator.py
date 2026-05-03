""""

Rules enforced (70hr/8day, property carrier, no adverse conditions):
  - Max 11 hours DRIVING per shift
  - Max 14-hour WINDOW per shift (starts when driver first goes on-duty)
  - 30-minute break required after 8 cumulative driving hours without a break
  - 10 consecutive hours off-duty resets the 11hr and 14hr clocks
  - 70-hour/8-day rolling cycle limit
  - Fuel stop every 1,000 miles (30 min, counts as on-duty)
  - Pickup: 1 hour on-duty (not driving)
  - Dropoff: 1 hour on-duty (not driving)
  - Average speed assumed: 55 mph
"""

MAX_DRIVING_HRS   = 11.0
MAX_WINDOW_HRS    = 14.0
BREAK_AFTER_HRS   = 8.0    # total driving before mandatory 30-min break
BREAK_DURATION    = 0.5    # 30 min
RESET_DURATION    = 10.0   # 10 hrs off resets
MAX_CYCLE_HRS     = 70.0
FUEL_EVERY_MILES  = 1000.0
FUEL_DURATION     = 0.5    # 30 min
PICKUP_DURATION   = 1.0
DROPOFF_DURATION  = 1.0
AVG_SPEED_MPH     = 55.0


def _fmt_time(day: int, hour: float) -> str:
    """Format a clock time as 'Day N HH:MM'. Helper used for stop labels."""
    h = int(hour) % 24
    m = int((hour % 1) * 60)
    return f"Day {day + 1} {h:02d}:{m:02d}"





def calculate_trip(current_cycle_used: float, route_data: dict) -> dict:
    """
    Simulate a full trip and return stops + daily log entries.
    """

    leg1_miles = route_data["leg1_miles"]
    leg2_miles = route_data["leg2_miles"]

    # clock state
    clock = 6.0 # day 0 6am
    day = 0 # current day index
    driving_shift = 0.0 # resets after 10hrs
    window_used = 0.0  # resets after 10hrs
    driving_no_break = 0.0   # resets after 30-min break
    cycle_used = current_cycle_used
    miles_since_fuel = 0.0

    stops = []
    daily_logs = [] # list of {date,entries,total_miles,remarks}

    if cycle_used >= MAX_CYCLE_HRS:
      raise ValueError("Driver has exhausted their 70-hour cycle. A 34-hour restart is required.")


    def add_log_entry(status,start,end,location):
        nonlocal day
        start_day = int(start/24)
        end_day = int(end/24)
        if start_day == end_day:
            _append_entry(start_day,status,start%24,end%24,location)
        else:
            _append_entry(start_day,status,start%24,24.0,location)
            _append_entry(end_day,status,0.0,end%24,location)


    def _append_entry(day_index,status,start_time,end_time,location):
        while len(daily_logs) <= day_index:
            daily_logs.append({
                "date":f"Day {len(daily_logs)+1}",
                "entries": [],
                "total_miles":0.0,
                "remarks":[]
            })
        daily_logs[day_index]["entries"].append({
            "status": status,
            "start_time": start_time,
            "end_time": end_time
        })
        daily_logs[day_index]["remarks"].append(f"{status.title()} at {location}")


    def take_brake(duration,status,location,stop_type=None):
        nonlocal clock,driving_shift,window_used,driving_no_break,cycle_used

        start=clock
        clock+=duration

        add_log_entry(status,start,clock,location)

        if duration >= 0.5:
            driving_no_break = 0.0
        if duration >= RESET_DURATION:
            driving_shift = 0.0
            window_used=0.0

        if stop_type:
            stops.append({
                "type":stop_type,
                "location":location,
                "arrival_time":_fmt_time(int(start/24),start%24),
                "departure_time":_fmt_time(int(clock/24),clock%24),
                "duration_hours":duration,
                "lat":0.0,
                "lng":0.0
            })

    def drive_segment(miles,location):
        nonlocal clock,driving_shift,window_used,driving_no_break,cycle_used,miles_since_fuel

        remaining_miles = miles

        while remaining_miles > 0:
            can_drive = min(
                MAX_DRIVING_HRS - driving_shift, # 11hr max driving per shift
                MAX_WINDOW_HRS - window_used, # 14hr max window per shift
                BREAK_AFTER_HRS - driving_no_break, #8hr max driving without break
                MAX_CYCLE_HRS - cycle_used # 70hr max per cycle
            )

            if can_drive <= 0:
              if MAX_CYCLE_HRS - cycle_used <= 0:
                raise ValueError("Driver has exhausted their 70-hour cycle mid-trip.")
              take_brake(RESET_DURATION,"sleeper",location,"rest")
              continue

            miles_to_fuel = FUEL_EVERY_MILES - miles_since_fuel
            drive_miles = min(remaining_miles,can_drive* AVG_SPEED_MPH, miles_to_fuel)
            drive_hours = drive_miles/ AVG_SPEED_MPH

            start = clock
            add_log_entry("driving",start,clock+drive_hours,location)

            current_day = int(clock/24)
            while len(daily_logs) <= current_day:
                daily_logs.append({
                    "date":f"Day {len(daily_logs)+1}",
                    "entries":[],
                    "total_miles":0.0,
                    "remarks":[]
                })

            daily_logs[current_day]["total_miles"] += round(drive_miles,1)

            clock += drive_hours
            driving_shift += drive_hours
            window_used += drive_hours
            driving_no_break += drive_hours
            cycle_used += drive_hours
            miles_since_fuel += drive_miles
            remaining_miles -= drive_miles

            if miles_since_fuel >= FUEL_EVERY_MILES and remaining_miles > 0:
                take_brake(FUEL_DURATION,"on-duty",location,stop_type="fuel")
                miles_since_fuel = 0.0
    # initial start before leaving current location is always off-duty
    add_log_entry("off-duty", 0, 6.0,route_data["locations"]["current"]["label"])
    # current to pickup (leg1)
    drive_segment(leg1_miles,route_data["locations"]["pickup"]["label"])
    # take break (1hr pickup)
    take_brake(PICKUP_DURATION,"on-duty",route_data["locations"]["pickup"]["label"],stop_type="pickup")
    # pickup to dropoff (leg2)
    drive_segment(leg2_miles,route_data["locations"]["dropoff"]["label"])
    # take break (1hr dropoff)
    take_brake(DROPOFF_DURATION,"on-duty",route_data["locations"]["dropoff"]["label"],stop_type="dropoff")
    # consider off duty untill end of day after dropoff
    current_day = int(clock / 24)
    time_of_day = clock % 24
    if time_of_day != 0:
      _append_entry(current_day, "off-duty", time_of_day, 24.0,route_data["locations"]["current"]["label"])

    return{
        "stops":stops,
        "daily_logs":daily_logs,
        "total_distance_miles": round(leg1_miles +leg2_miles,1),
        "total_duration_hours":round(clock-0.6,2),
        "route_coords":route_data["coords"]
    }


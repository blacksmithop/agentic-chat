from langchain_core.tools import tool
from datetime import datetime as dt
import pytz as tz

CT = tz.timezone('Asia/Calcutta')

@tool
def get_date_and_time() -> str:
    """Get local date & time in DD-MM-YY  HH:MM:SS TZ format"""
    now = dt.now()
    now_local = CT.localize(now, is_dst=None)
    time_now = now_local.strftime("%d-%m-%Y %H:%M:%S %Z")
    return time_now
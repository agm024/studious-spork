from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.utils.crypto import get_random_string
import logging
import json
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

logger = logging.getLogger(__name__)



import logging

from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)

GENERIC_DETAIL = "Something went wrong. Please try again."


def api_exception_handler(exc, context):
    """Keep Django REST Framework error bodies, and return JSON for anything else."""
    response = exception_handler(exc, context)
    if response is not None:
        return response

    logger.error("Unhandled API exception", exc_info=exc)
    return Response({"detail": GENERIC_DETAIL}, status=500)

from django.test import TestCase
from rest_framework.exceptions import NotFound, ValidationError

from core.exceptions import GENERIC_DETAIL, api_exception_handler


class ApiExceptionHandlerTests(TestCase):
    def test_passes_through_drf_errors(self):
        response = api_exception_handler(NotFound(), {})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(str(response.data['detail']), 'Not found.')

    def test_passes_through_validation_errors(self):
        response = api_exception_handler(ValidationError({'name': ['This field is required.']}), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['name'], ['This field is required.'])

    def test_unhandled_exception_is_json(self):
        response = api_exception_handler(RuntimeError('database down'), {})
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.data, {'detail': GENERIC_DETAIL})

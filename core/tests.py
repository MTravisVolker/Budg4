from datetime import date
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.test import APIClient

from core.exceptions import GENERIC_DETAIL, api_exception_handler
from core.models import BankAccount, BankAccountInstance, Bill, DueBill, Status
from core.month_plan import build_month_plan


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


def _bill_row(bill_id, name, amount, due, pay=None):
    return {
        'bill_id': bill_id,
        'name': name,
        'amount_due': Decimal(amount),
        'total_balance': Decimal('0.00'),
        'draft_account': None,
        'recurrence': None,
        'priority': 1,
        'due_date': due,
        'pay_date': pay or due,
    }


class MonthPlanTests(TestCase):
    def test_latest_month_is_copied_forward_and_older_only_rows_stay_unchecked(self):
        plan = build_month_plan(
            [
                _bill_row(1, 'Rent', '1000.00', date(2026, 10, 1)),
                _bill_row(1, 'Rent', '1100.00', date(2026, 11, 1)),
                _bill_row(2, 'Gym', '40.00', date(2026, 10, 5)),
            ],
            [{
                'bank_account_id': 7,
                'name': 'Checking',
                'balance': Decimal('250.00'),
                'due_date': date(2026, 11, 1),
                'pay_date': date(2026, 11, 1),
            }],
            set(),
            set(),
            upcoming_status_id=4,
        )
        rent = next(row for row in plan['bills'] if row['name'] == 'Rent')
        gym = next(row for row in plan['bills'] if row['name'] == 'Gym')
        self.assertEqual(plan['target_label'], 'December 2026')
        self.assertEqual(rent['due_date'], '2026-12-01')
        self.assertEqual(rent['amount_due'], '1100.00')
        self.assertTrue(rent['selected'])
        self.assertIn('1100.00', rent['note'])
        self.assertFalse(gym['selected'])
        self.assertEqual(gym['due_date'], '2026-12-05')
        self.assertEqual(plan['accounts'][0]['balance'], '250.00')
        self.assertEqual(plan['accounts'][0]['status'], 4)

    def test_rows_already_in_the_target_month_are_not_selected(self):
        plan = build_month_plan(
            [_bill_row(1, 'Rent', '1000.00', date(2026, 11, 1))],
            [],
            {(1, date(2026, 12, 1))},
            set(),
            None,
        )
        self.assertFalse(plan['bills'][0]['selected'])
        self.assertTrue(plan['bills'][0]['already_exists'])

    def test_empty_history_has_no_rows(self):
        plan = build_month_plan([], [], set(), set(), None)
        self.assertEqual(plan['bills'], [])
        self.assertIn('no bills', plan['message'])


class MonthPlanApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='planner', password='secret')
        self.other = User.objects.create_user(username='other', password='secret')
        self.account = BankAccount.objects.create(user=self.user, name='Checking', font_color='#000')
        self.bill = Bill.objects.create(
            user=self.user,
            name='Rent',
            default_amount_due=Decimal('1000.00'),
            total_balance=Decimal('0.00'),
        )
        DueBill.objects.create(
            bill=self.bill,
            amount_due=Decimal('1000.00'),
            total_balance=Decimal('0.00'),
            draft_account=self.account,
            due_date=date(2026, 11, 1),
            pay_date=date(2026, 11, 1),
            priority=2,
        )
        BankAccountInstance.objects.create(
            bank_account=self.account,
            balance=Decimal('80.00'),
            due_date=date(2026, 11, 1),
            pay_date=date(2026, 11, 1),
        )
        Status.objects.create(name='Upcoming', highlight_color='#ccc')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_preview_and_create_next_month(self):
        preview = self.client.get('/api/month-plan/')
        self.assertEqual(preview.status_code, 200)
        self.assertEqual(preview.data['bills'][0]['due_date'], '2026-12-01')
        created = self.client.post('/api/month-plan/', {
            'bills': preview.data['bills'],
            'accounts': preview.data['accounts'],
        }, format='json')
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data['created_bills'], 1)
        self.assertEqual(created.data['created_accounts'], 1)
        self.assertTrue(DueBill.objects.filter(bill=self.bill, due_date=date(2026, 12, 1)).exists())

    def test_create_rejects_another_users_bill(self):
        foreign = Bill.objects.create(
            user=self.other,
            name='Theirs',
            default_amount_due=Decimal('5.00'),
            total_balance=Decimal('0.00'),
        )
        response = self.client.post('/api/month-plan/', {
            'bills': [{
                'bill': foreign.id,
                'amount_due': '5.00',
                'total_balance': '0.00',
                'due_date': '2026-12-01',
                'pay_date': '2026-12-01',
                'priority': 0,
            }],
            'accounts': [],
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(DueBill.objects.filter(bill=foreign).exists())

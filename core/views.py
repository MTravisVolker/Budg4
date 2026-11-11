from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Status, Recurrence, Category, BankAccount, BankAccountInstance, Bill, DueBill, AuditLog
from .month_plan import build_month_plan, month_end, month_start, occurrence_date
from .serializers import (
    StatusSerializer, RecurrenceSerializer, CategorySerializer, BankAccountSerializer,
    BankAccountInstanceSerializer, BillSerializer, DueBillSerializer, AuditLogSerializer
)

# Create your views here.

# Global/shared models (no user filtering)
class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

class RecurrenceViewSet(viewsets.ModelViewSet):
    queryset = Recurrence.objects.all()
    serializer_class = RecurrenceSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

# User-specific models
class BankAccountViewSet(viewsets.ModelViewSet):
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BankAccount.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BankAccountInstanceViewSet(viewsets.ModelViewSet):
    serializer_class = BankAccountInstanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = BankAccountInstance.objects.filter(bank_account__user=self.request.user)
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date and end_date:
            queryset = queryset.filter(
                pay_date__isnull=False,
                pay_date__gte=start_date,
                pay_date__lte=end_date
            )
        return queryset

class BillViewSet(viewsets.ModelViewSet):
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Bill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DueBillViewSet(viewsets.ModelViewSet):
    serializer_class = DueBillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = DueBill.objects.filter(bill__user=self.request.user)
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date and end_date:
            queryset = queryset.filter(
                pay_date__isnull=False,
                pay_date__gte=start_date,
                pay_date__lte=end_date
            )
        return queryset

class AuditLogViewSet(viewsets.ModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AuditLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


def _parse_date(value, field_name):
    if value in (None, ''):
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    try:
        return datetime.strptime(str(value), '%Y-%m-%d').date()
    except ValueError:
        raise ValueError(f'{field_name} must be a YYYY-MM-DD date.')


def _parse_money(value, field_name):
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, TypeError):
        raise ValueError(f'{field_name} must be a number.')
    return amount.quantize(Decimal('0.01'))


class MonthPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        due_rows = list(DueBill.objects.filter(bill__user=user).select_related('bill'))
        account_rows = list(
            BankAccountInstance.objects.filter(bank_account__user=user).select_related('bank_account')
        )
        due_bills = [
            {
                'bill_id': row.bill_id,
                'name': row.bill.name,
                'amount_due': row.amount_due,
                'total_balance': row.total_balance,
                'draft_account': row.draft_account_id,
                'recurrence': row.recurrence_id,
                'priority': row.priority,
                'due_date': row.due_date,
                'pay_date': row.pay_date,
            }
            for row in due_rows
        ]
        accounts = [
            {
                'bank_account_id': row.bank_account_id,
                'name': row.bank_account.name,
                'balance': row.balance,
                'due_date': row.due_date,
                'pay_date': row.pay_date,
            }
            for row in account_rows
        ]
        upcoming = Status.objects.filter(name__iexact='upcoming').order_by('id').first()
        plan = build_month_plan(
            due_bills,
            accounts,
            {(row.bill_id, row.due_date) for row in due_rows},
            {(row.bank_account_id, row.due_date) for row in account_rows},
            upcoming.id if upcoming else None,
        )
        return Response(plan)

    def post(self, request):
        user = request.user
        bills = request.data.get('bills') or []
        accounts = request.data.get('accounts') or []
        if not isinstance(bills, list) or not isinstance(accounts, list):
            return Response({'detail': 'Choose the bills and accounts to create.'}, status=400)
        if not bills and not accounts:
            return Response({'detail': 'Choose at least one bill or account.'}, status=400)

        owned_bills = set(Bill.objects.filter(user=user).values_list('id', flat=True))
        owned_accounts = set(BankAccount.objects.filter(user=user).values_list('id', flat=True))
        status_ids = set(Status.objects.values_list('id', flat=True))
        created_dates = []
        created_bills = 0
        created_accounts = 0

        try:
            with transaction.atomic():
                for item in bills:
                    bill_id = int(item.get('bill') or 0)
                    if bill_id not in owned_bills:
                        raise ValueError('One of the bills is not yours.')
                    due_date = _parse_date(item.get('due_date'), 'Due date')
                    if due_date is None:
                        raise ValueError('Each bill needs a due date.')
                    pay_date = _parse_date(item.get('pay_date'), 'Pay date') or due_date
                    draft_account = item.get('draft_account') or None
                    if draft_account is not None and int(draft_account) not in owned_accounts:
                        raise ValueError('One of the draft accounts is not yours.')
                    status = item.get('status') or None
                    if status is not None and int(status) not in status_ids:
                        raise ValueError('That status does not exist.')
                    recurrence = item.get('recurrence') or None
                    if DueBill.objects.filter(bill_id=bill_id, due_date=due_date).exists():
                        continue
                    DueBill.objects.create(
                        bill_id=bill_id,
                        recurrence_id=int(recurrence) if recurrence else None,
                        amount_due=_parse_money(item.get('amount_due'), 'Amount due'),
                        total_balance=_parse_money(item.get('total_balance') or 0, 'Total balance'),
                        draft_account_id=int(draft_account) if draft_account else None,
                        due_date=due_date,
                        pay_date=pay_date,
                        status_id=int(status) if status else None,
                        priority=int(item.get('priority') or 0),
                    )
                    created_bills += 1
                    created_dates.append(occurrence_date(due_date, pay_date))

                for item in accounts:
                    account_id = int(item.get('bank_account') or 0)
                    if account_id not in owned_accounts:
                        raise ValueError('One of the bank accounts is not yours.')
                    due_date = _parse_date(item.get('due_date'), 'Due date')
                    if due_date is None:
                        raise ValueError('Each account needs a due date.')
                    pay_date = _parse_date(item.get('pay_date'), 'Pay date') or due_date
                    status = item.get('status') or None
                    if status is not None and int(status) not in status_ids:
                        raise ValueError('That status does not exist.')
                    if BankAccountInstance.objects.filter(bank_account_id=account_id, due_date=due_date).exists():
                        continue
                    BankAccountInstance.objects.create(
                        bank_account_id=account_id,
                        balance=_parse_money(item.get('balance'), 'Balance'),
                        due_date=due_date,
                        pay_date=pay_date,
                        status_id=int(status) if status else None,
                    )
                    created_accounts += 1
                    created_dates.append(occurrence_date(due_date, pay_date))
        except (ValueError, TypeError) as exc:
            message = str(exc) if isinstance(exc, ValueError) else 'One of the rows has a value that cannot be saved.'
            return Response({'detail': message}, status=400)

        if not created_dates:
            return Response({'detail': 'Those rows are already on the plan.'}, status=400)
        start = month_start(min(created_dates))
        end = month_end(max(created_dates))
        return Response({
            'created_bills': created_bills,
            'created_accounts': created_accounts,
            'start': start.isoformat(),
            'end': end.isoformat(),
        }, status=201)

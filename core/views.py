from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Status, Recurrence, Category, BankAccount, BankAccountInstance, Bill, DueBill, AuditLog
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
        return BankAccountInstance.objects.filter(bank_account__user=self.request.user)

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
        return DueBill.objects.filter(bill__user=self.request.user)

class AuditLogViewSet(viewsets.ModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AuditLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

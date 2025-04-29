from rest_framework import serializers
from .models import Status, Recurrence, Category, BankAccount, BankAccountInstance, Bill, DueBill, AuditLog

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

class RecurrenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurrence
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = '__all__'

class BankAccountInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccountInstance
        fields = '__all__'

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = '__all__'
        read_only_fields = ['user']

class DueBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = DueBill
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__' 
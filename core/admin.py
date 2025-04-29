from django.contrib import admin
from .models import Status, Recurrence, Category, BankAccount, BankAccountInstance, Bill, DueBill, AuditLog

admin.site.register(Status)
admin.site.register(Recurrence)
admin.site.register(Category)
admin.site.register(BankAccount)
admin.site.register(BankAccountInstance)
admin.site.register(Bill)
admin.site.register(DueBill)
admin.site.register(AuditLog)

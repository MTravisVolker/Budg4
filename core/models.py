from django.db import models
from django.contrib.auth.models import User

class Status(models.Model):
    """Represents the status of a Due Bill or Bank Account Instance (e.g., Paid, Upcoming)."""
    name = models.CharField(max_length=50)
    highlight_color = models.CharField(max_length=20)

    def __str__(self):
        return self.name

class Recurrence(models.Model):
    """Defines recurrence patterns for bills (e.g., monthly, annually)."""
    name = models.CharField(max_length=50)
    calculation = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    """Custom categories for bills (e.g., Utilities, Food)."""
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class BankAccount(models.Model):
    """Represents a user's bank account."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    font_color = models.CharField(max_length=20)

    def __str__(self):
        return self.name

class BankAccountInstance(models.Model):
    """Tracks a balance of a bank account at a specific time."""
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    pay_date = models.DateField(null=True, blank=True)
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.bank_account.name} ({self.due_date})"

class Bill(models.Model):
    """Represents a recurring bill."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    default_amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    url = models.URLField(blank=True)
    draft_account = models.ForeignKey(BankAccount, on_delete=models.SET_NULL, null=True, related_name='bills')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    recurrence = models.ForeignKey(Recurrence, on_delete=models.SET_NULL, null=True)
    priority = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class DueBill(models.Model):
    """Tracks an instance/transaction of a bill."""
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE)
    recurrence = models.ForeignKey(Recurrence, on_delete=models.SET_NULL, null=True)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    draft_account = models.ForeignKey(BankAccount, on_delete=models.SET_NULL, null=True)
    due_date = models.DateField()
    pay_date = models.DateField(null=True, blank=True)
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True)
    priority = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.bill.name} ({self.due_date})"

class AuditLog(models.Model):
    """Logs key events and changes for auditing purposes."""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    table_name = models.CharField(max_length=100)
    row_id = models.IntegerField()
    action = models.CharField(max_length=20)  # 'add', 'update', 'delete'
    before_values = models.JSONField(null=True, blank=True)
    after_values = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} on {self.table_name} (row {self.row_id}) by {self.user} at {self.timestamp}"

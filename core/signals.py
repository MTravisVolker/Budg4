from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from .models import (
    BankAccount, BankAccountInstance, Bill, DueBill, Status, Recurrence, Category, AuditLog
)
from .middleware import get_current_user
from django.utils.functional import SimpleLazyObject
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
import decimal
User = get_user_model()

AUDITED_MODELS = [BankAccount, BankAccountInstance, Bill, DueBill, Status, Recurrence, Category]

# Store old values before save
_old_instance_cache = {}

def get_instance_key(instance):
    return f"{instance.__class__.__name__}:{instance.pk}"

def resolve_user(user):
    if isinstance(user, SimpleLazyObject):
        try:
            _ = user.pk  # Force evaluation
        except Exception:
            return None
    if not user or not hasattr(user, 'is_authenticated') or not user.is_authenticated:
        return None
    if not isinstance(user, User):
        return None
    return user

def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, decimal.Decimal):
        return float(obj)
    return obj

@receiver(pre_save)
def cache_old_instance(sender, instance, **kwargs):
    if sender in AUDITED_MODELS and instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            _old_instance_cache[get_instance_key(instance)] = model_to_dict(old)
        except sender.DoesNotExist:
            pass

@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    if sender not in AUDITED_MODELS:
        return
    user = get_current_user()
    user = resolve_user(user)
    table_name = sender.__name__
    row_id = instance.pk
    after_values = convert_decimals(model_to_dict(instance))
    if created:
        AuditLog.objects.create(
            user=user,
            table_name=table_name,
            row_id=row_id,
            action='add',
            before_values=None,
            after_values=after_values
        )
    else:
        before_values = _old_instance_cache.pop(get_instance_key(instance), None)
        before_values = convert_decimals(before_values)
        AuditLog.objects.create(
            user=user,
            table_name=table_name,
            row_id=row_id,
            action='update',
            before_values=before_values,
            after_values=after_values
        )

@receiver(pre_delete)
def cache_delete_instance(sender, instance, **kwargs):
    if sender in AUDITED_MODELS:
        _old_instance_cache[get_instance_key(instance)] = model_to_dict(instance)

@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender not in AUDITED_MODELS:
        return
    user = get_current_user()
    user = resolve_user(user)
    table_name = sender.__name__
    row_id = instance.pk
    before_values = _old_instance_cache.pop(get_instance_key(instance), None)
    before_values = convert_decimals(before_values)
    AuditLog.objects.create(
        user=user,
        table_name=table_name,
        row_id=row_id,
        action='delete',
        before_values=before_values,
        after_values=None
    ) 
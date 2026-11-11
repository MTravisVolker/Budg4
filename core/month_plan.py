import calendar
from datetime import date
from decimal import Decimal


def add_months(value, months):
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def month_start(value):
    return value.replace(day=1)


def month_end(value):
    return date(value.year, value.month, calendar.monthrange(value.year, value.month)[1])


def occurrence_date(due_date, pay_date):
    return pay_date or due_date


def _money(value):
    return f'{Decimal(value):.2f}'


def _month_name(value):
    return value.strftime('%B %Y')


def _latest_substantial_month(dated):
    """Latest month with more than one row.

    A single mistyped year would otherwise become the month everything is copied from.
    """
    counts = {}
    for when in dated:
        counts[(when.year, when.month)] = counts.get((when.year, when.month), 0) + 1
    substantial = [key for key, count in counts.items() if count >= 2]
    year, month = max(substantial or counts)
    return date(year, month, 1)


def build_month_plan(due_bills, account_instances, existing_bill_dates, existing_account_dates, upcoming_status_id):
    """Propose next month's due bills and account balances from the previous two months."""
    dated = []
    for row in due_bills:
        when = occurrence_date(row['due_date'], row['pay_date'])
        if when:
            dated.append(when)
    for row in account_instances:
        when = occurrence_date(row['due_date'], row['pay_date'])
        if when:
            dated.append(when)

    if not dated:
        return {
            'history_start': None,
            'history_end': None,
            'target_label': None,
            'message': 'There are no bills or account balances to plan from yet.',
            'bills': [],
            'accounts': [],
        }

    recent_start = _latest_substantial_month(dated)
    older_start = add_months(recent_start, -1)
    target_start = add_months(recent_start, 1)
    older_label = _month_name(older_start)
    recent_label = _month_name(recent_start)
    target_label = _month_name(target_start)

    def in_month(when, start):
        return when is not None and when.year == start.year and when.month == start.month

    bills = []
    by_bill = {}
    for row in due_bills:
        when = occurrence_date(row['due_date'], row['pay_date'])
        if in_month(when, recent_start) or in_month(when, older_start):
            by_bill.setdefault(row['bill_id'], []).append(row)

    for bill_id, rows in by_bill.items():
        recent_rows = [row for row in rows if in_month(occurrence_date(row['due_date'], row['pay_date']), recent_start)]
        source_rows = recent_rows or rows
        shift = 1 if recent_rows else 2
        for source in source_rows:
            due_date = add_months(source['due_date'], shift)
            pay_source = source['pay_date'] or source['due_date']
            pay_date = add_months(pay_source, shift)
            already = (bill_id, due_date) in existing_bill_dates
            same_month_older = [
                row for row in rows
                if row is not source and in_month(occurrence_date(row['due_date'], row['pay_date']), older_start)
            ]
            if recent_rows and same_month_older:
                previous = max(same_month_older, key=lambda row: occurrence_date(row['due_date'], row['pay_date']))
                if previous['amount_due'] == source['amount_due']:
                    note = f'In both {older_label} and {recent_label}. Same amount.'
                else:
                    note = (
                        f'Amount changed from {_money(previous["amount_due"])} in {older_label} '
                        f'to {_money(source["amount_due"])} in {recent_label}.'
                    )
            elif recent_rows:
                note = f'Only in {recent_label}.'
            else:
                note = f'In {older_label}, not in {recent_label}.'
            if source['pay_date'] is None:
                note = f'{note} Pay date set to the due date so it shows on the table.'
            if already:
                note = f'Already planned for {target_label}.'
            bills.append({
                'bill': bill_id,
                'name': source['name'],
                'amount_due': _money(source['amount_due']),
                'total_balance': _money(source['total_balance']),
                'draft_account': source['draft_account'],
                'recurrence': source['recurrence'],
                'priority': source['priority'],
                'due_date': due_date.isoformat(),
                'pay_date': pay_date.isoformat(),
                'status': None if already else upcoming_status_id,
                'selected': bool(recent_rows) and not already,
                'already_exists': already,
                'note': note,
            })

    accounts = []
    by_account = {}
    for row in account_instances:
        when = occurrence_date(row['due_date'], row['pay_date'])
        if in_month(when, recent_start) or in_month(when, older_start):
            by_account.setdefault(row['bank_account_id'], []).append(row)

    for account_id, rows in by_account.items():
        recent_rows = [row for row in rows if in_month(occurrence_date(row['due_date'], row['pay_date']), recent_start)]
        if recent_rows:
            sources = sorted(recent_rows, key=lambda row: occurrence_date(row['due_date'], row['pay_date']))
            shift = 1
        else:
            sources = [max(rows, key=lambda row: occurrence_date(row['due_date'], row['pay_date']))]
            shift = 2
        for source in sources:
            due_date = add_months(source['due_date'], shift)
            pay_date = add_months(source['pay_date'] or source['due_date'], shift)
            already = (account_id, due_date) in existing_account_dates
            if recent_rows:
                note = f'Balance copied from {recent_label}. Update it when you know the new balance.'
            else:
                note = f'Last balance is from {older_label}, not {recent_label}.'
            if already:
                note = f'Already planned for {target_label}.'
            accounts.append({
                'bank_account': account_id,
                'name': source['name'],
                'balance': _money(source['balance']),
                'due_date': due_date.isoformat(),
                'pay_date': pay_date.isoformat(),
                'status': None if already else upcoming_status_id,
                'selected': bool(recent_rows) and not already,
                'already_exists': already,
                'note': note,
            })

    unique_bills = []
    seen_bills = set()
    for row in bills:
        key = (row['bill'], row['due_date'])
        if key in seen_bills:
            continue
        seen_bills.add(key)
        unique_bills.append(row)
    bills = unique_bills
    bills.sort(key=lambda row: (row['due_date'], row['name'].lower()))
    unique_accounts = []
    seen_accounts = set()
    for row in accounts:
        key = (row['bank_account'], row['due_date'])
        if key in seen_accounts:
            continue
        seen_accounts.add(key)
        unique_accounts.append(row)
    accounts = unique_accounts
    accounts.sort(key=lambda row: (row['due_date'], row['name'].lower()))
    return {
        'history_start': older_start.isoformat(),
        'history_end': month_end(recent_start).isoformat(),
        'target_label': target_label,
        'message': f'Built from {older_label} and {recent_label}. New rows land in {target_label}.',
        'bills': bills,
        'accounts': accounts,
    }

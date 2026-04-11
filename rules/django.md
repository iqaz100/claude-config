# Python / Django REST Framework

## Import Order (PEP 8 + isort)

```python
# 1. Standard library
from typing import Optional

# 2. Django
from django.db import models
from django.contrib.auth import get_user_model

# 3. Django REST Framework
from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# 4. Third-party
from drf_spectacular.utils import extend_schema, OpenApiParameter

# 5. Local (project apps) — absolute imports from app name
from pubs.models import Pub, UserPub
from pubs.serializers import PubSerializer
from users.models import User
```

Rules:
- Always use absolute imports (e.g., `from pubs.models import Pub`), not relative (`from .models import Pub`), unless inside the same app and the file is short.
- One blank line between import groups.

## Type Hints

- Annotate all function signatures (parameters and return types):

```python
def get_queryset(self) -> models.QuerySet:
    ...

def can_user_manage(self, user: User) -> None:
    ...
```

- Use `str | None` (Python 3.10+) rather than `Optional[str]` in new code.
- For Django model methods that return `None` or raise, annotate `-> None`.

## Models

- One blank line between field definitions (project convention — matches existing code).
- Define `__str__` on every model.
- Use `TextChoices` for enum-like fields (nested class inside the model):

```python
class UserPub(models.Model):
    class Role(models.TextChoices):
        OWNER = 'OWNER', 'Owner'
        MANAGER = 'MANAGER', 'Manager'
        VIEWER = 'VIEWER', 'Viewer'

    role = models.CharField(max_length=20, choices=Role.choices)
```

- Always set `related_name` on `ForeignKey` and `ManyToManyField`:
  `pub = models.ForeignKey(Pub, on_delete=models.CASCADE, related_name='user_pubs')`
- Prefer `select_related()` for FK lookups and `prefetch_related()` for M2M in views — avoid N+1 queries.

## Serializers

- Never use `fields = "__all__"` in serializers that are part of a public API — list fields explicitly.
- If request and response shapes differ significantly, use separate read/write serializers.
- Validation logic belongs in `validate_<field>` or `validate` methods, not in views.
- Nested serializers should be `read_only=True` unless the nested object is being created/updated in the same request.

```python
class PubSerializer(serializers.ModelSerializer):
    opening_hours = OpeningHoursSerializer(many=True, read_only=True)

    class Meta:
        model = Pub
        fields = ['id', 'name', 'description', 'logo', 'is_active', 'address', 'opening_hours']
```

## Views / ViewSets

- Use `@extend_schema` on every custom `@action` with at minimum `summary` and `parameters`.
- Raise DRF exception classes (or custom API exception subclasses) from views — never return raw `Response(status=4xx)` with no body for business logic errors.
- Permission classes must be declared explicitly per view or per action (`permission_classes=[IsAuthenticated]`).
- Keep views thin: business logic belongs in a service class or model method, not inline in the view.

```python
# Thin view — correct
@action(detail=False, methods=['GET'])
def search(self, request):
    pubs = PubSearchService.search(**request.query_params.dict())
    return Response(PubSerializer(pubs, many=True).data)

# Fat view — avoid
@action(detail=False, methods=['GET'])
def search(self, request):
    city = request.query_params.get('city')
    qs = Pub.objects.filter(is_active=True)
    if city:
        qs = qs.filter(address__city__iexact=city)
    # ... 20 more lines of filtering logic
```

## Exceptions

- Define custom domain exceptions in `<app>/exceptions.py`.
- Two-class pattern: domain exception (plain Python) + API exception (DRF `APIException` subclass):

```python
# exceptions.py
class NoPermissionToManagePubException(Exception):
    pass

class NoPermissionToManagePubApiException(APIException):
    status_code = 403
    default_detail = 'You do not have permission to manage this pub.'
```

- Catch domain exceptions at the view boundary, re-raise as API exceptions.

## Testing

- Use `factory_boy` factories — never create model instances directly with `.objects.create()` in test files.
- Test class per endpoint/action, method per scenario.
- Every new endpoint needs at minimum: happy path, unauthenticated access (401/403), invalid input (400).
- Use `self.client.force_login(user)` for authenticated test requests.

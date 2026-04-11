# TypeScript / Angular

## Import Order

Enforce this order — one blank line between each group:

```typescript
// 1. Angular core & platform
import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

// 2. Third-party libraries
import { Observable, of, catchError, map } from 'rxjs';
import { LucideAngularModule, Star, MapPin } from 'lucide-angular';

// 3. Local — models, services, components, guards
import { Pub } from '../../../core/models/pub.model';
import { PubService } from '../../../core/services/pub.service';
import { environment } from '../../../environments/environment';
```

Rules:
- Never mix groups or reorder within a group.
- Import only what is used — no blanket `* as` imports.
- `CommonModule` is acceptable in existing components; prefer specific directives (`NgIf`, `NgFor`) or Angular 17+ control flow in new code.

## TypeScript Typing

- **Always** annotate return types on public methods and service functions.
- Use `interface` for data shapes (API models, component props). Use `type` for unions and aliases.
- No `any`. Use `unknown` + type guard if the shape is truly unknown.
- Use `readonly` on arrays that should not be mutated: `readonly string[]`.
- Prefer string union literals over `enum`:

```typescript
// Preferred
type Role = 'OWNER' | 'MANAGER' | 'VIEWER';

// Also acceptable for richer semantics
const Role = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  VIEWER: 'VIEWER',
} as const;
type Role = typeof Role[keyof typeof Role];
```

- Optional fields use `?`, not `| undefined`: `description?: string`.
- API response shapes live in `core/models/` — one file per domain entity.

## Angular Components

- All components **must** be `standalone: true`. Never add them to an NgModule.
- Use `inject()` function for dependency injection in new components, not constructor parameters.
- Use signals API (`input()`, `output()`, `signal()`, `computed()`) for new components (Angular 17+):

```typescript
// New — signals API
export class PubCardComponent {
  pub = input.required<Pub>();
  selected = output<number>();
  isExpanded = signal(false);
  displayName = computed(() => this.pub().name.toUpperCase());
}

// Legacy — acceptable in existing components only
export class OldComponent {
  @Input() pub!: Pub;
  @Output() selected = new EventEmitter<number>();
}
```

- Do not put logic in templates. Use `get` accessors or `computed()` instead:

```typescript
// Correct
get amenityList(): Amenity[] { return this.pub.amenities.slice(0, 4); }

// Wrong — logic in template
// {{ pub.amenities.slice(0, 4).join(', ') }}
```

- Use Angular 17+ control flow syntax in new templates:

```html
<!-- Preferred -->
@if (isLoading()) { <app-spinner /> }
@for (pub of pubs(); track pub.id) { <app-pub-card [pub]="pub" /> }

<!-- Legacy — acceptable in existing templates -->
<div *ngIf="isLoading"><app-spinner /></div>
```

## HTTP Services

- Live in `core/services/`. Return `Observable<T>` with explicit generic type.
- Use `environment.apiUrl` as base — never hardcode `localhost` or any URL.
- `withCredentials` and error handling are managed globally by interceptors — do not add them per-request.
- During development, use `catchError(() => of(MOCK_DATA))` as a fallback. Remove it once the real endpoint is ready.
- Use `HttpParams` for query strings, not string interpolation:

```typescript
// Correct
const params = new HttpParams().set('city', city).set('q', query);
return this.http.get<Pub[]>(this.apiUrl, { params });

// Acceptable for simple cases
return this.http.get<Pub[]>(`${this.apiUrl}?city=${encodeURIComponent(city)}`);
```

## RxJS

- Import operators from `rxjs` (not `rxjs/operators`) for Angular 16+:
  `import { catchError, map, switchMap } from 'rxjs';`
- Prefer `async` pipe in templates over manual subscriptions.
- When a manual subscription is necessary, unsubscribe in `ngOnDestroy` or use `takeUntilDestroyed()`.
- Keep pipe chains readable — one operator per line for chains longer than 2.

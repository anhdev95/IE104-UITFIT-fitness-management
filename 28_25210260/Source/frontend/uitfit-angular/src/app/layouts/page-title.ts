import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/** Lấy data.title của route con sâu nhất để hiển thị trên header */
export function pageTitleSignal() {
  const router = inject(Router);
  const read = (): string => {
    let snapshot = router.routerState.snapshot.root;
    while (snapshot.firstChild) snapshot = snapshot.firstChild;
    return (snapshot.data?.['title'] as string) ?? '';
  };
  return toSignal(
    router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(read),
    ),
    { initialValue: read() },
  );
}

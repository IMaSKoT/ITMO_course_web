import {writable} from "svelte/store";
import {concat, map, of, Subject, switchMap, timer} from "rxjs";

const NOTICE_TIME = 4000;
const notices$ = new Subject();

export const notice = writable(null);

notices$
    .pipe(switchMap(next => concat(of(next), timer(NOTICE_TIME).pipe(map(() => null)))))
    .subscribe(next => notice.set(next));

export function showNotice(text, isError = false) {
    notices$.next({text, isError});
}

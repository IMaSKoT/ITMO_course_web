import {catchError, concat, filter, interval, map, Observable, of, startWith, switchMap} from "rxjs";

const REFRESH_INTERVAL = 30000;

export function fromRequest(requestFn) {
    return new Observable(subscriber => {
        const controller = new AbortController();
        requestFn(controller.signal).then(
            data => {
                subscriber.next(data);
                subscriber.complete();
            },
            error => subscriber.error(error)
        );
        return () => controller.abort();
    });
}

export function toAsyncState(requestFn) {
    return fromRequest(requestFn).pipe(
        map(data => ({status: "success", data})),
        startWith({status: "loading"}),
        catchError(error => of({status: "error", error}))
    );
}

// фоновые запросы идут без статуса loading, чтобы страница не мигала лоадером
export function toPollingState(requestFn) {
    return concat(
        toAsyncState(requestFn),
        interval(REFRESH_INTERVAL).pipe(
            switchMap(() => toAsyncState(requestFn).pipe(filter(next => next.status !== "loading")))
        )
    );
}

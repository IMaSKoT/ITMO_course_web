import {catchError, map, Observable, of, startWith} from "rxjs";

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

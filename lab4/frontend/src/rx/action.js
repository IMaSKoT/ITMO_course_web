import {BehaviorSubject, exhaustMap, Subject} from "rxjs";
import {toAsyncState} from "./request.js";

export function createAction(requestFn, onSuccess) {
    const runs$ = new Subject();
    const state = new BehaviorSubject({status: "idle"});

    const subscription = runs$
        .pipe(exhaustMap(value => toAsyncState(signal => requestFn(value, signal))))
        .subscribe(next => {
            state.next(next);
            if (next.status === "success" && onSuccess) {
                onSuccess(next.data);
            }
        });

    return {
        state,
        run: value => runs$.next(value),
        destroy: () => subscription.unsubscribe(),
    };
}

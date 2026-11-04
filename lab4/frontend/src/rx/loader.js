import {BehaviorSubject, Subject, switchMap} from "rxjs";
import {toAsyncState} from "./request.js";

export function createLoader(requestFn) {
    const args$ = new Subject();
    const state = new BehaviorSubject({status: "loading"});

    const subscription = args$
        .pipe(switchMap(arg => toAsyncState(signal => requestFn(arg, signal))))
        .subscribe(next => state.next(next));

    return {
        state,
        load: arg => args$.next(arg),
        destroy: () => subscription.unsubscribe(),
    };
}

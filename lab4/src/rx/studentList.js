import {
    BehaviorSubject,
    combineLatest,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    scan,
    startWith,
    Subject,
    switchMap,
} from "rxjs";
import {toAsyncState} from "./request.js";

const INPUT_DELAY = 300;

function sameQuery(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function createStudentList(loadPage, initialQuery, toParams, prepareFilters) {
    const query = new BehaviorSubject(initialQuery);
    const state = new BehaviorSubject({status: "loading"});
    const filters$ = new Subject();
    const reload$ = new Subject();

    function update(changes) {
        query.next({...query.value, ...changes});
    }

    const filtersSubscription = filters$
        .pipe(
            debounceTime(INPUT_DELAY),
            map(prepareFilters),
            filter(filters => filters !== null)
        )
        .subscribe(filters => {
            if (!sameQuery(filters, query.value.filters)) {
                update({filters, page: 1});
            }
        });

    const stateSubscription = combineLatest([
        query.pipe(distinctUntilChanged(sameQuery)),
        reload$.pipe(startWith(null)),
    ])
        .pipe(
            switchMap(([current]) => toAsyncState(signal => loadPage(toParams(current), signal))),
            scan((previous, next) => ({...next, data: next.data ?? previous.data}), {})
        )
        .subscribe(next => {
            state.next(next);
            if (next.status === "success" && next.data.totalPages > 0 && query.value.page > next.data.totalPages) {
                update({page: next.data.totalPages});
            }
        });

    return {
        query,
        state,
        setFilters: values => filters$.next(values),
        setPage: page => update({page}),
        setSize: size => update({size, page: 1}),
        toggleSort(field) {
            const {sort, order} = query.value;
            const nextOrder = sort === field && order === "asc" ? "desc" : "asc";
            update({sort: field, order: nextOrder, page: 1});
        },
        reload: () => reload$.next(null),
        destroy() {
            filtersSubscription.unsubscribe();
            stateSubscription.unsubscribe();
        },
    };
}

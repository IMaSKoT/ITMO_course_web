<script>
    import {FIELD_LABELS} from "../domain/labels.js";

    let {error} = $props();

    const message = $derived(typeof error === "string" ? error : error?.message);
    const details = $derived(error?.details ?? []);
</script>

{#if error}
    <div class="alert alert-danger" role="alert">
        <p class="mb-0">{message}</p>
        {#if details.length > 0}
            <ul class="mt-2 mb-0">
                {#each details as detail}
                    <li>{FIELD_LABELS[detail.field] ? `${FIELD_LABELS[detail.field]}: ` : ""}{detail.message}</li>
                {/each}
            </ul>
        {/if}
    </div>
{/if}

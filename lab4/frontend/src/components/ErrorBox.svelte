<script>
    import {FIELD_LABELS} from "../domain/labels.js";

    let {error} = $props();

    const message = $derived(typeof error === "string" ? error : error?.message);
    const details = $derived(error?.details ?? []);
</script>

{#if error}
    <div class="error-box">
        <p>{message}</p>
        {#if details.length > 0}
            <ul>
                {#each details as detail}
                    <li>{FIELD_LABELS[detail.field] ? `${FIELD_LABELS[detail.field]}: ` : ""}{detail.message}</li>
                {/each}
            </ul>
        {/if}
    </div>
{/if}

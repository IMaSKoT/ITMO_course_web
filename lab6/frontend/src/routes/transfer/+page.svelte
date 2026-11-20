<script>
    import {onMount} from "svelte";
    import {invalidate} from "$app/navigation";
    import ErrorBox from "#lib/components/ErrorBox.svelte";
    import Loader from "#lib/components/Loader.svelte";
    import {realtimeRequest, refreshSession} from "#lib/realtime.js";

    const STATUS_LABELS = {
        queued: "Ожидает запуска", running: "Выполняется", completed: "Завершён",
        "completed-with-errors": "Завершён с ошибками", failed: "Прерван",
    };

    let files = $state();
    let job = $state(null);
    let error = $state(null);
    let uploading = $state(false);
    let exporting = $state(false);
    let timer;
    let mounted = false;
    const running = $derived(job?.status === "queued" || job?.status === "running");

    async function checkJob(id) {
        try {
            const result = await realtimeRequest(`/imports/${id}`);
            if (!mounted) {
                return;
            }
            job = result;
            if (running) {
                timer = setTimeout(() => checkJob(id), 1000);
            } else {
                sessionStorage.removeItem("importJob");
                await invalidate("app:students");
            }
        } catch (err) {
            if (err.status === 404) {
                sessionStorage.removeItem("importJob");
                job = null;
            }
            error = err.message;
        }
    }

    async function startImport(event) {
        event.preventDefault();
        const file = files?.[0];
        if (!file || uploading || running) {
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            error = "Файл должен быть не больше 2 МБ";
            return;
        }
        uploading = true;
        error = null;
        job = null;
        try {
            job = await realtimeRequest("/import", {
                method: "POST", headers: {"Content-Type": "text/csv; charset=utf-8"}, body: file,
            });
            sessionStorage.setItem("importJob", job.id);
            await checkJob(job.id);
        } catch (err) {
            error = err.message;
        } finally {
            uploading = false;
        }
    }

    async function download() {
        exporting = true;
        error = null;
        try {
            await refreshSession();
            const response = await fetch("/realtime/export");
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error?.message ?? "Не удалось экспортировать студентов");
            }
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement("a");
            link.href = url;
            link.download = "students.csv";
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            error = err.message;
        } finally {
            exporting = false;
        }
    }

    onMount(() => {
        mounted = true;
        const id = sessionStorage.getItem("importJob");
        if (id) {
            void checkJob(id);
        }
        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    });
</script>

<h2>Импорт и экспорт студентов</h2>
<p class="section-description">CSV в кодировке UTF-8, разделитель — запятая. До 2 МБ и 2000 студентов за один импорт.</p>
<p class="section-description">Импорт добавляет новых студентов. Существующие ИСУ и повторы в файле отмечаются как конфликты; остальные строки продолжают обрабатываться.</p>
<p class="section-description">Порядок столбцов:</p>
<pre class="csv-columns">fullName,group,isuId,dormitory,room,settlementPeriod,isForeign,notes</pre>
<p class="section-description">isForeign: true или false. Необязательные поля можно оставить пустыми. Поля с запятыми, кавычками или переносами строк заключаются в двойные кавычки, кавычка внутри удваивается.</p>

<ErrorBox {error} />
<section class="transfer-section">
    <h3>Импорт</h3>
    <form onsubmit={startImport}>
        <div>
            <label for="csv-file">Файл CSV</label>
            <input id="csv-file" type="file" accept=".csv,text/csv" bind:files required disabled={uploading || running} />
        </div>
        <button type="submit" disabled={uploading || running}>Импортировать</button>
    </form>
    {#if uploading}<Loader />{/if}
    {#if job}
        <div class="import-result" aria-live="polite">
            <p>{STATUS_LABELS[job.status]}: обработано {job.processed} из {job.total}, добавлено {job.created}, ошибок {job.errors.length}.</p>
            <progress max={job.total} value={job.processed} aria-label="Прогресс импорта"></progress>
            {#if job.message}<p>{job.message}</p>{/if}
        </div>
        {#if job.errors.length}
            <div class="table-wrap">
                <table>
                    <thead><tr><th>Запись CSV</th><th>Статус</th><th>Ошибка</th></tr></thead>
                    <tbody>
                        {#each job.errors as item}
                            <tr>
                                <td>{item.row}</td><td>{item.status}</td>
                                <td>{item.message}{#each item.details as detail}<p>{detail.message}</p>{/each}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}
    {#if error}
        <button type="button" class="secondary" onclick={() => {
            const id = sessionStorage.getItem("importJob");
            if (id) {
                error = null;
                void checkJob(id);
            }
        }}>Проверить состояние импорта</button>
    {/if}
</section>
<section class="transfer-section">
    <h3>Экспорт</h3>
    <p class="section-description">Скачать весь список студентов на момент начала экспорта.</p>
    <button type="button" onclick={download} disabled={exporting}>Скачать CSV</button>
    {#if exporting}<Loader />{/if}
</section>

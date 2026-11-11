<script>
    import {ROLE_NAMES} from "#lib/domain/user.js";

    let {data} = $props();
</script>

<h2>Профиль</h2>
<section class="card p-4">
    <h3 class="h5">{data.profile.username}</h3>
    <p><strong>Email:</strong> {data.profile.email}</p>
    <p><strong>Роль:</strong> {ROLE_NAMES[data.profile.role] ?? data.profile.role}</p>
</section>

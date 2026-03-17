export function renderDashboardPage(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BuckyOS State Dashboard</title>
    <style>
        :root {
            color-scheme: light;
            --bg: #f4efe6;
            --panel: rgba(255, 252, 247, 0.92);
            --panel-strong: #fffaf2;
            --line: #dbcdb7;
            --text: #2e2419;
            --muted: #6e614f;
            --accent: #0f766e;
            --accent-soft: #d8f1ee;
            --danger: #b42318;
            --warn: #a15c07;
            --ok: #067647;
            --shadow: 0 18px 42px rgba(64, 42, 17, 0.12);
            --radius: 18px;
            --mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            --sans: "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: var(--sans);
            color: var(--text);
            background:
                radial-gradient(circle at top left, rgba(15, 118, 110, 0.18), transparent 28%),
                radial-gradient(circle at top right, rgba(161, 92, 7, 0.16), transparent 24%),
                linear-gradient(180deg, #f8f3ea 0%, var(--bg) 58%, #efe6d7 100%);
        }

        .shell {
            width: min(1380px, calc(100vw - 32px));
            margin: 24px auto 40px;
        }

        .hero,
        .panel {
            background: var(--panel);
            border: 1px solid rgba(219, 205, 183, 0.86);
            box-shadow: var(--shadow);
            border-radius: var(--radius);
            backdrop-filter: blur(10px);
        }

        .hero {
            padding: 28px;
            display: grid;
            gap: 16px;
        }

        .hero h1 {
            margin: 0;
            font-size: clamp(28px, 4vw, 42px);
            line-height: 1.05;
            letter-spacing: -0.04em;
        }

        .hero p {
            margin: 0;
            color: var(--muted);
            max-width: 72ch;
        }

        .hero-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }

        .chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            border-radius: 999px;
            background: var(--panel-strong);
            border: 1px solid var(--line);
            font-size: 13px;
        }

        .content {
            margin-top: 18px;
            display: grid;
            gap: 18px;
        }

        .panel {
            padding: 20px;
        }

        .toolbar {
            display: grid;
            gap: 14px;
        }

        .toolbar-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .tabs {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .tab {
            border: 1px solid var(--line);
            background: var(--panel-strong);
            color: var(--text);
            border-radius: 999px;
            padding: 10px 14px;
            cursor: pointer;
            font-size: 14px;
        }

        .tab.active {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
        }

        .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .button {
            border: 1px solid var(--line);
            background: var(--panel-strong);
            color: var(--text);
            border-radius: 12px;
            padding: 10px 14px;
            cursor: pointer;
        }

        .button.primary {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
        }

        .filters {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
        }

        .field {
            display: grid;
            gap: 6px;
        }

        .field label {
            font-size: 13px;
            color: var(--muted);
        }

        .field input,
        .field select {
            width: 100%;
            border-radius: 12px;
            border: 1px solid var(--line);
            background: #fffdf9;
            color: var(--text);
            padding: 10px 12px;
            font: inherit;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
        }

        .stat {
            padding: 16px;
            border-radius: 16px;
            border: 1px solid var(--line);
            background: var(--panel-strong);
        }

        .stat .label {
            color: var(--muted);
            font-size: 13px;
        }

        .stat .value {
            margin-top: 8px;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.04em;
        }

        .table-wrap {
            overflow: auto;
            border: 1px solid var(--line);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.75);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1120px;
        }

        th,
        td {
            padding: 12px 14px;
            text-align: left;
            border-bottom: 1px solid rgba(219, 205, 183, 0.8);
            vertical-align: top;
            font-size: 14px;
        }

        th {
            position: sticky;
            top: 0;
            background: #f9f4ea;
            z-index: 1;
            color: var(--muted);
            font-weight: 600;
        }

        td code {
            font-family: var(--mono);
            font-size: 12px;
            word-break: break-all;
        }

        .status {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid transparent;
        }

        .status.pending {
            color: #7a4a00;
            background: #fff0d6;
            border-color: #f3cf93;
        }

        .status.progress {
            color: #055b70;
            background: #daf3fb;
            border-color: #91d7ea;
        }

        .status.success {
            color: #067647;
            background: #ddf6e8;
            border-color: #8ed4aa;
        }

        .status.failed {
            color: #b42318;
            background: #fee4e2;
            border-color: #f7a8a1;
        }

        .empty,
        .loading,
        .error {
            padding: 28px;
            text-align: center;
            color: var(--muted);
        }

        .error {
            color: var(--danger);
        }

        @media (max-width: 980px) {
            .filters,
            .stats {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media (max-width: 640px) {
            .shell {
                width: min(100vw - 20px, 100%);
                margin: 10px auto 24px;
            }

            .hero,
            .panel {
                padding: 16px;
                border-radius: 16px;
            }

            .filters,
            .stats {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="shell">
        <section class="hero">
            <div>
                <h1>Version Dashboard</h1>
                <p>按 product 分 tab 查看版本记录，并支持按版本、平台、commit、状态和 URL 做前端过滤。当前直接展示原始 <code>url</code> 字段。</p>
            </div>
            <div class="hero-meta">
                <span class="chip">数据源: <code>GET /version/?size=0</code></span>
                <span class="chip">视图: 单页前端</span>
                <span class="chip" id="last-refresh">最近刷新: -</span>
            </div>
        </section>

        <div class="content">
            <section class="panel toolbar">
                <div class="toolbar-head">
                    <div class="tabs" id="product-tabs"></div>
                    <div class="toolbar-actions">
                        <span class="chip" id="result-count">0 条记录</span>
                        <button class="button" id="reset-filters" type="button">重置过滤</button>
                        <button class="button primary" id="refresh-data" type="button">刷新数据</button>
                    </div>
                </div>
                <div class="filters">
                    <div class="field">
                        <label for="filter-version">Version</label>
                        <input id="filter-version" placeholder="模糊匹配 version" />
                    </div>
                    <div class="field">
                        <label for="filter-os">OS</label>
                        <select id="filter-os"></select>
                    </div>
                    <div class="field">
                        <label for="filter-arch">Arch</label>
                        <select id="filter-arch"></select>
                    </div>
                    <div class="field">
                        <label for="filter-packed">Packed</label>
                        <select id="filter-packed"></select>
                    </div>
                    <div class="field">
                        <label for="filter-pack-tested">Pack Tested</label>
                        <select id="filter-pack-tested"></select>
                    </div>
                    <div class="field">
                        <label for="filter-published">Published</label>
                        <select id="filter-published"></select>
                    </div>
                </div>
            </section>

            <section class="panel">
                <div class="stats" id="stats"></div>
            </section>

            <section class="panel">
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Version</th>
                                <th>OS</th>
                                <th>Arch</th>
                                <th>Packed</th>
                                <th>Pack Tested</th>
                                <th>Published</th>
                                <th>Tested</th>
                                <th>Commit</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody id="version-table">
                            <tr><td colspan="10" class="loading">正在加载数据...</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>

    <script>
        const STATUS_OPTIONS = [
            { value: '', label: '全部状态' },
            { value: '0', label: '0 未执行' },
            { value: '2', label: '2 进行中' },
            { value: '1', label: '1 成功' },
            { value: '-1', label: '-1 失败' }
        ];

        const PUBLISH_OPTIONS = [
            { value: '', label: '全部状态' },
            { value: '0', label: '0 未发布' },
            { value: '1', label: '1 成功' },
            { value: '-1', label: '-1 失败' }
        ];

        const state = {
            allItems: [],
                activeProduct: 'all',
                filters: {
                    version: '',
                    os: '',
                    arch: '',
                    packed: '',
                    pack_tested: '',
                    published: ''
            }
        };

        const nodes = {
            tabs: document.getElementById('product-tabs'),
            table: document.getElementById('version-table'),
            stats: document.getElementById('stats'),
            count: document.getElementById('result-count'),
            refresh: document.getElementById('refresh-data'),
            reset: document.getElementById('reset-filters'),
            refreshedAt: document.getElementById('last-refresh'),
            version: document.getElementById('filter-version'),
            os: document.getElementById('filter-os'),
            arch: document.getElementById('filter-arch'),
            packed: document.getElementById('filter-packed'),
            pack_tested: document.getElementById('filter-pack-tested'),
            published: document.getElementById('filter-published')
        };

        function escapeHtml(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function statusMeta(field, value) {
            const num = Number(value);
            if (num === 1) {
                return { label: field === 'published' ? '已发布' : '成功', cls: 'success' };
            }
            if (num === -1) {
                return { label: '失败', cls: 'failed' };
            }
            if (num === 2) {
                return { label: '进行中', cls: 'progress' };
            }
            return {
                label: field === 'published' ? '未发布' : '未执行',
                cls: 'pending'
            };
        }

        function populateSelect(node, options) {
            node.innerHTML = options.map((item) => '<option value="' + item.value + '">' + item.label + '</option>').join('');
        }

        function deriveProducts(items) {
            return Array.from(new Set(items.map((item) => item.product).filter(Boolean))).sort();
        }

        function deriveOptions(items, field, allLabel) {
            return [{ value: '', label: allLabel }].concat(
                Array.from(new Set(items.map((item) => item[field]).filter(Boolean)))
                    .sort()
                    .map((value) => ({ value: String(value), label: String(value) }))
            );
        }

        function renderTabs(products) {
            const tabs = [{ key: 'all', label: '全部 Product' }].concat(products.map((product) => ({ key: product, label: product })));
            nodes.tabs.innerHTML = tabs.map((tab) => {
                const active = state.activeProduct === tab.key ? ' active' : '';
                return '<button class="tab' + active + '" type="button" data-product="' + escapeHtml(tab.key) + '">' + escapeHtml(tab.label) + '</button>';
            }).join('');
        }

        function applyFilters() {
            const versionNeedle = state.filters.version.trim().toLowerCase();

            return state.allItems.filter((item) => {
                if (state.activeProduct !== 'all' && item.product !== state.activeProduct) {
                    return false;
                }
                if (versionNeedle && !String(item.version || '').toLowerCase().includes(versionNeedle)) {
                    return false;
                }
                if (state.filters.os !== '' && String(item.os) !== state.filters.os) {
                    return false;
                }
                if (state.filters.arch !== '' && String(item.arch) !== state.filters.arch) {
                    return false;
                }
                if (state.filters.packed !== '' && String(item.packed) !== state.filters.packed) {
                    return false;
                }
                if (state.filters.pack_tested !== '' && String(item.pack_tested) !== state.filters.pack_tested) {
                    return false;
                }
                if (state.filters.published !== '' && String(item.published) !== state.filters.published) {
                    return false;
                }
                return true;
            });
        }

        function renderStats(items) {
            const waitingPack = items.filter((item) => Number(item.packed) === 0).length;
            const waitingTest = items.filter((item) => Number(item.pack_tested) === 0).length;
            const publishingDone = items.filter((item) => Number(item.published) === 1).length;
            const failed = items.filter((item) => Number(item.packed) === -1 || Number(item.pack_tested) === -1 || Number(item.published) === -1).length;
            const stats = [
                { label: '当前结果数', value: items.length },
                { label: '未打包', value: waitingPack },
                { label: '未测试', value: waitingTest },
                { label: '已发布 / 有失败', value: publishingDone + ' / ' + failed }
            ];
            nodes.stats.innerHTML = stats.map((item) => '<div class="stat"><div class="label">' + item.label + '</div><div class="value">' + item.value + '</div></div>').join('');
        }

        function formatUrl(url) {
            const text = escapeHtml(url);
            const raw = String(url || '').toLowerCase();
            if (raw.startsWith('http://') || raw.startsWith('https://')) {
                return '<a href="' + text + '" target="_blank" rel="noreferrer noopener"><code>' + text + '</code></a>';
            }
            return '<code>' + text + '</code>';
        }

        function renderTable(items) {
            nodes.count.textContent = items.length + ' 条记录';
            renderStats(items);

            if (!items.length) {
                nodes.table.innerHTML = '<tr><td colspan="10" class="empty">没有匹配当前过滤条件的记录</td></tr>';
                return;
            }

            nodes.table.innerHTML = items.map((item) => {
                const packed = statusMeta('packed', item.packed);
                const packTested = statusMeta('pack_tested', item.pack_tested);
                const published = statusMeta('published', item.published);
                const tested = statusMeta('tested', item.tested);
                return '<tr>' +
                    '<td>' + escapeHtml(item.product) + '</td>' +
                    '<td><code>' + escapeHtml(item.version) + '</code></td>' +
                    '<td>' + escapeHtml(item.os) + '</td>' +
                    '<td>' + escapeHtml(item.arch) + '</td>' +
                    '<td><span class="status ' + packed.cls + '">' + packed.label + ' (' + escapeHtml(item.packed) + ')</span></td>' +
                    '<td><span class="status ' + packTested.cls + '">' + packTested.label + ' (' + escapeHtml(item.pack_tested) + ')</span></td>' +
                    '<td><span class="status ' + published.cls + '">' + published.label + ' (' + escapeHtml(item.published) + ')</span></td>' +
                    '<td><span class="status ' + tested.cls + '">' + tested.label + ' (' + escapeHtml(item.tested) + ')</span></td>' +
                    '<td><code>' + escapeHtml(item.commit_sha) + '</code></td>' +
                    '<td>' + formatUrl(item.url) + '</td>' +
                '</tr>';
            }).join('');
        }

        function syncFiltersToState() {
            state.filters.version = nodes.version.value;
            state.filters.os = nodes.os.value;
            state.filters.arch = nodes.arch.value;
            state.filters.packed = nodes.packed.value;
            state.filters.pack_tested = nodes.pack_tested.value;
            state.filters.published = nodes.published.value;
        }

        function refreshView() {
            syncFiltersToState();
            const filtered = applyFilters();
            renderTable(filtered);
            renderTabs(deriveProducts(state.allItems));
        }

        function setLoading(message) {
            nodes.table.innerHTML = '<tr><td colspan="10" class="loading">' + escapeHtml(message) + '</td></tr>';
        }

        function setError(message) {
            nodes.table.innerHTML = '<tr><td colspan="10" class="error">' + escapeHtml(message) + '</td></tr>';
        }

        async function loadData() {
            setLoading('正在加载数据...');
            try {
                const response = await fetch('/version/?size=0');
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                const payload = await response.json();
                state.allItems = Array.isArray(payload.items) ? payload.items : [];
                const products = deriveProducts(state.allItems);
                populateSelect(nodes.os, deriveOptions(state.allItems, 'os', '全部 OS'));
                populateSelect(nodes.arch, deriveOptions(state.allItems, 'arch', '全部 Arch'));
                nodes.os.value = state.filters.os;
                nodes.arch.value = state.filters.arch;
                if (state.activeProduct !== 'all' && !products.includes(state.activeProduct)) {
                    state.activeProduct = 'all';
                }
                nodes.refreshedAt.textContent = '最近刷新: ' + new Date().toLocaleString();
                refreshView();
            } catch (error) {
                setError('加载失败: ' + (error && error.message ? error.message : String(error)));
            }
        }

        function resetFilters() {
            state.filters = {
                version: '',
                os: '',
                arch: '',
                packed: '',
                pack_tested: '',
                published: ''
            };
            nodes.version.value = '';
            nodes.os.value = '';
            nodes.arch.value = '';
            nodes.packed.value = '';
            nodes.pack_tested.value = '';
            nodes.published.value = '';
            refreshView();
        }

        populateSelect(nodes.os, [{ value: '', label: '全部 OS' }]);
        populateSelect(nodes.arch, [{ value: '', label: '全部 Arch' }]);
        populateSelect(nodes.packed, STATUS_OPTIONS);
        populateSelect(nodes.pack_tested, STATUS_OPTIONS);
        populateSelect(nodes.published, PUBLISH_OPTIONS);

        [nodes.version, nodes.os, nodes.arch, nodes.packed, nodes.pack_tested, nodes.published].forEach((node) => {
            node.addEventListener('input', refreshView);
            node.addEventListener('change', refreshView);
        });

        nodes.tabs.addEventListener('click', (event) => {
            const target = event.target.closest('[data-product]');
            if (!target) {
                return;
            }
            state.activeProduct = target.getAttribute('data-product') || 'all';
            refreshView();
        });

        nodes.refresh.addEventListener('click', loadData);
        nodes.reset.addEventListener('click', resetFilters);

        loadData();
    </script>
</body>
</html>`;
}

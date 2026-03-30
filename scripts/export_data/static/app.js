/**
 * app.js - CER-Agent Excel Viewer
 */

let tabulatorTable = null;
let currentWorkbook = null;

const EL = {
    refreshBtn:      document.getElementById('refreshDataBtn'),
    fileList:        document.getElementById('fileListContainer'),
    fileTitle:       document.getElementById('currentFileTitle'),
    sheetTabsWrapper:document.getElementById('sheetTabsWrapper'),
    sheetTabs:       document.getElementById('sheetTabsContainer'),
    loading:         document.getElementById('loadingOverlay'),
    modal:           document.getElementById('jsonModal'),
    modalTitle:      document.getElementById('jsonModalTitle'),
    modalBody:       document.getElementById('jsonModalBody'),
    modalBackdrop:   document.getElementById('modalBackdrop'),
    closeModal:      document.getElementById('closeModalBtn'),
    closeModalFooter:document.getElementById('closeModalBtnFooter'),
    themeToggle:     document.getElementById('themeToggleBtn'),
    iconSun:         document.getElementById('iconSun'),
    iconMoon:        document.getElementById('iconMoon'),
};

// ─── Theme Toggle ────────────────────────────────────
function getTheme() {
    return localStorage.getItem('cer-theme') || 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cer-theme', theme);
    // sun icon visible in dark mode (click to go light), moon icon in light mode (click to go dark)
    EL.iconSun.classList.toggle('hidden', theme !== 'dark');
    EL.iconMoon.classList.toggle('hidden', theme !== 'light');
}

applyTheme(getTheme());

EL.themeToggle.addEventListener('click', () => {
    applyTheme(getTheme() === 'light' ? 'dark' : 'light');
});

// ─── Loading ─────────────────────────────────────────
function showLoading() { EL.loading.classList.remove('opacity-0', 'pointer-events-none'); }
function hideLoading() { EL.loading.classList.add('opacity-0', 'pointer-events-none'); }

// ─── URL Query Param ↔ Header Filter Sync ────────────
function getFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    const filters = {};
    for (const [key, value] of params.entries()) {
        if (key !== 'file' && key !== 'sheet') filters[key] = value;
    }
    return filters;
}

let _suppressFilterSync = false;

function syncFiltersToURL() {
    if (!tabulatorTable || _suppressFilterSync) return;
    const params = new URLSearchParams(window.location.search);
    // Clear old filter params (keep non-filter params like file/sheet if we ever add those)
    const activeFilters = tabulatorTable.getHeaderFilters();
    const activeFields = new Set(activeFilters.map(f => f.field));

    // Remove all filter-related params first
    for (const key of [...params.keys()]) {
        if (key !== 'file' && key !== 'sheet') params.delete(key);
    }
    // Add current active filters
    activeFilters.forEach(f => {
        if (f.value) params.set(f.field, f.value);
    });

    const qs = params.toString();
    const newURL = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', newURL);
}

function applyFiltersFromURL() {
    if (!tabulatorTable) return;
    const filters = getFiltersFromURL();
    const cols = tabulatorTable.getColumns().map(c => c.getField());
    for (const [field, value] of Object.entries(filters)) {
        if (cols.includes(field)) {
            tabulatorTable.setHeaderFilterValue(field, value);
        }
    }
}

// ─── JSON Syntax Highlight ───────────────────────────
function syntaxHighlight(obj) {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(
        /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? 'json-key' : 'json-string';
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
        }
    );
}

// ─── Modal ───────────────────────────────────────────
function openModal(title, jsonObj) {
    const titleSpan = EL.modalTitle.querySelector('span');
    if (titleSpan) titleSpan.textContent = title;
    EL.modalBody.innerHTML = `<pre>${syntaxHighlight(jsonObj)}</pre>`;
    requestAnimationFrame(() => EL.modal.classList.remove('opacity-0', 'pointer-events-none'));
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    EL.modal.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('overflow-hidden');
}

function openTextModal(fieldName, text) {
    const titleSpan = EL.modalTitle.querySelector('span');
    if (titleSpan) titleSpan.textContent = fieldName;
    EL.modalBody.innerHTML = '';
    const pre = document.createElement('pre');
    pre.style.cssText = 'margin:0; white-space:pre-wrap; word-break:break-all; font-size:13px; line-height:1.6; color:#e2e8f0; user-select:text; cursor:text;';
    pre.textContent = text;
    EL.modalBody.appendChild(pre);
    requestAnimationFrame(() => EL.modal.classList.remove('opacity-0', 'pointer-events-none'));
    document.body.classList.add('overflow-hidden');
}

[EL.closeModal, EL.closeModalFooter, EL.modalBackdrop].forEach(el =>
    el.addEventListener('click', closeModal)
);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ─── File List ───────────────────────────────────────
let cachedFiles = [];

EL.fileSearch = document.getElementById('fileSearchInput');
EL.refreshBtn.addEventListener('click', fetchFileList);
EL.fileSearch.addEventListener('input', () => {
    const q = EL.fileSearch.value.trim().toLowerCase();
    if (!q) {
        renderFileList(cachedFiles);
        return;
    }
    const filtered = cachedFiles.filter(f =>
        f.name.toLowerCase().includes(q) ||
        String(f.user_id).includes(q) ||
        f.user_class.toLowerCase().includes(q)
    );
    renderFileList(filtered);
});

async function fetchFileList() {
    EL.fileList.innerHTML = '<div class="p-6 text-center text-sm" style="color:var(--text-muted);">載入中...</div>';
    try {
        const res = await fetch('/api/files');
        const data = await res.json();
        cachedFiles = data.files;
        EL.fileSearch.value = '';
        renderFileList(cachedFiles);
    } catch (err) {
        EL.fileList.innerHTML = `<div class="p-6 text-center text-sm" style="color:#ef4444;">載入失敗<br/>${err.message}</div>`;
    }
}

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

function renderFileList(files) {
    EL.fileList.innerHTML = '';

    if (!files.length) {
        EL.fileList.innerHTML = '<div class="p-6 text-center text-sm" style="color:var(--text-muted);">找不到任何 Excel 檔案</div>';
        return;
    }

    const groups = {};
    files.forEach(f => {
        const key = f.user_class || '未分類';
        if (!groups[key]) groups[key] = [];
        groups[key].push(f);
    });

    for (const [cls, list] of Object.entries(groups)) {
        const header = document.createElement('div');
        header.className = 'px-4 py-1.5 mt-1 text-[11px] font-bold uppercase tracking-widest';
        header.style.color = 'rgb(255, 255, 255)';
        header.style.background = 'rgba(0, 0, 0)';
        header.textContent = cls;
        EL.fileList.appendChild(header);

        list.forEach(file => {
            const card = document.createElement('div');
            card.className = 'file-card mx-2 my-0.5 px-3 py-2 rounded-lg cursor-pointer transition-colors';
            card.style.cssText = 'border:1px solid transparent;';

            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('active')) card.style.background = 'var(--bg-card-hover)';
            });
            card.addEventListener('mouseleave', () => {
                if (!card.classList.contains('active')) card.style.background = '';
            });

            const row = document.createElement('div');
            row.className = 'flex items-center justify-between gap-2';

            const idBadge = document.createElement('span');
            idBadge.className = 'shrink-0 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded';
            if (cls === 'class_P') {
                idBadge.style.cssText = 'background:rgba(34,197,94,0.12); color:#16a34a;';
            } else if (cls === 'class_I') {
                idBadge.style.cssText = 'background:var(--card-badge-bg); color:var(--card-badge-fg);';
            } else {
                idBadge.style.cssText = 'background:rgba(255, 3, 3, 0.21); color:#ce0000;';
            }
            idBadge.textContent = file.user_id;

            const name = document.createElement('span');
            name.className = 'flex-1 text-[13px] truncate';
            name.style.color = 'var(--card-name-fg)';
            name.title = file.name;
            name.textContent = file.name;

            row.appendChild(idBadge);
            row.appendChild(name);
            card.appendChild(row);

            card.onclick = () => {
                document.querySelectorAll('.file-card').forEach(el => {
                    el.classList.remove('active');
                    el.style.background = '';
                    el.style.borderColor = 'transparent';
                });
                card.classList.add('active');
                card.style.background = 'var(--card-active-bg)';
                card.style.borderColor = 'var(--border-active)';
                loadExcelFile(file);
            };

            EL.fileList.appendChild(card);
        });
    }
}

// ─── Load Excel ──────────────────────────────────────
async function loadExcelFile(fileObj) {
    showLoading();
    EL.fileTitle.textContent = fileObj.name;
    EL.sheetTabs.innerHTML = '';
    if (tabulatorTable) { tabulatorTable.destroy(); tabulatorTable = null; }

    try {
        const res = await fetch('/api/data/' + fileObj.path);
        const buf = await res.arrayBuffer();
        currentWorkbook = XLSX.read(buf, { type: 'array' });

        currentWorkbook.SheetNames.forEach((name, i) => {
            const btn = document.createElement('button');
            btn.className = 'sheet-tab shrink-0 px-3 py-1 text-[12px] font-medium rounded-md transition-colors';

            function setActive(b, active) {
                if (active) {
                    b.style.cssText = `background:var(--sheet-active-bg); color:var(--sheet-active-fg); border:1px solid var(--sheet-active-bdr);`;
                } else {
                    b.style.cssText = `background:var(--sheet-bg); color:var(--sheet-fg); border:1px solid var(--sheet-border);`;
                }
            }

            setActive(btn, i === 0);
            btn.textContent = name;

            btn.onclick = () => {
                document.querySelectorAll('.sheet-tab').forEach(t => setActive(t, false));
                setActive(btn, true);
                renderSheet(name);
            };
            EL.sheetTabs.appendChild(btn);
        });

        EL.sheetTabsWrapper.style.display = '';
        if (currentWorkbook.SheetNames.length > 0) renderSheet(currentWorkbook.SheetNames[0]);
    } catch (e) {
        alert('讀取檔案失敗：' + e.message);
    } finally {
        hideLoading();
    }
}

// ─── Render Sheet ────────────────────────────────────
const JSON_FIELDS = new Set(['metadata', 'input', 'output', 'query', 'final_response']);
const COLUMN_ORDER = ['id', 'action_type', 'metadata', 'map_id', 'essay_id', 'query', 'final_response', 'input', 'output', 'timestamp'];

// 與 Excel export_excel.py 的顏色規則相同
const ACTION_TYPE_CELL_COLORS = {
    'ai_feedback_shown':      '#AAAAFF',
    'add_node':               '#D1E4FF',
    'delete_node':            '#D1E4FF',
    'node_edit_start':        '#D1E4FF',
    'node_edit_end':          '#D1E4FF',
    'add_edge':               '#D1E4FF',
    'delete_edge':            '#D1E4FF',
    'click_feedback_ask':     '#FFC1E0',
    'chat_in_mindmap':        '#FFC1E0',
    'chat_in_essay':          '#FFC1E0',
    'click_add_new_button':   '#FFF2CC',
    'switch_map':             '#FFF2CC',
    'login':                  '#FFF2CC',
    'create_map':             '#FFF2CC',
    'rename_map':             '#FFF2CC',
    'essay_edit_start':       '#D9EAD3',
    'essay_edit_end':         '#D9EAD3',
    'click_scoring_mindmap':  '#FF8F59',
    'click_scoring_essay':    '#FF8F59',
    'paste_detected':         '#CE0000',
};
const PAGE_VIEW_END_CELL_COLORS = {
    'article': '#FFF2CC',
    'mindmap': '#D1E4FF',
    'essay':   '#D9EAD3',
};

function renderSheet(sheetName) {
    const sheet = currentWorkbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (!data || !data.length) {
        if (tabulatorTable) { tabulatorTable.destroy(); tabulatorTable = null; }
        document.getElementById('data-table').innerHTML =
            '<div class="flex items-center justify-center h-full text-sm" style="color:var(--text-muted);">此工作表無資料</div>';
        return;
    }

    const keys = new Set();
    data.forEach(row => Object.keys(row).forEach(k => keys.add(k)));

    // 依 COLUMN_ORDER 排序：已知欄位照順序，其餘欄位附加在後
    const orderedKeys = [
        ...COLUMN_ORDER.filter(k => keys.has(k)),
        ...Array.from(keys).filter(k => !COLUMN_ORDER.includes(k))
    ];

    const columns = orderedKeys.map(key => {
        const col = {
            title: key,
            field: key,
            headerFilter: 'input',
            headerSortTristate: true,
        };

        const lk = key.toLowerCase();
        if (lk === 'id') {
            col.frozen = true;
            col.minWidth = 60;
            col.hozAlign = 'center';
            col.headerHozAlign = 'center';
            col.widthGrow = 0;
        } else if (lk === 'query' || lk === 'final_response') {
            col.formatter = jsonCellFormatter;
            col.width = 350;
            col.widthGrow = 1;
        } else if (lk === 'metadata') {
            col.formatter = jsonCellFormatter;
            col.width = 350;
            col.widthGrow = 1;
        } else if (JSON_FIELDS.has(lk)) {
            col.formatter = jsonCellFormatter;
            col.width = 160;
            col.widthGrow = 0;
        } else if (lk === 'action_type') {
            col.minWidth = 140;
            col.widthGrow = 1;
        } else if (lk === 'map_id' || lk === 'essay_id') {
            col.minWidth = 60;
            col.hozAlign = 'center';
            col.headerHozAlign = 'center';
            col.widthGrow = 0;
        }
        else if (lk === 'timestamp') {
            col.minWidth = 160;
            col.widthGrow = 1;
        } else {
            col.minWidth = 100;
            col.widthGrow = 1;
        }

        return col;
    });

    if (tabulatorTable) tabulatorTable.destroy();
    document.getElementById('data-table').innerHTML = '';

    const savedFilters = getFiltersFromURL();
    const colFields = columns.map(c => c.field);

    tabulatorTable = new Tabulator('#data-table', {
        data,
        columns,
        layout: 'fitDataFill',
        height: '100%',
        pagination: 'local',
        paginationSize: 50,
        paginationSizeSelector: [20, 50, 100, 500],
        movableColumns: true,
        placeholder: '<div style="color:var(--text-muted); padding:2rem;">無資料</div>',
        rowFormatter: function(row) {
            const data = row.getData();
            const actionType = (data['action_type'] || '').trim();

            // 根據 action_type 對 action_type 欄位套色
            const atColor = ACTION_TYPE_CELL_COLORS[actionType];
            if (atColor) {
                const cell = row.getCell('action_type');
                if (cell) cell.getElement().style.backgroundColor = atColor;
            }

            // page_view_end 時對 metadata 欄位套色
            if (actionType === 'page_view_end') {
                let view = '';
                const meta = data['metadata'];
                if (typeof meta === 'string') {
                    try { view = JSON.parse(meta).view || ''; } catch (_) {}
                } else if (meta && typeof meta === 'object') {
                    view = meta.view || '';
                }
                const metaColor = PAGE_VIEW_END_CELL_COLORS[view];
                if (metaColor) {
                    const cell = row.getCell('metadata');
                    if (cell) cell.getElement().style.backgroundColor = metaColor;
                }
            }
        },
    });

    tabulatorTable.on('cellDblClick', function(_e, cell) {
        const value = cell.getValue();
        if (value === null || value === undefined || value === '') return;

        const field = cell.getField();
        let parsed = null;

        if (typeof value === 'object') {
            parsed = value;
        } else if (typeof value === 'string') {
            const t = value.trim();
            if ((t[0] === '{' && t[t.length - 1] === '}') || (t[0] === '[' && t[t.length - 1] === ']')) {
                try { parsed = JSON.parse(t); } catch (_) { /* not json */ }
            }
        }

        if (parsed) {
            openModal(field, parsed);
        } else {
            openTextModal(field, String(value));
        }
    });

    tabulatorTable.on('tableBuilt', () => {
        for (const [field, value] of Object.entries(savedFilters)) {
            if (colFields.includes(field)) {
                tabulatorTable.setHeaderFilterValue(field, value);
            }
        }

        setTimeout(() => {
            tabulatorTable.on('dataFiltered', syncFiltersToURL);
        }, 300);
    });
}

// ─── JSON Cell Formatter ─────────────────────────────
function jsonCellFormatter(cell) {
    const value = cell.getValue();
    if (value === null || value === undefined || value === '') {
        const s = document.createElement('span');
        s.style.cssText = 'color:var(--text-muted); font-style:italic; font-size:12px;';
        s.textContent = '—';
        return s;
    }

    let parsed = null;
    if (typeof value === 'object') {
        parsed = value;
    } else if (typeof value === 'string') {
        const t = value.trim();
        if ((t[0] === '{' && t[t.length - 1] === '}') || (t[0] === '[' && t[t.length - 1] === ']')) {
            try { parsed = JSON.parse(t); } catch (_) { /* not json */ }
        }
    }

    if (parsed !== null) {
        const container = document.createElement('div');
        container.className = 'flex items-center gap-2 w-full';

        const btn = document.createElement('button');
        btn.style.cssText = 'background:var(--json-btn-bg); color:var(--json-btn-fg); font-size:11px; padding:2px 8px; border-radius:4px; font-weight:500; white-space:nowrap; transition:all .15s;';
        btn.textContent = 'JSON';
        btn.onmouseenter = () => { btn.style.background = '#6366f1'; btn.style.color = '#fff'; };
        btn.onmouseleave = () => { btn.style.background = 'var(--json-btn-bg)'; btn.style.color = 'var(--json-btn-fg)'; };
        btn.onclick = (e) => {
            e.stopPropagation();
            openModal(cell.getField(), parsed);
        };

        const preview = document.createElement('span');
        preview.className = 'truncate';
        preview.style.cssText = 'font-size:11px; font-family:monospace; color:var(--json-preview-fg);';
        preview.textContent = JSON.stringify(parsed).substring(0, 60);

        container.appendChild(btn);
        container.appendChild(preview);
        return container;
    }

    const span = document.createElement('span');
    span.className = 'truncate block';
    span.style.cssText = 'font-size:12px; color:var(--text-secondary);';
    span.textContent = String(value);
    return span;
}

// ─── Boot ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', fetchFileList);

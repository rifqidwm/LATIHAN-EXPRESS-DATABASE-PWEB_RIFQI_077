const API_URL = '/api/expenses';

const CATEGORIES = {
  makan: {
    label: 'Makan',
    icon: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  },
  transport: {
    label: 'Transport',
    icon: '<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',
  },
  kos: {
    label: 'Kos',
    icon: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  },
  belanja: {
    label: 'Belanja',
    icon: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  },
  hiburan: {
    label: 'Hiburan',
    icon: '<line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/>',
  },
  lainnya: {
    label: 'Lainnya',
    icon: '<circle cx="12" cy="12" r="10"/><path d="M17 12h.01"/><path d="M12 12h.01"/><path d="M7 12h.01"/>',
  },
};

const ALL_ICON = '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>';
const EDIT_ICON = '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>';
const TRASH_ICON = '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const tanggalFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const el = {
  status: document.getElementById('apiStatus'),
  total: document.getElementById('totalValue'),
  count: document.getElementById('countValue'),
  top: document.getElementById('topValue'),
  chips: document.getElementById('chips'),
  list: document.getElementById('list'),
  filterInfo: document.getElementById('filterInfo'),
  addForm: document.getElementById('addForm'),
  editDialog: document.getElementById('editDialog'),
  editForm: document.getElementById('editForm'),
  deleteDialog: document.getElementById('deleteDialog'),
  deleteDesc: document.getElementById('deleteDesc'),
  toast: document.getElementById('toast'),
};

let activeFilter = '';
let pendingDeleteId = null;

function svg(paths) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
}

function todayISO() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function setStatus(state) {
  el.status.dataset.state = state;
  el.status.querySelector('.status__text').textContent =
    state === 'online' ? 'API terhubung' : state === 'offline' ? 'API terputus' : 'Menghubungkan';
}

let toastTimer;
function showToast(message, type = 'success') {
  el.toast.textContent = message;
  el.toast.dataset.type = type;
  el.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('is-visible'), 2800);
}

function formToPayload(form) {
  const data = new FormData(form);
  return {
    kategori: data.get('kategori'),
    nominal: Number(data.get('nominal')),
    tanggal: data.get('tanggal'),
    catatan: String(data.get('catatan') ?? '').trim(),
  };
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json();
  if (!res.ok) {
    const detail = body.errors ? `: ${body.errors.join(', ')}` : '';
    throw new Error(`${body.message}${detail}`);
  }
  return body;
}

function fillCategorySelects() {
  const options = Object.entries(CATEGORIES)
    .map(([value, { label }]) => `<option value="${value}">${label}</option>`)
    .join('');
  document.querySelectorAll('select[name="kategori"]').forEach((select) => {
    select.innerHTML = options;
  });
}

function renderSummary(all) {
  const total = all.reduce((sum, item) => sum + item.nominal, 0);
  el.total.textContent = rupiah.format(total);
  el.count.textContent = all.length;

  const perKategori = {};
  all.forEach((item) => {
    perKategori[item.kategori] = (perKategori[item.kategori] ?? 0) + item.nominal;
  });

  const top = Object.entries(perKategori).sort((a, b) => b[1] - a[1])[0];
  el.top.textContent = top ? CATEGORIES[top[0]].label : '-';

  renderChips(total, perKategori);
}

function renderChips(total, perKategori) {
  const chips = [{ value: '', label: 'Semua', icon: ALL_ICON, amount: total }].concat(
    Object.entries(CATEGORIES).map(([value, { label, icon }]) => ({
      value, label, icon, amount: perKategori[value] ?? 0,
    })),
  );

  el.chips.innerHTML = '';
  chips.forEach((chip) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.setAttribute('aria-pressed', String(chip.value === activeFilter));
    button.innerHTML = `
      <span class="chip__icon">${svg(chip.icon)}</span>
      <span class="chip__label"></span>
      <span class="chip__total"></span>`;
    button.querySelector('.chip__label').textContent = chip.label;
    button.querySelector('.chip__total').textContent = rupiah.format(chip.amount);
    button.addEventListener('click', () => {
      activeFilter = chip.value;
      el.chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      loadList();
    });
    el.chips.appendChild(button);
  });
}

function renderList(items) {
  el.filterInfo.textContent = activeFilter ? CATEGORIES[activeFilter].label : 'Semua kategori';
  el.list.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = activeFilter
      ? 'Belum ada catatan di kategori ini. Tambahkan lewat form Catat pengeluaran.'
      : 'Belum ada catatan. Mulai dengan mengisi form Catat pengeluaran.';
    el.list.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const kategori = CATEGORIES[item.kategori];
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <span class="item__icon">${svg(kategori.icon)}</span>
      <div class="item__body">
        <p class="item__title"></p>
        <p class="item__meta"></p>
      </div>
      <span class="item__amount"></span>
      <div class="item__actions">
        <button type="button" class="icon-btn icon-btn--edit" aria-label="Ubah">${svg(EDIT_ICON)}</button>
        <button type="button" class="icon-btn icon-btn--delete" aria-label="Hapus">${svg(TRASH_ICON)}</button>
      </div>`;

    li.querySelector('.item__title').textContent = item.catatan || kategori.label;
    li.querySelector('.item__meta').textContent = `${kategori.label}, ${tanggalFormat.format(new Date(item.tanggal))}`;
    li.querySelector('.item__amount').textContent = `-${rupiah.format(item.nominal)}`;
    li.querySelector('.icon-btn--edit').addEventListener('click', () => openEdit(item));
    li.querySelector('.icon-btn--delete').addEventListener('click', () => openDelete(item));

    el.list.appendChild(li);
  });
}

async function loadSummary() {
  const { data } = await request(API_URL);
  renderSummary(data);
}

async function loadList() {
  try {
    const url = activeFilter ? `${API_URL}?kategori=${encodeURIComponent(activeFilter)}` : API_URL;
    const { data } = await request(url);
    renderList(data);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function refresh() {
  try {
    await Promise.all([loadSummary(), loadList()]);
    setStatus('online');
  } catch {
    setStatus('offline');
    el.list.innerHTML = '<li class="empty">Server belum berjalan. Jalankan npm run dev, lalu muat ulang halaman ini.</li>';
  }
}

el.addForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submit = el.addForm.querySelector('button[type="submit"]');
  submit.disabled = true;

  try {
    const { message } = await request(API_URL, {
      method: 'POST',
      body: JSON.stringify(formToPayload(el.addForm)),
    });
    showToast(message);
    el.addForm.reset();
    el.addForm.tanggal.value = todayISO();
    await refresh();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submit.disabled = false;
  }
});

function openEdit(item) {
  const form = el.editForm;
  form.expenseId.value = item.id;
  form.kategori.value = item.kategori;
  form.nominal.value = item.nominal;
  form.tanggal.value = item.tanggal;
  form.catatan.value = item.catatan;
  el.editDialog.showModal();
}

el.editDialog.querySelector('[data-close]').addEventListener('click', () => el.editDialog.close());

el.editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = el.editForm.expenseId.value;

  try {
    const { message } = await request(`${API_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formToPayload(el.editForm)),
    });
    el.editDialog.close();
    showToast(message);
    await refresh();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

function openDelete(item) {
  pendingDeleteId = item.id;
  const nama = item.catatan || CATEGORIES[item.kategori].label;
  el.deleteDesc.textContent = `"${nama}" sebesar ${rupiah.format(item.nominal)} akan dihapus dari catatan.`;
  el.deleteDialog.showModal();
}

el.deleteDialog.addEventListener('close', async () => {
  const choice = el.deleteDialog.returnValue;
  el.deleteDialog.returnValue = '';
  if (choice !== 'delete' || pendingDeleteId === null) return;

  try {
    const { message } = await request(`${API_URL}/${pendingDeleteId}`, { method: 'DELETE' });
    showToast(message);
    await refresh();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    pendingDeleteId = null;
  }
});

fillCategorySelects();
el.addForm.tanggal.value = todayISO();
refresh();

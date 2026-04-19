const API = 'https://biblioteca-api-production-3058.up.railway.app';

// ==================== AUTH ====================
function getToken() {
    return localStorage.getItem('token');
}

function headers() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

function verificarLogin() {
    const token = getToken();
    if (token) {
        document.getElementById('nav-login').style.display = 'none';
        document.getElementById('nav-logout').style.display = 'block';
        mostrarSeccion('dashboard');
    } else {
        document.getElementById('nav-login').style.display = 'block';
        document.getElementById('nav-logout').style.display = 'none';
        abrirModalLogin();
    }
}

function abrirModalLogin() {
    document.getElementById('login-usuario').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').classList.add('d-none');
    new bootstrap.Modal(document.getElementById('modalLogin')).show();
}

async function hacerLogin() {
    const usuario = document.getElementById('login-usuario').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
    });

    if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
        verificarLogin();
    } else {
        errorDiv.textContent = 'Usuario o contraseña incorrectos';
        errorDiv.classList.remove('d-none');
    }
}

function cerrarSesion() {
    localStorage.removeItem('token');
    verificarLogin();
}

// ==================== BADGES CATEGORIAS ====================
function getBadgeCategoria(categoria) {
    const mapa = {
        'Administracion y Negocios': 'cat-administracion',
        'Ciencia':                   'cat-ciencia',
        'Cocina':                    'cat-cocina',
        'Economia':                  'cat-economia',
        'Fantasia Epica':            'cat-fantasia',
        'Filosofia':                 'cat-filosofia',
        'Genealogia':                'cat-genealogia',
        'Historia':                  'cat-historia',
        'Ingenieria Informatica':    'cat-ingenieria',
        'LGTBIQ':                    'cat-lgtbiq',
        'Literatura Clasica':        'cat-lit-clasica',
        'Literatura Costarricense':  'cat-lit-costarricense',
        'Literatura Español':        'cat-lit-espanol',
        'Literatura Ingles':         'cat-lit-ingles',
        'Literatura Latinoamericana':'cat-lit-latinoam',
        'Relaciones Internacionales':'cat-rel-internac',
        'Salud':                     'cat-salud',
        'Novela Romantica y Erotica':'cat-novela-rom',
        'Ciencia Ficcion':           'cat-ciencia-fic',
        'Litaratura Frances':        'cat-lit-frances'
    };
    const clase = mapa[categoria] || 'cat-historia';
    return `<span class="badge-categoria ${clase}">${categoria}</span>`;
}

// ==================== NAVEGACION ====================
function mostrarSeccion(seccion) {
    document.getElementById('seccion-dashboard').style.display = 'none';
    document.getElementById('seccion-libros').style.display = 'none';
    document.getElementById('seccion-usuarios').style.display = 'none';
    document.getElementById('seccion-prestamos').style.display = 'none';
    document.getElementById('seccion-' + seccion).style.display = 'block';

    if (seccion === 'dashboard') cargarEstadisticas();
    if (seccion === 'libros') cargarLibros();
    if (seccion === 'usuarios') cargarUsuarios();
    if (seccion === 'prestamos') cargarPrestamos();
}

// ==================== DASHBOARD ====================
async function cargarEstadisticas() {
    try {
        const res = await fetch(`${API}/estadisticas`, { headers: headers() });
        const data = await res.json();
        document.getElementById('stat-total-libros').textContent = data.total_libros;
        document.getElementById('stat-total-usuarios').textContent = data.total_usuarios;
        document.getElementById('stat-prestamos-activos').textContent = data.prestamos_activos;
        document.getElementById('stat-prestamos-total').textContent = data.prestamos_total;
    } catch (err) {
        console.error('Error cargando estadísticas:', err);
    }
}

// ==================== LIBROS ====================
async function cargarLibros() {
    const res = await fetch(`${API}/libros`);
    const libros = await res.json();
    const tbody = document.getElementById('tabla-libros');
    tbody.innerHTML = '';
    libros.forEach(l => {
        tbody.innerHTML += `
            <tr>
                <td>${l.titulo}</td>
                <td>${l.autor}</td>
                <td>${getBadgeCategoria(l.categoria)}</td>
                <td>${l.anio_publicacion || '-'}</td>
                <td>${l.unidades}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarLibro(${l.id_libro})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarLibro(${l.id_libro})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

async function cargarCategorias() {
    const res = await fetch(`${API}/categorias`);
    const categorias = await res.json();
    const select = document.getElementById('libro-categoria');
    select.innerHTML = '';
    categorias.forEach(c => {
        select.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
    });
}

function abrirModalLibro() {
    document.getElementById('libro-id').value = '';
    document.getElementById('libro-isbn').value = '';
    document.getElementById('libro-titulo').value = '';
    document.getElementById('libro-autor').value = '';
    document.getElementById('libro-anio').value = '';
    document.getElementById('libro-unidades').value = '1';
    document.getElementById('libro-idioma').value = '';
    document.getElementById('libro-editorial').value = '';
    document.getElementById('modalLibroTitulo').textContent = 'Agregar Libro';
    cargarCategorias();
    new bootstrap.Modal(document.getElementById('modalLibro')).show();
}

async function editarLibro(id) {
    const res = await fetch(`${API}/libros/${id}`);
    const l = await res.json();
    document.getElementById('libro-id').value = l.id_libro;
    document.getElementById('libro-isbn').value = l.isbn || '';
    document.getElementById('libro-titulo').value = l.titulo;
    document.getElementById('libro-autor').value = l.autor;
    document.getElementById('libro-anio').value = l.anio_publicacion || '';
    document.getElementById('libro-unidades').value = l.unidades;
    document.getElementById('libro-idioma').value = l.idioma || '';
    document.getElementById('libro-editorial').value = l.editorial || '';
    document.getElementById('modalLibroTitulo').textContent = 'Editar Libro';
    await cargarCategorias();
    document.getElementById('libro-categoria').value = l.categoria;
    new bootstrap.Modal(document.getElementById('modalLibro')).show();
}

async function guardarLibro() {
    const id = document.getElementById('libro-id').value;
    const datos = {
        isbn: document.getElementById('libro-isbn').value,
        titulo: document.getElementById('libro-titulo').value,
        autor: document.getElementById('libro-autor').value,
        categoria: document.getElementById('libro-categoria').value,
        anio_publicacion: parseInt(document.getElementById('libro-anio').value) || null,
        idioma: document.getElementById('libro-idioma').value,
        editorial: document.getElementById('libro-editorial').value,
        unidades: parseInt(document.getElementById('libro-unidades').value) || 1
    };

    const url = id ? `${API}/libros/${id}` : `${API}/libros`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalLibro')).hide();
        cargarLibros();
    } else {
        const err = await res.json();
        alert('Error: ' + err.error);
    }
}

async function eliminarLibro(id) {
    if (!confirm('¿Estás seguro de eliminar este libro?')) return;
    await fetch(`${API}/libros/${id}`, { method: 'DELETE', headers: headers() });
    cargarLibros();
}

async function buscarLibro() {
    const q = document.getElementById('buscar-libro').value;
    if (q.length < 2) { cargarLibros(); return; }
    const res = await fetch(`${API}/libros/buscar?q=${encodeURIComponent(q)}`);
    const libros = await res.json();
    const tbody = document.getElementById('tabla-libros');
    tbody.innerHTML = '';
    libros.forEach(l => {
        tbody.innerHTML += `
            <tr>
                <td>${l.titulo}</td>
                <td>${l.autor}</td>
                <td>${getBadgeCategoria(l.categoria)}</td>
                <td>${l.anio_publicacion || '-'}</td>
                <td>${l.unidades || '-'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarLibro(${l.id_libro})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarLibro(${l.id_libro})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

// ==================== USUARIOS ====================
async function cargarUsuarios() {
    const res = await fetch(`${API}/usuarios`, { headers: headers() });
    const usuarios = await res.json();
    const tbody = document.getElementById('tabla-usuarios');
    tbody.innerHTML = '';
    usuarios.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${u.nombre}</td>
                <td>${u.apellido}</td>
                <td>${u.email}</td>
                <td>${u.telefono || '-'}</td>
                <td>${u.documento_id || '-'}</td>
                <td>${u.direccion || '-'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarUsuario(${u.id_usuario})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${u.id_usuario})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

function abrirModalUsuario() {
    document.getElementById('usuario-id').value = '';
    document.getElementById('usuario-nombre').value = '';
    document.getElementById('usuario-apellido').value = '';
    document.getElementById('usuario-email').value = '';
    document.getElementById('usuario-telefono').value = '';
    document.getElementById('usuario-documento').value = '';
    document.getElementById('usuario-direccion').value = '';
    document.getElementById('modalUsuarioTitulo').textContent = 'Agregar Usuario';
    new bootstrap.Modal(document.getElementById('modalUsuario')).show();
}

async function editarUsuario(id) {
    const res = await fetch(`${API}/usuarios/${id}`, { headers: headers() });
    const u = await res.json();
    document.getElementById('usuario-id').value = u.id_usuario;
    document.getElementById('usuario-nombre').value = u.nombre;
    document.getElementById('usuario-apellido').value = u.apellido;
    document.getElementById('usuario-email').value = u.email;
    document.getElementById('usuario-telefono').value = u.telefono || '';
    document.getElementById('usuario-documento').value = u.documento_id || '';
    document.getElementById('usuario-direccion').value = u.direccion || '';
    document.getElementById('modalUsuarioTitulo').textContent = 'Editar Usuario';
    new bootstrap.Modal(document.getElementById('modalUsuario')).show();
}

async function guardarUsuario() {
    const id = document.getElementById('usuario-id').value;
    const datos = {
        nombre: document.getElementById('usuario-nombre').value,
        apellido: document.getElementById('usuario-apellido').value,
        email: document.getElementById('usuario-email').value,
        telefono: document.getElementById('usuario-telefono').value,
        documento_id: document.getElementById('usuario-documento').value,
        direccion: document.getElementById('usuario-direccion').value,
        activo: 1
    };

    const url = id ? `${API}/usuarios/${id}` : `${API}/usuarios`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalUsuario')).hide();
        cargarUsuarios();
    } else {
        const err = await res.json();
        alert('Error: ' + err.error);
    }
}

async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    await fetch(`${API}/usuarios/${id}`, { method: 'DELETE', headers: headers() });
    cargarUsuarios();
}

// ==================== PRESTAMOS ====================
async function cargarPrestamos() {
    const res = await fetch(`${API}/prestamos`, { headers: headers() });
    const prestamos = await res.json();
    const tbody = document.getElementById('tabla-prestamos');
    tbody.innerHTML = '';
    prestamos.forEach(p => {
        const fechaPrestamo = p.fecha_prestamo ? new Date(p.fecha_prestamo).toLocaleDateString('es-CR') : '-';
        const fechaDevolucion = p.fecha_devolucion_esperada ? new Date(p.fecha_devolucion_esperada).toLocaleDateString('es-CR') : '-';
        const estadoBadge = p.estado === 'activo'
            ? '<span class="badge bg-warning text-dark">Activo</span>'
            : '<span class="badge bg-success">Devuelto</span>';
        tbody.innerHTML += `
            <tr>
                <td>${p.usuario}</td>
                <td>${p.libro}</td>
                <td>${fechaPrestamo}</td>
                <td>${fechaDevolucion}</td>
                <td>${estadoBadge}</td>
                <td>
                    ${p.estado === 'activo' ? `
                    <button class="btn btn-success btn-sm" onclick="devolverLibro(${p.id_prestamo})">
                        <i class="bi bi-check-lg"></i> Devolver
                    </button>` : ''}
                </td>
            </tr>`;
    });
}

async function abrirModalPrestamo() {
    const [resUsuarios, resLibros] = await Promise.all([
        fetch(`${API}/usuarios`, { headers: headers() }),
        fetch(`${API}/libros`)
    ]);
    const usuarios = await resUsuarios.json();
    const libros = await resLibros.json();

    const selUsuario = document.getElementById('prestamo-usuario');
    const selLibro = document.getElementById('prestamo-libro');

    selUsuario.innerHTML = usuarios.map(u =>
        `<option value="${u.id_usuario}">${u.nombre} ${u.apellido}</option>`
    ).join('');

    selLibro.innerHTML = libros.map(l =>
        `<option value="${l.id_libro}">${l.titulo}</option>`
    ).join('');

    const fechaDefault = new Date();
    fechaDefault.setDate(fechaDefault.getDate() + 14);
    document.getElementById('prestamo-fecha').value = fechaDefault.toISOString().split('T')[0];

    new bootstrap.Modal(document.getElementById('modalPrestamo')).show();
}

async function guardarPrestamo() {
    const datos = {
        id_usuario: parseInt(document.getElementById('prestamo-usuario').value),
        id_libro: parseInt(document.getElementById('prestamo-libro').value),
        fecha_devolucion: document.getElementById('prestamo-fecha').value
    };

    const res = await fetch(`${API}/prestamos`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalPrestamo')).hide();
        cargarPrestamos();
    } else {
        const err = await res.json();
        alert('Error: ' + err.error);
    }
}

async function devolverLibro(id) {
    if (!confirm('¿Confirmar devolución?')) return;
    await fetch(`${API}/prestamos/${id}/devolver`, { method: 'PUT', headers: headers() });
    cargarPrestamos();
}

// ==================== INICIO ====================
verificarLogin();
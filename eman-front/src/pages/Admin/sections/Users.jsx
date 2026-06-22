import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllUsers, toggleUserState } from '../../../redux/admin/adminUsersReducer'
import styles from './Users.module.css'

const Users = () => {
    const dispatch = useDispatch()
    const { users, loading, error } = useSelector(state => state.adminUsers)
    const [search, setSearch] = useState('')

    useEffect(() => {
        dispatch(fetchAllUsers())
    }, [dispatch])

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    const handleToggleState = (id, currentState) => {
        dispatch(toggleUserState({ id, state: !currentState }))
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Usuarios</h1>
                    <p className={styles.subtitle}>{users.length} usuarios registrados</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <input
                    className={styles.search}
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading && <p className={styles.loading}>Cargando usuarios...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {!loading && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Teléfono</th>
                                <th>Ciudad</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(user => (
                                <tr key={user.id} className={!user.state ? styles.rowInactive : ''}>
                                    <td>
                                        <p className={styles.userName}>{user.name}</p>
                                        <p className={styles.userEmail}>{user.email}</p>
                                    </td>
                                    <td className={styles.cell}>{user.phone || '—'}</td>
                                    <td className={styles.cell}>{user.city || '—'}</td>
                                    <td className={styles.cell}>
                                        <span className={`${styles.roleBadge} ${user.rol === 'admin' ? styles.roleAdmin : styles.roleCliente}`}>
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td className={styles.cell}>
                                        <span className={`${styles.badge} ${user.state ? styles.badgeActive : styles.badgeInactive}`}>
                                            {user.state ? 'Activo' : 'Suspendido'}
                                        </span>
                                    </td>
                                    <td className={styles.cell}>
                                        <button
                                            className={`${styles.toggleBtn} ${user.state ? styles.toggleDeactivate : styles.toggleActivate}`}
                                            onClick={() => handleToggleState(user.id, user.state)}
                                        >
                                            {user.state ? 'Suspender' : 'Activar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && !loading && (
                        <p className={styles.empty}>No se encontraron usuarios</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default Users;
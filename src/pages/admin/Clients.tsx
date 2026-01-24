import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Loader2, Users, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { listAllUsers, listAllCollaterals, deleteUserData, deleteCollateral } from '@/lib/firestoreClient';
import { formatDate } from '@/lib/converters';

export default function AdminClients() {
    const { user, userData } = useAuth();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const { data: users, isLoading: loadingUsers } = useQuery({
        queryKey: ['admin-users'],
        queryFn: listAllUsers,
    });

    const { data: collaterals, isLoading: loadingColls } = useQuery({
        queryKey: ['admin-collaterals'],
        queryFn: listAllCollaterals,
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (uid: string) => {
            if (!user?.uid) throw new Error('No admin session');
            return deleteUserData(user.uid, uid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-collaterals'] });
        },
        onError: (err: unknown) => {
            setError((err as Error).message);
        },
    });

    const deleteCollateralMutation = useMutation({
        mutationFn: async (id: string) => {
            return deleteCollateral(id, user?.uid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-collaterals'] });
        },
        onError: (err: unknown) => {
            setError((err as Error).message);
        },
    });

    const userMap = useMemo(() => {
        const map = new Map<string, string>();
        (users || []).forEach((u) => map.set(u.uid, u.fullName || u.email));
        return map;
    }, [users]);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-indigo-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Panel de clientes</h1>
                    <p className="text-gray-500">Eliminar usuarios o artículos sospechosos. Solo admins.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold">
                    {error}
                </div>
            )}

            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-slate-900">Usuarios</h2>
                    </div>
                    <span className="text-xs text-slate-500">Total: {users?.length ?? 0}</span>
                </div>

                {loadingUsers ? (
                    <div className="flex items-center gap-3 text-slate-500">
                        <Loader2 className="animate-spin h-4 w-4" />
                        Cargando usuarios…
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-left text-slate-500 font-semibold">
                                <tr>
                                    <th className="py-2 pr-4">Nombre</th>
                                    <th className="py-2 pr-4">Email</th>
                                    <th className="py-2 pr-4">Rol</th>
                                    <th className="py-2 pr-4">Estado</th>
                                    <th className="py-2 pr-4">Creado</th>
                                    <th className="py-2 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(users || []).map((u) => (
                                    <tr key={u.uid}>
                                        <td className="py-2 pr-4 font-semibold text-slate-900">{u.fullName || '—'}</td>
                                        <td className="py-2 pr-4 text-slate-600">{u.email}</td>
                                        <td className="py-2 pr-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{u.role}</span>
                                        </td>
                                        <td className="py-2 pr-4 capitalize">{u.status}</td>
                                        <td className="py-2 pr-4 text-slate-500">{formatDate(u.createdAt)}</td>
                                        <td className="py-2 text-right">
                                            <button
                                                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-bold disabled:opacity-50"
                                                onClick={() => deleteUserMutation.mutate(u.uid)}
                                                disabled={deleteUserMutation.isPending || u.uid === userData?.uid}
                                            >
                                                {deleteUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                Borrar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-emerald-600" />
                        <h2 className="text-lg font-bold text-slate-900">Artículos (collateral)</h2>
                    </div>
                    <span className="text-xs text-slate-500">Total: {collaterals?.length ?? 0}</span>
                </div>
                {loadingColls ? (
                    <div className="flex items-center gap-3 text-slate-500">
                        <Loader2 className="animate-spin h-4 w-4" />
                        Cargando artículos…
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-left text-slate-500 font-semibold">
                                <tr>
                                    <th className="py-2 pr-4">Artículo</th>
                                    <th className="py-2 pr-4">Serial</th>
                                    <th className="py-2 pr-4">Dueño</th>
                                    <th className="py-2 pr-4">Estado</th>
                                    <th className="py-2 pr-4">Creado</th>
                                    <th className="py-2 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(collaterals || []).map((c) => (
                                    <tr key={c.id}>
                                        <td className="py-2 pr-4 font-semibold text-slate-900">{c.brandModel}</td>
                                        <td className="py-2 pr-4 text-slate-600">{c.serialImei}</td>
                                        <td className="py-2 pr-4 text-slate-500">{userMap.get(c.ownerUid) || c.ownerUid}</td>
                                        <td className="py-2 pr-4 capitalize">{c.status}</td>
                                        <td className="py-2 pr-4 text-slate-500">{formatDate(c.createdAt)}</td>
                                        <td className="py-2 text-right">
                                            <button
                                                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-bold disabled:opacity-50"
                                                onClick={() => c.id && deleteCollateralMutation.mutate(c.id)}
                                                disabled={deleteCollateralMutation.isPending}
                                            >
                                                {deleteCollateralMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                Borrar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

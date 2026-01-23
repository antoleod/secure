import React from 'react';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium">Pending Requests</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium">Active Loans</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium">Pending Payments</h3>
                    <p className="text-3xl font-bold mt-2">0</p>
                </div>
            </div>
        </div>
    );
}

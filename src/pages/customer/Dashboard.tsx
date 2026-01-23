import React from 'react';

export default function CustomerDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium">Active Loan</h3>
                    <p className="text-gray-500 mt-2">No active loans.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium">Verification Status</h3>
                    <p className="text-orange-500 font-bold mt-2">Pending</p>
                </div>
            </div>
        </div>
    );
}

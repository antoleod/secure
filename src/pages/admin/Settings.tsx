import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalSettings } from '@/types';
import { Save, Loader2 } from 'lucide-react';
import { fetchSettings, updateSettings } from '@/lib/firestoreClient';

export default function AdminSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [settings, setSettings] = useState<GlobalSettings>({
        aprMax: 0.25,
        licenciaFsmaRequerida: true,
        diasHabiles: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        horaCorte: 18,
        plazoMaxGarantiaMeses: 6,
        maxLoanAmount: 1000000,
        minLoanAmount: 10000,
        maxLoanTerm: 24,
        minLoanTerm: 3,
        defaultInterestRate: 15,
        defaultInterestMode: 'business_days',
        loyaltyEnabled: true,
        retentionMonths: 24,
    });

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchSettings();
                if (data) setSettings(data as GlobalSettings);
            } catch (err) {
                console.error('Error loading settings:', err);
                setMessage({ type: 'error', text: 'Failed to load settings.' });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const nextValue =
            type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : type === 'number'
                    ? Number(value)
                    : value;
        setSettings((prev) => ({
            ...prev,
            [name]: nextValue,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        setMessage(null);
        try {
            await updateSettings(user.uid, settings);
            setMessage({ type: 'success', text: 'Settings updated successfully.' });
        } catch (err) {
            console.error('Error saving settings:', err);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Global Configuration</h1>
            <p className="text-gray-500">Manage critical financial and operational parameters.</p>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Max APR (Decimal)</label>
                        <input
                            type="number"
                            step="0.0001"
                            name="aprMax"
                            value={settings.aprMax}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        <p className="text-xs text-gray-500">e.g. 0.25 for 25%</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Default Interest Rate (%)</label>
                        <input
                            type="number"
                            name="defaultInterestRate"
                            value={settings.defaultInterestRate}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Daily Cutoff Hour</label>
                        <input
                            type="number"
                            name="horaCorte"
                            value={settings.horaCorte}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        <p className="text-xs text-gray-500">24h format (e.g. 18)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Max Guarantee Pre-Approval (Months)</label>
                        <input type="number" name="plazoMaxGarantiaMeses" value={settings.plazoMaxGarantiaMeses} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Retention (Months)</label>
                        <input type="number" name="retentionMonths" value={settings.retentionMonths} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Interest Mode</label>
                        <select name="defaultInterestMode" value={settings.defaultInterestMode} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="business_days">Business Days Only</option>
                            <option value="calendar_days">Calendar Days</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Min Loan Amount (Cents)</label>
                        <input type="number" name="minLoanAmount" value={settings.minLoanAmount} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Max Loan Amount (Cents)</label>
                        <input type="number" name="maxLoanAmount" value={settings.maxLoanAmount} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Min Term (Months)</label>
                        <input type="number" name="minLoanTerm" value={settings.minLoanTerm} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Max Term (Months)</label>
                        <input type="number" name="maxLoanTerm" value={settings.maxLoanTerm} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Feature Flags</h3>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="loyaltyEnabled" name="loyaltyEnabled" checked={settings.loyaltyEnabled} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <label htmlFor="loyaltyEnabled" className="text-sm text-gray-700">Enable Loyalty Program</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="licenciaFsmaRequerida" name="licenciaFsmaRequerida" checked={settings.licenciaFsmaRequerida} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <label htmlFor="licenciaFsmaRequerida" className="text-sm text-gray-700">Require FSMA License Check</label>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchKyc, submitKyc, uploadFile } from '@/lib/firestoreClient';
import { Loader2, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function CustomerIdentity() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: kyc, isLoading } = useQuery({
        queryKey: ['kyc', user?.uid],
        queryFn: () => fetchKyc(user!.uid),
        enabled: !!user?.uid,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            if (!user) return;
            if (!frontFile || !backFile) throw new Error("ID Front and Back are required");

            setUploading(true);
            try {
                // Upload files
                const frontRef = await uploadFile(`users/${user.uid}/kyc/front`, frontFile);
                const backRef = await uploadFile(`users/${user.uid}/kyc/back`, backFile);
                const selfieRef = selfieFile ? await uploadFile(`users/${user.uid}/kyc/selfie`, selfieFile) : undefined;

                if (!frontRef || !backRef) throw new Error("Upload failed");

                await submitKyc(user.uid, {
                    frontIdRef: frontRef,
                    backIdRef: backRef,
                    selfieRef: selfieRef || undefined
                });
            } finally {
                setUploading(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kyc', user?.uid] });
            setFrontFile(null);
            setBackFile(null);
            setSelfieFile(null);
        },
        onError: (err) => {
            console.error(err);
            setError("Failed to submit documents. Please try again.");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        mutation.mutate();
    }

    if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Identity Verification</CardTitle>
                    <CardDescription>Upload your ID documents to unlock loan features.</CardDescription>
                </CardHeader>
                <CardContent>
                    {kyc?.status === 'verified' && (
                        <div className="bg-green-50 p-4 rounded-lg flex items-center gap-2 text-green-700 mb-6">
                            <CheckCircle className="h-5 w-5" />
                            <div>
                                <p className="font-bold">Verified</p>
                                <p className="text-sm">Your identity has been verified.</p>
                            </div>
                        </div>
                    )}

                    {kyc?.status === 'pending' && (
                        <div className="bg-orange-50 p-4 rounded-lg flex items-center gap-2 text-orange-700 mb-6">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <div>
                                <p className="font-bold">Verification Pending</p>
                                <p className="text-sm">We are reviewing your documents.</p>
                            </div>
                        </div>
                    )}

                    {kyc?.status === 'rejected' && (
                        <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2 text-red-700 mb-6">
                            <AlertTriangle className="h-5 w-5" />
                            <div>
                                <p className="font-bold">Verification Rejected</p>
                                <p className="text-sm">{kyc.rejectionReason || "Please re-upload clear documents."}</p>
                            </div>
                        </div>
                    )}

                    {(!kyc || kyc.status === 'rejected' || kyc.status === 'pending') && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="space-y-2">
                                <Label>ID Document (Front)</Label>
                                <div className="flex items-center gap-4">
                                    <Button type="button" variant="outline" onClick={() => document.getElementById('front-file')?.click()}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        {frontFile ? frontFile.name : "Select Image"}
                                    </Button>
                                    <input
                                        id="front-file"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>ID Document (Back)</Label>
                                <div className="flex items-center gap-4">
                                    <Button type="button" variant="outline" onClick={() => document.getElementById('back-file')?.click()}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        {backFile ? backFile.name : "Select Image"}
                                    </Button>
                                    <input
                                        id="back-file"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Selfie (Optional)</Label>
                                <div className="flex items-center gap-4">
                                    <Button type="button" variant="outline" onClick={() => document.getElementById('selfie-file')?.click()}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        {selfieFile ? selfieFile.name : "Select Image"}
                                    </Button>
                                    <input
                                        id="selfie-file"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={uploading || mutation.isPending || !frontFile || !backFile}>
                                {uploading || mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                                Submit for Verification
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

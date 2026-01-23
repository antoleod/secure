import React from 'react';

type ErrorBoundaryProps = {
    children: React.ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
    message?: string;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, message: error.message };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // In production this could be wired to a remote logger.
        console.error('App crashed', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4 text-center">
                    <div className="max-w-md space-y-4">
                        <p className="text-lg font-semibold">We hit an unexpected error.</p>
                        <p className="text-sm text-white/70">
                            Try reloading the page. If the issue persists, contact support and share this message:
                        </p>
                        <code className="block rounded-lg bg-white/10 px-4 py-3 text-sm text-white/90">
                            {this.state.message}
                        </code>
                        <button
                            type="button"
                            className="rounded-md bg-white text-slate-900 px-4 py-2 font-medium hover:bg-slate-100"
                            onClick={() => window.location.reload()}
                        >
                            Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

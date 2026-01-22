import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">O</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            OryxenTech Loans
                        </span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button>Get Started</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-slide-down">
                        Fast, Secure Personal Loans
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up">
                        Get the funds you need with competitive rates and flexible terms.
                        Apply online in minutes and receive a decision quickly.
                    </p>
                    <div className="flex gap-4 justify-center pt-4 animate-slide-up">
                        <Link to="/register">
                            <Button size="lg">Apply Now</Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline">
                                Login to Your Account
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 py-20">
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="animate-slide-up hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-3xl">⚡</span>
                                Quick Approval
                            </CardTitle>
                            <CardDescription>
                                Get approved in as little as 24 hours with our streamlined process
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="animate-slide-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.1s' }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-3xl">🔒</span>
                                Secure & Safe
                            </CardTitle>
                            <CardDescription>
                                Bank-level security with encrypted data protection
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="animate-slide-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.2s' }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-3xl">💰</span>
                                Competitive Rates
                            </CardTitle>
                            <CardDescription>
                                Flexible terms and competitive interest rates tailored to you
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </section>

            {/* How It Works */}
            <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl my-10">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                            1
                        </div>
                        <h3 className="font-semibold">Register</h3>
                        <p className="text-sm text-muted-foreground">Create your account</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                            2
                        </div>
                        <h3 className="font-semibold">Verify Identity</h3>
                        <p className="text-sm text-muted-foreground">Complete KYC process</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                            3
                        </div>
                        <h3 className="font-semibold">Apply for Loan</h3>
                        <p className="text-sm text-muted-foreground">Submit your request</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                            4
                        </div>
                        <h3 className="font-semibold">Get Funded</h3>
                        <p className="text-sm text-muted-foreground">Receive your loan</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
                <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>© 2026 OryxenTech Loans. All rights reserved.</p>
                    <p className="mt-2">Powered by Firebase & React</p>
                </div>
            </footer>
        </div>
    );
}

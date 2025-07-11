import {Button} from "@/components/ui/button";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CheckCircle, Clock, Users} from "lucide-react";

interface HomepageProps {
    onLogin: () => void;
}

export function Homepage({onLogin}: HomepageProps) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/50">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Manage Your Tasks
                        <span className="text-primary"> Effortlessly</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Stay organized and boost your productivity with TaskFlow.
                        A simple, elegant task management solution designed for modern workflows.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" onClick={onLogin} className="text-lg px-8">
                            Get Started
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg px-8">
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Everything you need to stay productive
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Simple yet powerful features to help you organize your work and life.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="text-center">
                            <CardHeader>
                                <div
                                    className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-primary"/>
                                </div>
                                <CardTitle>Simple Task Management</CardTitle>
                                <CardDescription>
                                    Create, organize, and complete tasks with ease. Keep everything in one place.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="text-center">
                            <CardHeader>
                                <div
                                    className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-primary"/>
                                </div>
                                <CardTitle>Stay on Track</CardTitle>
                                <CardDescription>
                                    Never miss a deadline with our intuitive interface and clear overview.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="text-center">
                            <CardHeader>
                                <div
                                    className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-primary"/>
                                </div>
                                <CardTitle>Secure & Private</CardTitle>
                                <CardDescription>
                                    Your data is protected with enterprise-grade security and authentication.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-muted/50">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to get organized?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Join thousands of users who have simplified their task management.
                    </p>
                    <Button size="lg" onClick={onLogin} className="text-lg px-8">
                        Start Managing Tasks
                    </Button>
                </div>
            </section>
        </div>
    );
} 
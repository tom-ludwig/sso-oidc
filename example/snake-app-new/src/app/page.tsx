'use client'

import {Button} from "@/components/ui/button";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Gamepad2, Trophy, Zap} from "lucide-react";
import {Header} from "@/components/Header/Header";
import {useRouter} from "next/navigation";

export default function Home() {
    const router = useRouter();

    const onLogin = () => {
        router.push('/login');
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header
                authenticated={null}
                userInfo={null}
                onLogin={() => {
                }}
                onLogout={() => {
                }}
            />

            {/* Hero Section */}
            <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/50">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Master the Classic
                        <span className="text-primary"> Snake Game</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Experience the timeless arcade classic with modern controls and stunning visuals.
                        Challenge yourself to beat your high score in this addictive retro game.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" onClick={onLogin} className="text-lg px-8">
                            Play Now
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg px-8">
                            View Leaderboard
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Everything you need for the ultimate snake experience
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Classic gameplay meets modern features for endless entertainment.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="text-center">
                            <CardHeader>
                                <div
                                    className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Gamepad2 className="w-6 h-6 text-primary"/>
                                </div>
                                <CardTitle>Intuitive Controls</CardTitle>
                                <CardDescription>
                                    Smooth, responsive controls that feel natural. Master the snake with precision and
                                    ease.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="text-center">
                            <CardHeader>
                                <div
                                    className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-primary"/>
                                </div>
                                <CardTitle>Beat Your High Score</CardTitle>
                                <CardDescription>
                                    Track your progress and compete with friends. Unlock achievements as you grow your
                                    snake.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="text-center">
                            <CardHeader>
                                <div
                                    className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-primary"/>
                                </div>
                                <CardTitle>Fast & Addictive</CardTitle>
                                <CardDescription>
                                    Lightning-fast gameplay with smooth animations. Perfect for quick gaming sessions.
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
                        Ready to start slithering?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Join thousands of players who have mastered the art of the snake.
                    </p>
                    <Button size="lg" onClick={onLogin} className="text-lg px-8">
                        Start Playing
                    </Button>
                </div>
            </section>
        </div>
    );
}
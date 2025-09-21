import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Settings, Users } from 'lucide-react';

export type ViewType = 'script' | 'settings' | 'characters';

interface NavigationProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
                                                          currentView,
                                                          onViewChange
                                                      }) => {
    const navItems = [
        {
            id: 'script' as ViewType,
            label: 'Script',
            icon: FileText,
            description: 'Read & Practice'
        },
        {
            id: 'characters' as ViewType,
            label: 'Characters',
            icon: Users,
            description: 'Voice Setup'
        },
        {
            id: 'settings' as ViewType,
            label: 'Settings',
            icon: Settings,
            description: 'TTS Config'
        }
    ];

    return (
        <Card className="p-4 mb-6 bg-card border-border">
            <div className="flex flex-col sm:flex-row gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <Button
                            key={item.id}
                            variant={isActive ? "default" : "ghost"}
                            onClick={() => onViewChange(item.id)}
                            className={`flex-1 h-auto p-4 ${
                                isActive
                                    ? 'bg-gradient-primary text-primary-foreground shadow-theatrical'
                                    : 'hover:bg-accent/10'
                            }`}
                        >
                            <div className="flex flex-col items-center space-y-2">
                                <Icon className="w-5 h-5" />
                                <div className="text-center">
                                    <div className="font-medium">{item.label}</div>
                                    <div className="text-xs opacity-80">{item.description}</div>
                                </div>
                            </div>
                        </Button>
                    );
                })}
            </div>
        </Card>
    );
};
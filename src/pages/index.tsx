import React, { useState } from 'react';
import { Navigation, ViewType } from '@/components/Navigation';
import { ScriptDisplay } from '@/components/ScriptDisplay';
import { SettingsPanel } from '@/components/SettingsPanel';
import { CharacterConfig } from '@/components/CharacterConfig';
import { sampleScript, sampleCharacters } from '@/data/sampleScript';
import { Character, ScriptLine, TTSSettings } from '@/tts/TtsService.ts';

const Index = () => {
    const [currentView, setCurrentView] = useState<ViewType>('script');
    const [script] = useState<ScriptLine[]>(sampleScript);
    const [characters, setCharacters] = useState<Character[]>(sampleCharacters);
    const [settings, setSettings] = useState<TTSSettings>({
        readOwnLines: false,
        beepOnOwnLines: true,
        playbackSpeed: 1.0,
        pauseDuration: 2.0,
        volume: 0.8
    });

    const renderCurrentView = () => {
        switch (currentView) {
            case 'script':
                return (
                    <ScriptDisplay
                        script={script}
                        characters={characters}
                        settings={settings}
                    />
                );
            case 'settings':
                return (
                    <SettingsPanel
                        settings={settings}
                        onSettingsChange={setSettings}
                    />
                );
            case 'characters':
                return (
                    <CharacterConfig
                        characters={characters}
                        script={script}
                        onCharactersChange={setCharacters}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-bg">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-2 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-theatrical font-bold text-accent">
                                Script Reader Pro
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Professional theater script learning with TTS
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                <Navigation
                    currentView={currentView}
                    onViewChange={setCurrentView}
                />
                {renderCurrentView()}
            </main>
        </div>
    );
};

export default Index;

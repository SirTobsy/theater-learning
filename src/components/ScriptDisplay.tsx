import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, SkipForward } from 'lucide-react';
import { ScriptLine, Character, TTSSettings, ttsService } from '@/tts/TtsService.ts';
import { useToast } from '@/hooks/use-toast';

interface ScriptDisplayProps {
    script: ScriptLine[];
    characters: Character[];
    settings: TTSSettings;
}

export const ScriptDisplay: React.FC<ScriptDisplayProps> = ({
                                                                script,
                                                                characters,
                                                                settings
                                                            }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLineId, setCurrentLineId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        initializeTTS();
    }, []);

    const initializeTTS = async () => {
        try {
            await ttsService.initialize();
            setIsInitialized(true);
            toast({
                title: "TTS Ready",
                description: "Text-to-speech service initialized successfully",
            });
        } catch (error) {
            toast({
                title: "TTS Error",
                description: "Failed to initialize text-to-speech",
                variant: "destructive",
            });
        }
    };

    const handlePlay = async () => {
        if (!isInitialized) {
            toast({
                title: "Not Ready",
                description: "Please wait for TTS to initialize",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsPlaying(true);
            await ttsService.processScript(
                script,
                characters,
                settings,
                (lineId) => setCurrentLineId(lineId),
                (lineId) => {
                    if (lineId === currentLineId) {
                        setCurrentLineId(null);
                    }
                }
            );
            setIsPlaying(false);
            setCurrentLineId(null);
        } catch (error) {
            setIsPlaying(false);
            setCurrentLineId(null);
            toast({
                title: "Playback Error",
                description: "Failed to play script",
                variant: "destructive",
            });
        }
    };

    const handlePause = () => {
        ttsService.pause();
        setIsPlaying(false);
    };

    const handleResume = () => {
        ttsService.resume();
        setIsPlaying(true);
    };

    const handleStop = () => {
        ttsService.stop();
        setIsPlaying(false);
        setCurrentLineId(null);
    };

    const getCharacterName = (characterId: string): string => {
        const character = characters.find(c => c.id === characterId);
        return character?.name || 'Unknown';
    };

    const isUserLine = (line: ScriptLine): boolean => {
        const character = characters.find(c => c.id === line.characterId);
        return character?.isUserCharacter || line.isUserLine || false;
    };

    const renderLine = (line: ScriptLine, index: number) => {
        const isCurrentLine = currentLineId === line.id;
        const isUser = isUserLine(line);

        if (line.type === 'scene-break') {
            return (
                <div key={line.id} className="my-8">
                    <hr className="border-border" />
                    <div className="text-center py-4">
            <span className="script-text text-accent font-medium">
              {line.text}
            </span>
                    </div>
                    <hr className="border-border" />
                </div>
            );
        }

        if (line.type === 'stage-direction') {
            return (
                <div key={line.id} className="my-4">
                    <div className={`stage-direction ${isCurrentLine ? 'current-line' : ''}`}>
                        [{line.text}]
                    </div>
                </div>
            );
        }

        return (
            <div
                key={line.id}
                className={`mb-6 ${isUser ? 'user-line' : ''} ${isCurrentLine ? 'current-line' : ''} rounded-lg p-4 transition-all duration-300`}
            >
                <div className="character-name mb-2">
                    {getCharacterName(line.characterId)}
                    {isUser && <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded">YOU</span>}
                </div>
                <div className="script-text pl-4">
                    {line.text}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-2">
            {/* Controls */}
            <Card className="mb-6 p-4 bg-card border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {!isPlaying ? (
                            <Button
                                onClick={handlePlay}
                                disabled={!isInitialized}
                                variant="default"
                                className="bg-gradient-primary hover:opacity-90"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Read Script
                            </Button>
                        ) : (
                            <div className="flex space-x-2">
                                <Button
                                    onClick={handlePause}
                                    variant="secondary"
                                >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                </Button>
                                <Button
                                    onClick={handleStop}
                                    variant="outline"
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    Stop
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        {isInitialized ? (
                            <span className="text-success">● TTS Ready</span>
                        ) : (
                            <span className="text-warning">● Initializing...</span>
                        )}
                    </div>
                </div>
            </Card>

            {/* Script Content */}
            <Card className="script-container min-h-[600px]">
                <div className="space-y-2">
                    {script.map((line, index) => renderLine(line, index))}
                </div>

                {script.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">No script loaded</p>
                        <p className="text-sm mt-2">Upload or paste a script to get started</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
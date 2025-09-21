import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { TTSSettings } from '@/services/ttsService';

interface SettingsPanelProps {
    settings: TTSSettings;
    onSettingsChange: (settings: TTSSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
                                                                settings,
                                                                onSettingsChange
                                                            }) => {
    const updateSetting = (key: keyof TTSSettings, value: any) => {
        onSettingsChange({
            ...settings,
            [key]: value
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="font-theatrical text-2xl text-accent">
                        Playback Settings
                    </CardTitle>
                    <CardDescription>
                        Customize your script reading experience
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Main TTS Controls */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base font-medium">Read Own Lines</Label>
                                <p className="text-sm text-muted-foreground">
                                    Have the TTS read your assigned character lines aloud
                                </p>
                            </div>
                            <Switch
                                checked={settings.readOwnLines}
                                onCheckedChange={(checked) => updateSetting('readOwnLines', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base font-medium">Beep on Own Lines</Label>
                                <p className="text-sm text-muted-foreground">
                                    Play an audio cue when reaching your lines
                                </p>
                            </div>
                            <Switch
                                checked={settings.beepOnOwnLines}
                                onCheckedChange={(checked) => updateSetting('beepOnOwnLines', checked)}
                            />
                        </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-base font-medium">
                                Playback Speed: {settings.playbackSpeed.toFixed(1)}x
                            </Label>
                            <Slider
                                value={[settings.playbackSpeed]}
                                onValueChange={(value) => updateSetting('playbackSpeed', value[0])}
                                min={0.5}
                                max={2.0}
                                step={0.1}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>0.5x (Slow)</span>
                                <span>1.0x (Normal)</span>
                                <span>2.0x (Fast)</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-base font-medium">
                                Pause Duration: {settings.pauseDuration.toFixed(1)}s
                            </Label>
                            <Slider
                                value={[settings.pauseDuration]}
                                onValueChange={(value) => updateSetting('pauseDuration', value[0])}
                                min={0.5}
                                max={5.0}
                                step={0.1}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>0.5s</span>
                                <span>2.5s</span>
                                <span>5.0s</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-base font-medium">
                                Volume: {Math.round(settings.volume * 100)}%
                            </Label>
                            <Slider
                                value={[settings.volume]}
                                onValueChange={(value) => updateSetting('volume', value[0])}
                                min={0.0}
                                max={1.0}
                                step={0.05}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Quick Presets</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                                onClick={() => onSettingsChange({
                                    readOwnLines: false,
                                    beepOnOwnLines: true,
                                    playbackSpeed: 1.0,
                                    pauseDuration: 2.0,
                                    volume: 0.8
                                })}
                                className="p-3 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                            >
                                <div className="font-medium text-sm">Practice Mode</div>
                                <div className="text-xs text-muted-foreground">Beep cues only</div>
                            </button>

                            <button
                                onClick={() => onSettingsChange({
                                    readOwnLines: true,
                                    beepOnOwnLines: false,
                                    playbackSpeed: 1.0,
                                    pauseDuration: 1.5,
                                    volume: 0.8
                                })}
                                className="p-3 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                            >
                                <div className="font-medium text-sm">Full Read</div>
                                <div className="text-xs text-muted-foreground">Read everything</div>
                            </button>

                            <button
                                onClick={() => onSettingsChange({
                                    readOwnLines: true,
                                    beepOnOwnLines: true,
                                    playbackSpeed: 0.8,
                                    pauseDuration: 3.0,
                                    volume: 0.7
                                })}
                                className="p-3 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                            >
                                <div className="font-medium text-sm">Learning Mode</div>
                                <div className="text-xs text-muted-foreground">Slow & clear</div>
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
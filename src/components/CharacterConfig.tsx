import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Users, Play } from 'lucide-react';
import { Character, ScriptLine, ttsService } from '@/services/ttsService';
import { useToast } from '@/hooks/use-toast';

interface CharacterConfigProps {
    characters: Character[];
    script: ScriptLine[];
    onCharactersChange: (characters: Character[]) => void;
}

// Available TTS voices (simplified for demo - in real app these would be dynamic)
const AVAILABLE_VOICES = [
    { id: 'voice-1', name: 'Natural Male', gender: 'male' },
    { id: 'voice-2', name: 'Natural Female', gender: 'female' },
    { id: 'voice-3', name: 'Dramatic Male', gender: 'male' },
    { id: 'voice-4', name: 'Dramatic Female', gender: 'female' },
    { id: 'voice-5', name: 'Elderly Male', gender: 'male' },
    { id: 'voice-6', name: 'Elderly Female', gender: 'female' },
    { id: 'voice-7', name: 'Youth Male', gender: 'male' },
    { id: 'voice-8', name: 'Youth Female', gender: 'female' },
];

export const CharacterConfig: React.FC<CharacterConfigProps> = ({
                                                                    characters,
                                                                    script,
                                                                    onCharactersChange
                                                                }) => {
    const [previewingCharacter, setPreviewingCharacter] = useState<string | null>(null);
    const { toast } = useToast();

    // Extract unique characters from script
    const scriptCharacters = React.useMemo(() => {
        const characterIds = new Set(script
            .filter(line => line.type === 'dialogue')
            .map(line => line.characterId)
        );
        return Array.from(characterIds);
    }, [script]);

    // Ensure all script characters are in the characters array
    React.useEffect(() => {
        const missingCharacters = scriptCharacters.filter(
            charId => !characters.find(c => c.id === charId)
        );

        if (missingCharacters.length > 0) {
            const newCharacters = missingCharacters.map((charId, index) => ({
                id: charId,
                name: charId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                voiceId: AVAILABLE_VOICES[index % AVAILABLE_VOICES.length].id,
                isUserCharacter: false
            }));

            onCharactersChange([...characters, ...newCharacters]);
        }
    }, [scriptCharacters, characters, onCharactersChange]);

    const updateCharacter = (characterId: string, updates: Partial<Character>) => {
        const updatedCharacters = characters.map(char =>
            char.id === characterId ? { ...char, ...updates } : char
        );
        onCharactersChange(updatedCharacters);
    };

    const previewVoice = async (characterId: string) => {
        const character = characters.find(c => c.id === characterId);
        if (!character) return;

        try {
            setPreviewingCharacter(characterId);
            const sampleText = `Hello, I am ${character.name}. This is how I sound with this voice setting.`;

            await ttsService.speak(sampleText, {
                readOwnLines: true,
                beepOnOwnLines: false,
                playbackSpeed: 1.0,
                pauseDuration: 1.0,
                volume: 0.8
            });
        } catch (error) {
            toast({
                title: "Preview Failed",
                description: "Unable to preview voice. Make sure TTS is initialized.",
                variant: "destructive",
            });
        } finally {
            setPreviewingCharacter(null);
        }
    };

    const getCharacterLines = (characterId: string): number => {
        return script.filter(line =>
            line.type === 'dialogue' && line.characterId === characterId
        ).length;
    };

    const userCharacters = characters.filter(c => c.isUserCharacter);

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="font-theatrical text-2xl text-accent flex items-center">
                        <Users className="w-6 h-6 mr-2" />
                        Character Configuration
                    </CardTitle>
                    <CardDescription>
                        Assign voices to characters and select your roles
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* User Roles Summary */}
                    {userCharacters.length > 0 && (
                        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                            <h3 className="font-medium mb-2 flex items-center text-accent">
                                <User className="w-4 h-4 mr-2" />
                                Your Roles ({userCharacters.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {userCharacters.map(char => (
                                    <Badge key={char.id} variant="secondary" className="bg-accent/20 text-accent">
                                        {char.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Character List */}
                    <div className="space-y-4">
                        {characters.map(character => (
                            <Card key={character.id} className="p-4 bg-secondary/50">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={character.isUserCharacter}
                                                onCheckedChange={(checked) =>
                                                    updateCharacter(character.id, { isUserCharacter: !!checked })
                                                }
                                            />
                                            <div className="min-w-0">
                                                <h3 className="font-medium text-foreground truncate">
                                                    {character.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {getCharacterLines(character.id)} lines
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="min-w-[200px]">
                                            <Select
                                                value={character.voiceId}
                                                onValueChange={(voiceId) =>
                                                    updateCharacter(character.id, { voiceId })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select voice" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {AVAILABLE_VOICES.map(voice => (
                                                        <SelectItem key={voice.id} value={voice.id}>
                                                            {voice.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => previewVoice(character.id)}
                                            disabled={previewingCharacter === character.id}
                                        >
                                            <Play className="w-4 h-4 mr-1" />
                                            {previewingCharacter === character.id ? 'Playing...' : 'Preview'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {characters.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No characters found</p>
                            <p className="text-sm mt-2">Load a script to see available characters</p>
                        </div>
                    )}

                    {/* Quick Actions */}
                    {characters.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const updated = characters.map(c => ({ ...c, isUserCharacter: false }));
                                    onCharactersChange(updated);
                                }}
                            >
                                Clear All User Roles
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const updated = characters.map((c, index) => ({
                                        ...c,
                                        voiceId: AVAILABLE_VOICES[index % AVAILABLE_VOICES.length].id
                                    }));
                                    onCharactersChange(updated);
                                }}
                            >
                                Auto-Assign Voices
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
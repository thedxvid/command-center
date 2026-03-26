'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { mockSquads } from '@/lib/mockData';
import type { AgentSkill } from '@/types';

const AVATAR_OPTIONS = ['🎬', '🎠', '📢', '🔥', '🧠', '✍️', '📊', '🎯', '🚀', '💡', '🎨', '📱'];

const SKILL_OPTIONS: { id: AgentSkill; label: string }[] = [
  { id: 'vault_search', label: 'Vault Search' },
  { id: 'read_vault_note', label: 'Read Vault Note' },
  { id: 'generate_image', label: 'Generate Image' },
  { id: 'web_search', label: 'Web Search' },
];

const MODEL_OPTIONS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
];

export default function NewAgentPage() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧠');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [skills, setSkills] = useState<AgentSkill[]>([]);
  const [squadId, setSquadId] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [success, setSuccess] = useState(false);

  const toggleSkill = (skill: AgentSkill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const agentData = {
      name,
      avatar,
      description,
      systemPrompt,
      skills,
      squadId: squadId || undefined,
      config: { model, temperature, maxTokens },
    };

    console.log('Creating agent:', agentData);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="text-5xl">{avatar}</div>
        <h2 className="text-xl font-bold text-text-primary">Agent Created!</h2>
        <p className="text-sm text-text-secondary">
          <strong>{name}</strong> is ready to go. (Check console for details)
        </p>
        <div className="flex gap-3 mt-2">
          <Link href="/agents">
            <Button variant="secondary">Back to Agents</Button>
          </Link>
          <Button
            onClick={() => {
              setSuccess(false);
              setName('');
              setDescription('');
              setSystemPrompt('');
              setSkills([]);
              setSquadId('');
              setTemperature(0.7);
              setMaxTokens(4096);
            }}
          >
            Create Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/agents" className="text-text-tertiary hover:text-text-primary transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">New Agent</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar selector */}
        <Card>
          <label className="text-sm font-medium text-text-primary block mb-3">Avatar</label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatar(emoji)}
                className={`w-12 h-12 text-2xl flex items-center justify-center rounded-xl border-2 transition-all ${
                  avatar === emoji
                    ? 'border-accent bg-accent-light scale-110'
                    : 'border-border bg-bg-primary hover:border-border-hover'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </Card>

        {/* Name */}
        <Input
          label="Name"
          placeholder="e.g. Roteirizador"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="What does this agent do?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        {/* System Prompt */}
        <Textarea
          label="System Prompt"
          placeholder="You are an expert..."
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={8}
          className="font-mono text-xs"
          required
        />

        {/* Skills */}
        <Card>
          <label className="text-sm font-medium text-text-primary block mb-3">Skills</label>
          <div className="grid grid-cols-2 gap-2">
            {SKILL_OPTIONS.map((skill) => (
              <label
                key={skill.id}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  skills.includes(skill.id)
                    ? 'border-accent bg-accent-light'
                    : 'border-border bg-bg-primary hover:border-border-hover'
                }`}
              >
                <input
                  type="checkbox"
                  checked={skills.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    skills.includes(skill.id)
                      ? 'border-accent bg-accent'
                      : 'border-border'
                  }`}
                >
                  {skills.includes(skill.id) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-text-primary">{skill.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Squad */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Squad</label>
          <select
            value={squadId}
            onChange={(e) => setSquadId(e.target.value)}
            className="h-10 px-3 text-sm bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="">No squad</option>
            {mockSquads.map((squad) => (
              <option key={squad.id} value={squad.id}>
                {squad.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="h-10 px-3 text-sm bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Temperature: <span className="text-accent font-mono">{temperature.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-[10px] text-text-tertiary">
            <span>Precise (0)</span>
            <span>Creative (1)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <Input
          label="Max Tokens"
          type="number"
          min={256}
          max={32768}
          step={256}
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href="/agents">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Create Agent
          </Button>
        </div>
      </form>
    </div>
  );
}

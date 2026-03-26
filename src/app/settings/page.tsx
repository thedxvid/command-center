'use client';

import { useState } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';

interface ApiField {
  key: string;
  label: string;
  placeholder: string;
}

const apiFields: ApiField[] = [
  { key: 'anthropicKey', label: 'Anthropic API Key', placeholder: 'sk-ant-...' },
  { key: 'elevenLabsKey', label: 'ElevenLabs API Key', placeholder: 'Enter your ElevenLabs key' },
  { key: 'nanoBananaEndpoint', label: 'Nano Banana 2 Endpoint', placeholder: 'https://api.nanobanana.com/v2' },
  { key: 'obsidianUrl', label: 'Obsidian REST API URL', placeholder: 'http://localhost:27124' },
  { key: 'obsidianKey', label: 'Obsidian API Key', placeholder: 'Enter your Obsidian API key' },
];

interface ServiceStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'unknown';
  label: string;
}

const services: ServiceStatus[] = [
  { name: 'Claude API', status: 'unknown', label: 'Not configured' },
  { name: 'Obsidian', status: 'unknown', label: 'Not configured' },
  { name: 'Whisper', status: 'unknown', label: 'Not configured' },
  { name: 'ElevenLabs', status: 'unknown', label: 'Not configured' },
  { name: 'Nano Banana 2', status: 'unknown', label: 'Not configured' },
];

const statusDotColors: Record<string, string> = {
  connected: 'bg-emerald-500',
  disconnected: 'bg-red-500',
  unknown: 'bg-amber-500',
};

export default function SettingsPage() {
  const [apiValues, setApiValues] = useState<Record<string, string>>({});
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [voiceAutoPlay, setVoiceAutoPlay] = useState(false);
  const [defaultModel, setDefaultModel] = useState('claude-sonnet-4-20250514');

  const toggleVisibility = (key: string) => {
    setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApiChange = (key: string, value: string) => {
    setApiValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Configure API keys, services, and preferences</p>
      </div>

      {/* API Configuration */}
      <Card>
        <h2 className="text-base font-semibold text-text-primary mb-5">API Configuration</h2>
        <div className="space-y-4">
          {apiFields.map((field) => (
            <div key={field.key} className="relative">
              <Input
                label={field.label}
                type={visibleFields[field.key] ? 'text' : 'password'}
                placeholder={field.placeholder}
                value={apiValues[field.key] || ''}
                onChange={(e) => handleApiChange(field.key, e.target.value)}
              />
              <button
                type="button"
                onClick={() => toggleVisibility(field.key)}
                className="absolute right-3 top-[38px] text-text-tertiary hover:text-text-primary transition-colors"
                aria-label={visibleFields[field.key] ? 'Hide' : 'Show'}
              >
                {visibleFields[field.key] ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <Button variant="primary" size="md">Save API Keys</Button>
        </div>
      </Card>

      {/* Service Status */}
      <Card>
        <h2 className="text-base font-semibold text-text-primary mb-5">Service Status</h2>
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between py-2.5 px-3 rounded-[var(--radius-md)] bg-bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${statusDotColors[service.status]}`} />
                <span className="text-sm font-medium text-text-primary">{service.name}</span>
              </div>
              <Badge
                variant={service.status === 'connected' ? 'success' : service.status === 'disconnected' ? 'danger' : 'warning'}
                size="sm"
              >
                {service.label}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <h2 className="text-base font-semibold text-text-primary mb-5">Preferences</h2>
        <div className="space-y-5">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Theme</p>
              <p className="text-xs text-text-secondary">Managed via the header toggle</p>
            </div>
            <Badge variant="default" size="md">System</Badge>
          </div>

          {/* Voice Auto-play */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Voice Auto-play</p>
              <p className="text-xs text-text-secondary">Automatically play agent voice responses</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={voiceAutoPlay}
              onClick={() => setVoiceAutoPlay(!voiceAutoPlay)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                voiceAutoPlay ? 'bg-accent' : 'bg-bg-tertiary border border-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  voiceAutoPlay ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Default Model */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Default Model</p>
              <p className="text-xs text-text-secondary">Model used for new agent configurations</p>
            </div>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="h-9 px-3 text-sm bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
            >
              <option value="claude-sonnet-4-20250514">Claude Sonnet</option>
              <option value="claude-opus-4-20250514">Claude Opus</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}

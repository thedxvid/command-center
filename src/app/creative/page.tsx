'use client';

import { useState, useRef } from 'react';
import { Card, Button, Badge, Modal, Textarea, Input, Tabs } from '@/components/ui';
import { mockCreativeOutputs, mockAgents } from '@/lib/mockData';
import { useBrandingStore, type BrandingContext } from '@/stores/brandingStore';

const typeLabels: Record<string, string> = {
  carousel: 'Carrossel',
  ad_creative: 'Criativo de Anúncio',
  script: 'Roteiro',
  viral_content: 'Conteúdo Viral',
};

const typeBadgeVariant: Record<string, 'default' | 'accent' | 'success' | 'warning' | 'danger'> = {
  carousel: 'accent',
  ad_creative: 'warning',
  script: 'success',
  viral_content: 'danger',
};

const filterTabs = [
  { id: 'all', label: 'Todos' },
  { id: 'carousel', label: 'Carrosséis' },
  { id: 'ad_creative', label: 'Criativos de Anúncio' },
  { id: 'script', label: 'Roteiros' },
  { id: 'viral_content', label: 'Conteúdo Viral' },
];

interface GeneratedResult {
  images: string[];
  text: string;
}

export default function CreativePage() {
  const [activeFilter, setActiveFilter] = useState('all');

  // Generate modal state
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateType, setGenerateType] = useState('carousel');
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [generateError, setGenerateError] = useState('');

  // Branding context
  const [brandingMode, setBrandingMode] = useState<'saved' | 'custom' | 'none'>('none');
  const [customBranding, setCustomBranding] = useState('');

  // Reference images
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referencePreviews, setReferencePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Branding store
  const { contexts, activeContextId, setActiveContext } = useBrandingStore();

  // Branding modal
  const [brandingModalOpen, setBrandingModalOpen] = useState(false);
  const [editingBranding, setEditingBranding] = useState<Partial<BrandingContext>>({});
  const [editingBrandingId, setEditingBrandingId] = useState<string | null>(null);

  const { addContext, updateContext, removeContext } = useBrandingStore();

  const filtered =
    activeFilter === 'all'
      ? mockCreativeOutputs
      : mockCreativeOutputs.filter((c) => c.type === activeFilter);

  const getAgentName = (agentId: string) =>
    mockAgents.find((a) => a.id === agentId)?.name || 'Desconhecido';

  const getAgentAvatar = (agentId: string) =>
    mockAgents.find((a) => a.id === agentId)?.avatar || '🤖';

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setReferenceFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReferencePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReference = (index: number) => {
    setReferenceFiles((prev) => prev.filter((_, i) => i !== index));
    setReferencePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetGenerateModal = () => {
    setGeneratePrompt('');
    setGenerateType('carousel');
    setBrandingMode('none');
    setCustomBranding('');
    setReferenceFiles([]);
    setReferencePreviews([]);
    setGeneratedResult(null);
    setGenerateError('');
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    if (!generatePrompt.trim()) return;

    setIsGenerating(true);
    setGenerateError('');
    setGeneratedResult(null);

    try {
      const formData = new FormData();
      formData.append('prompt', generatePrompt);
      formData.append('type', generateType);

      // Add branding context
      if (brandingMode === 'saved' && activeContextId) {
        const ctx = contexts.find((c) => c.id === activeContextId);
        if (ctx) {
          formData.append('brandingContext', JSON.stringify(ctx));
        }
      } else if (brandingMode === 'custom' && customBranding.trim()) {
        formData.append('brandingContext', customBranding);
      }

      // Add reference images
      for (const file of referenceFiles) {
        formData.append('referenceImages', file);
      }

      const response = await fetch('/api/creative/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar criativo');
      }

      setGeneratedResult(data);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      setGenerateError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBranding = () => {
    const { name, description, colors, fonts, tone, audience, references, extraNotes } = editingBranding;
    if (!name?.trim()) return;

    if (editingBrandingId) {
      updateContext(editingBrandingId, editingBranding);
    } else {
      addContext({
        id: `branding-${Date.now()}`,
        name: name || '',
        description: description || '',
        colors: colors || '',
        fonts: fonts || '',
        tone: tone || '',
        audience: audience || '',
        references: references || '',
        extraNotes: extraNotes || '',
        createdAt: new Date(),
      });
    }

    setEditingBranding({});
    setEditingBrandingId(null);
    setBrandingModalOpen(false);
  };

  const openEditBranding = (ctx: BrandingContext) => {
    setEditingBranding({ ...ctx });
    setEditingBrandingId(ctx.id);
    setBrandingModalOpen(true);
  };

  const openNewBranding = () => {
    setEditingBranding({});
    setEditingBrandingId(null);
    setBrandingModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Estúdio Criativo</h1>
          <p className="text-sm text-text-secondary mt-1">
            {mockCreativeOutputs.length} criativos produzidos
          </p>
        </div>
        <Button onClick={() => { resetGenerateModal(); setGenerateOpen(true); }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Gerar Novo
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs
        tabs={filterTabs}
        defaultTab="all"
        onChange={(tabId) => setActiveFilter(tabId)}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((creative) => (
          <Card key={creative.id} className="flex flex-col gap-3 h-full">
            <div className="aspect-[4/3] bg-bg-tertiary rounded-[var(--radius-md)] flex flex-col items-center justify-center gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-text-tertiary">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 16l5-5 4 4 2-2 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs text-text-tertiary">
                {creative.images.length} imagem{creative.images.length !== 1 ? 'ns' : ''}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant={typeBadgeVariant[creative.type] || 'default'} size="sm">
                {typeLabels[creative.type] || creative.type}
              </Badge>
              <span className="text-[11px] text-text-tertiary">
                {creative.createdAt.toLocaleDateString('pt-BR')}
              </span>
            </div>

            <p className="text-sm text-text-primary line-clamp-2">{creative.prompt}</p>

            <div className="flex items-center gap-1.5">
              <span className="text-sm leading-none">{getAgentAvatar(creative.agentId)}</span>
              <span className="text-xs text-text-secondary">{getAgentName(creative.agentId)}</span>
            </div>

            <div className="mt-auto pt-3 border-t border-border flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8a6 6 0 1112 0A6 6 0 012 8z" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                </svg>
                Ver
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-red-400 hover:text-red-500">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 5h10M6 5V3h4v2M5 5v8h6V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Excluir
              </Button>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-text-tertiary gap-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 16l5-5 4 4 2-2 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm">Nenhum criativo nesta categoria ainda</p>
          </div>
        )}
      </div>

      {/* ============================== */}
      {/* MODAL: Gerar Criativo          */}
      {/* ============================== */}
      <Modal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Gerar Criativo"
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Resultado gerado */}
          {generatedResult && (
            <div className="flex flex-col gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-[var(--radius-md)]">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-medium text-sm">Criativo gerado com sucesso!</span>
              </div>
              {generatedResult.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {generatedResult.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Criativo gerado ${i + 1}`}
                      className="w-full rounded-[var(--radius-md)] border border-border"
                    />
                  ))}
                </div>
              )}
              {generatedResult.text && (
                <p className="text-xs text-text-secondary whitespace-pre-wrap">{generatedResult.text}</p>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setGeneratedResult(null)}
              >
                Gerar outro
              </Button>
            </div>
          )}

          {/* Erro */}
          {generateError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-[var(--radius-md)] text-sm text-red-400">
              {generateError}
            </div>
          )}

          {!generatedResult && (
            <>
              {/* Prompt */}
              <Textarea
                label="Prompt"
                placeholder="Descreva o que você quer gerar... Ex: Carrossel de 5 slides sobre produtividade com fundo escuro"
                rows={4}
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
              />

              {/* Tipo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Tipo</label>
                <select
                  value={generateType}
                  onChange={(e) => setGenerateType(e.target.value)}
                  className="h-10 px-3 text-sm bg-bg-primary border border-border rounded-[var(--radius-md)] text-text-primary outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="carousel">Carrossel</option>
                  <option value="ad_creative">Criativo de Anúncio</option>
                  <option value="script">Roteiro / Thumbnail</option>
                  <option value="viral_content">Conteúdo Viral</option>
                </select>
              </div>

              {/* ---- BRANDING CONTEXT ---- */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-text-primary">Contexto de Branding</label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBrandingMode('none')}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-[var(--radius-md)] border transition-all ${
                      brandingMode === 'none'
                        ? 'border-accent bg-accent-light text-accent'
                        : 'border-border bg-bg-primary text-text-secondary hover:border-border-hover'
                    }`}
                  >
                    Sem contexto
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandingMode('saved')}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-[var(--radius-md)] border transition-all ${
                      brandingMode === 'saved'
                        ? 'border-accent bg-accent-light text-accent'
                        : 'border-border bg-bg-primary text-text-secondary hover:border-border-hover'
                    }`}
                  >
                    Contexto salvo
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandingMode('custom')}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-[var(--radius-md)] border transition-all ${
                      brandingMode === 'custom'
                        ? 'border-accent bg-accent-light text-accent'
                        : 'border-border bg-bg-primary text-text-secondary hover:border-border-hover'
                    }`}
                  >
                    Enviar agora
                  </button>
                </div>

                {/* Saved contexts */}
                {brandingMode === 'saved' && (
                  <div className="flex flex-col gap-2">
                    {contexts.length === 0 ? (
                      <div className="p-4 text-center border border-dashed border-border rounded-[var(--radius-md)]">
                        <p className="text-sm text-text-tertiary mb-2">Nenhum contexto de branding salvo</p>
                        <Button variant="secondary" size="sm" onClick={openNewBranding}>
                          Criar contexto
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1.5">
                          {contexts.map((ctx) => (
                            <button
                              key={ctx.id}
                              type="button"
                              onClick={() => setActiveContext(ctx.id)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] border text-left transition-all ${
                                activeContextId === ctx.id
                                  ? 'border-accent bg-accent-light'
                                  : 'border-border bg-bg-primary hover:border-border-hover'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">{ctx.name}</p>
                                <p className="text-xs text-text-tertiary truncate">{ctx.description || 'Sem descrição'}</p>
                              </div>
                              <div className="flex items-center gap-1 ml-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openEditBranding(ctx); }}
                                  className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                                  title="Editar"
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <path d="M11.5 2.5l2 2M2 14l1-4L11.5 1.5l2 2L5 12l-4 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeContext(ctx.id); }}
                                  className="p-1 text-text-tertiary hover:text-red-400 transition-colors"
                                  title="Excluir"
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                  </svg>
                                </button>
                              </div>
                            </button>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" onClick={openNewBranding}>
                          + Novo contexto
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Custom context */}
                {brandingMode === 'custom' && (
                  <Textarea
                    placeholder="Cole aqui seu contexto de branding: cores, tipografia, tom de voz, público-alvo, referências visuais..."
                    rows={4}
                    value={customBranding}
                    onChange={(e) => setCustomBranding(e.target.value)}
                  />
                )}
              </div>

              {/* ---- REFERENCE IMAGES ---- */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-primary">Imagens de Referência</label>
                <p className="text-xs text-text-tertiary">Envie imagens como inspiração visual para o criativo</p>

                {referencePreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {referencePreviews.map((preview, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={preview}
                          alt={`Referência ${i + 1}`}
                          className="w-20 h-20 object-cover rounded-[var(--radius-md)] border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeReference(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReferenceUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Adicionar imagem
                </Button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button variant="secondary" onClick={() => setGenerateOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!generatePrompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8l4-6v4h4V2l4 6-4 6V10H6v4L2 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                      Gerar
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ============================== */}
      {/* MODAL: Contexto de Branding    */}
      {/* ============================== */}
      <Modal
        open={brandingModalOpen}
        onClose={() => setBrandingModalOpen(false)}
        title={editingBrandingId ? 'Editar Contexto de Branding' : 'Novo Contexto de Branding'}
        maxWidth="max-w-xl"
      >
        <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
          <Input
            label="Nome do contexto *"
            placeholder="Ex: SOIA Brand, Produto X, Cliente Y"
            value={editingBranding.name || ''}
            onChange={(e) => setEditingBranding((prev) => ({ ...prev, name: e.target.value }))}
          />

          <Input
            label="Descrição"
            placeholder="Breve descrição deste contexto de branding"
            value={editingBranding.description || ''}
            onChange={(e) => setEditingBranding((prev) => ({ ...prev, description: e.target.value }))}
          />

          <Input
            label="Cores"
            placeholder="Ex: Primária #E8734A (laranja), Secundária #1A1A1A (preto), Fundo branco"
            value={editingBranding.colors || ''}
            onChange={(e) => setEditingBranding((prev) => ({ ...prev, colors: e.target.value }))}
          />

          <Input
            label="Tipografia"
            placeholder="Ex: Geist Sans para títulos, Inter para corpo, estilo bold/minimalista"
            value={editingBranding.fonts || ''}
            onChange={(e) => setEditingBranding((prev) => ({ ...prev, fonts: e.target.value }))}
          />

          <Input
            label="Tom de voz"
            placeholder="Ex: Direto, provocador, educativo, jovem, técnico"
            value={editingBranding.tone || ''}
            onChange={(e) => setEditingBranding((prev) => ({ ...prev, tone: e.target.value }))}
          />

          <Input
            label="Público-alvo"
            placeholder="Ex: Empreendedores digitais, 25-35 anos, criadores de conteúdo"
            value={editingBranding.audience || ''}
            onChange={(e) => setEditingBranding((prev) => ({ ...prev, audience: e.target.value }))}
          />

          <Textarea
            label="Referências visuais"
            placeholder="Descreva o estilo visual: minimalista, futurista, cores vibrantes, estilo editorial..."
            rows={3}
            value={editingBranding.references || ''}
            onChange={(e) => setEditingBranding((prev) => ({ ...prev, references: e.target.value }))}
          />

          <Textarea
            label="Notas extras"
            placeholder="Qualquer informação adicional: guidelines, restrições, formatos preferidos..."
            rows={3}
            value={editingBranding.extraNotes || ''}
            onChange={(e) => setEditingBranding((prev) => ({ ...prev, extraNotes: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setBrandingModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveBranding}
              disabled={!editingBranding.name?.trim()}
            >
              {editingBrandingId ? 'Salvar Alterações' : 'Criar Contexto'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

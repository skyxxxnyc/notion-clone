'use client';

import { useState } from 'react';
import { sendMail, getCalendar, generatePrompt, perplexityDeepReasoning, createNotionPage } from '@/actions/pica';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Calendar, Sparkles, Brain, FileText, CheckCircle, XCircle, LucideIcon } from 'lucide-react';

export default function PicaTestPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-[#ccff00] selection:text-black">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-[#ccff00]">Pica OS Integrations</h1>
                    <p className="text-neutral-400 max-w-2xl text-lg">
                        Test suite for Edge Function integrations including Gmail, Calendar, Anthropic, Perplexity, and Notion.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* 1. Gmail */}
                    <GmailCard />

                    {/* 2. Calendar */}
                    <CalendarCard />

                    {/* 3. Anthropic */}
                    <AnthropicCard />

                    {/* 4. Perplexity */}
                    <PerplexityCard />

                    {/* 5. Notion */}
                    <NotionCard />
                </div>
            </div>
        </div>
    );
}

function Card({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
    return (
        <div className="group relative rounded-2xl border border-white/10 bg-neutral-900/50 p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-[#ccff00]/50 hover:bg-neutral-900/80">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[#ccff00]/10 text-[#ccff00]">
                    <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold tracking-wide text-white">{title}</h2>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

interface ResultBoxProps {
    result: unknown;
    error: unknown;
}

function ResultBox({ result, error }: ResultBoxProps) {
    if (!result && !error) return null;

    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

    return (
        <div className={`mt-4 p-4 rounded-lg text-xs font-mono overflow-auto max-h-60 border ${error ? 'bg-red-950/30 border-red-900/50 text-red-200' : 'bg-neutral-950/50 border-white/5 text-neutral-300'}`}>
            {error ? (
                <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#ccff00]">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-bold uppercase tracking-wider">Success</span>
                    </div>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

function GmailCard() {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<unknown>(null);
    const [error, setError] = useState<unknown>(null);

    const handleSend = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            // Construct raw email
            const raw = `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${body}`;
            // Base64url encode
            const encoded = Buffer.from(raw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

            const res = await sendMail(encoded);
            setResult(res);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Gmail" icon={Mail}>
            <Input
                placeholder="To: (e.g. john@example.com)"
                value={to} onChange={e => setTo(e.target.value)}
                className="bg-neutral-950 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#ccff00]"
            />
            <Input
                placeholder="Subject"
                value={subject} onChange={e => setSubject(e.target.value)}
                className="bg-neutral-950 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#ccff00]"
            />
            <textarea
                placeholder="Email body..."
                value={body} onChange={e => setBody(e.target.value)}
                className="w-full min-h-[100px] rounded-md bg-neutral-950 border border-white/10 p-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ccff00] transition-colors"
            />
            <Button
                onClick={handleSend}
                disabled={loading || !to || !subject}
                className="w-full bg-[#ccff00] text-black hover:bg-[#bbe600]"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Email'}
            </Button>
            <ResultBox result={result} error={error} />
        </Card>
    );
}

function CalendarCard() {
    const [calId, setCalId] = useState('primary');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<unknown>(null);
    const [error, setError] = useState<unknown>(null);

    const handleFetch = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const res = await getCalendar(calId);
            setResult(res);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Google Calendar" icon={Calendar}>
            <Input
                placeholder="Calendar ID (default: primary)"
                value={calId} onChange={e => setCalId(e.target.value)}
                className="bg-neutral-950 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#ccff00]"
            />
            <Button
                onClick={handleFetch}
                disabled={loading}
                className="w-full bg-neutral-800 text-white hover:bg-neutral-700"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Calendar Info'}
            </Button>
            <ResultBox result={result} error={error} />
        </Card>
    );
}

function AnthropicCard() {
    const [task, setTask] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<unknown>(null);
    const [error, setError] = useState<unknown>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const res = await generatePrompt(task);
            setResult(res);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Anthropic (Claude)" icon={Sparkles}>
            <textarea
                placeholder="Describe the prompt you want generated..."
                value={task} onChange={e => setTask(e.target.value)}
                className="w-full min-h-[100px] rounded-md bg-neutral-950 border border-white/10 p-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ccff00] transition-colors"
            />
            <Button
                onClick={handleGenerate}
                disabled={loading || !task}
                className="w-full bg-[#d97757] text-white hover:bg-[#c56a4b]"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Prompt'}
            </Button>
            <ResultBox result={result} error={error} />
        </Card>
    );
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

function PerplexityCard() {
    const [query, setQuery] = useState('');
    const [model, setModel] = useState('sonar-reasoning-pro');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<unknown>(null);
    const [error, setError] = useState<unknown>(null);

    const handleAsk = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const messages: ChatMessage[] = [{ role: 'user', content: query }];
            const res = await perplexityDeepReasoning(model, messages);
            setResult(res);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Perplexity" icon={Brain}>
            <Input
                placeholder="Model (e.g. sonar-reasoning)"
                value={model} onChange={e => setModel(e.target.value)}
                className="bg-neutral-950 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#ccff00]"
            />
            <textarea
                placeholder="Ask a question..."
                value={query} onChange={e => setQuery(e.target.value)}
                className="w-full min-h-[100px] rounded-md bg-neutral-950 border border-white/10 p-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ccff00] transition-colors"
            />
            <Button
                onClick={handleAsk}
                disabled={loading || !query}
                className="w-full bg-[#20b2aa] text-white hover:bg-[#1d9e97]"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deep Reason'}
            </Button>
            <ResultBox result={result} error={error} />
        </Card>
    );
}

function NotionCard() {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<unknown>(null);
    const [error, setError] = useState<unknown>(null);

    const handleCreate = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const res = await createNotionPage(title);
            setResult(res);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Notion" icon={FileText}>
            <Input
                placeholder="New Page Title"
                value={title} onChange={e => setTitle(e.target.value)}
                className="bg-neutral-950 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#ccff00]"
            />
            <Button
                onClick={handleCreate}
                disabled={loading || !title}
                className="w-full bg-white text-black hover:bg-neutral-200"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Page'}
            </Button>
            <ResultBox result={result} error={error} />
        </Card>
    );
}

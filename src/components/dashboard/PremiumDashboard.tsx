"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import {
    Sparkles,
    FileText,
    BookOpen,
    Clock,
    Star,
    Plus,
    ArrowRight,
    Rocket,
    Target,
    Lightbulb,
} from "lucide-react";
import { GeneratePageModal, GenerateTableModal } from "@/components/ai";
import type { GeneratedPage, GeneratedTable } from "@/components/ai";
import { SolopreneurOSSetup } from "@/components/solopreneur/SolopreneurOSSetup";
import "./premium-dashboard.css";

const QUICK_ACTIONS = [
    { id: "roadmap", label: "Project Roadmap", icon: Target },
    { id: "notes", label: "Meeting Notes", icon: BookOpen },
    { id: "design", label: "Product Design", icon: Lightbulb },
    { id: "strategy", label: "Content Strategy", icon: Rocket },
];

const TEMPLATES = [
    { id: "strategy", label: "Strategy", icon: Target },
    { id: "launch", label: "Launch", icon: Rocket },
    { id: "design", label: "Design System", icon: Lightbulb },
];

export default function PremiumDashboard() {
    const {
        pages,
        currentUser,
        createPage,
        createDatabase,
        setCurrentPage,
        updatePage,
    } = useAppStore();

    const [showPageModal, setShowPageModal] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [showSolopreneurOS, setShowSolopreneurOS] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");

    // Get recent pages (last 5 edited)
    const recentPages = Object.values(pages)
        .filter((p) => !p.isArchived)
        .sort(
            (a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5);

    // Get favorite pages
    const favoritePages = Object.values(pages)
        .filter((p) => p.isFavourite && !p.isArchived)
        .slice(0, 3);

    const handleQuickAction = (actionId: string) => {
        const prompts: Record<string, string> = {
            roadmap: "Project roadmap for mobile app launch",
            notes: "Meeting notes template",
            design: "Product design documentation",
            strategy: "Content strategy plan",
        };

        setAiPrompt(prompts[actionId] || "");
        setShowPageModal(true);
    };

    const handleGeneratePage = async (generatedPage: GeneratedPage) => {
        try {
            const newPage = await createPage(null, generatedPage.title);

            if (generatedPage.icon) {
                await updatePage(newPage.id, { icon: generatedPage.icon });
            }

            setCurrentPage(newPage.id);
        } catch (error) {
            console.error("Failed to create page:", error);
            alert("Failed to create page. Please try again.");
        }
    };

    const handleGenerateTable = async (generatedTable: GeneratedTable) => {
        try {
            const newDb = await createDatabase(null, generatedTable.title);

            const properties = [
                {
                    id: "title",
                    name: "Name",
                    type: "title" as const,
                    isVisible: true,
                    width: 250,
                },
                ...generatedTable.properties.map((prop, idx) => ({
                    id: `prop_${idx}`,
                    name: prop.name,
                    type: prop.type as any,
                    isVisible: true,
                    width: 200,
                    options: prop.options,
                })),
            ];

            await updatePage(newDb.id, {
                databaseConfig: {
                    properties,
                    views: [
                        {
                            id: "default",
                            name: "Table",
                            type: "table" as const,
                            filters: [],
                            sorts: [],
                            visibleProperties: properties.map((p) => p.id),
                            config: {},
                        },
                    ],
                    defaultViewId: "default",
                },
            });

            setCurrentPage(newDb.id);
        } catch (error) {
            console.error("Failed to create database:", error);
            alert("Failed to create database. Please try again.");
        }
    };

    return (
        <div className="dashboard">
            {/* Hero Section */}
            <div className="dashboard-hero">
                <h1 className="dashboard-title">
                    WELCOME BACK,
                    <br />
                    <span className="dashboard-title-highlight">
                        {currentUser?.name?.toUpperCase() || "USER"}
                    </span>
                </h1>
                <p className="dashboard-subtitle">
                    Your personal workspace is ready for your next exciting project.
                </p>
            </div>

            {/* AI Assistant Card */}
            <div className="ai-assistant-card">
                <div className="ai-assistant-header">
                    <div className="ai-assistant-icon">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="ai-assistant-title">AI ASSISTANT</h3>
                        <p className="ai-assistant-desc">
                            Prompt your AI to generate pages, documents, and intricate
                            structures.
                        </p>
                    </div>
                </div>

                <div className="ai-assistant-input-wrapper">
                    <input
                        type="text"
                        placeholder="What inspiring idea would you like to build today..."
                        className="ai-assistant-input"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && aiPrompt.trim()) {
                                setShowPageModal(true);
                            }
                        }}
                    />
                    <button
                        className="ai-assistant-generate-btn"
                        onClick={() => aiPrompt.trim() && setShowPageModal(true)}
                        disabled={!aiPrompt.trim()}
                    >
                        <Sparkles size={16} />
                        GENERATE
                    </button>
                </div>

                <div className="ai-quick-actions">
                    {QUICK_ACTIONS.map((action) => (
                        <button
                            key={action.id}
                            className="ai-quick-action-btn"
                            onClick={() => handleQuickAction(action.id)}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="dashboard-grid">
                {/* Recent Projects */}
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <div className="dashboard-section-title">
                            <div className="section-icon">
                                <Clock size={16} />
                            </div>
                            RECENT PROJECTS
                        </div>
                        <button className="view-all-btn">VIEW ALL</button>
                    </div>

                    <div className="recent-projects-list">
                        {recentPages.length > 0 ? (
                            recentPages.map((page) => (
                                <button
                                    key={page.id}
                                    className="recent-project-item"
                                    onClick={() => setCurrentPage(page.id)}
                                >
                                    <div className="recent-project-icon">
                                        {page.icon || <FileText size={20} />}
                                    </div>
                                    <div className="recent-project-info">
                                        <div className="recent-project-title">{page.title}</div>
                                        <div className="recent-project-meta">
                                            Last edited:{" "}
                                            {new Date(page.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="recent-project-arrow" />
                                </button>
                            ))
                        ) : (
                            <div className="empty-state">
                                <FileText size={32} />
                                <p>No recent projects</p>
                                <span>Create your first page to get started</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Favorite Modules */}
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <div className="dashboard-section-title">
                            <div className="section-icon">
                                <Star size={16} />
                            </div>
                            FAVORITE MODULES
                        </div>
                    </div>

                    <div className="favorite-modules">
                        {favoritePages.length > 0 ? (
                            favoritePages.map((page) => (
                                <button
                                    key={page.id}
                                    className="favorite-module-card"
                                    onClick={() => setCurrentPage(page.id)}
                                >
                                    <div className="favorite-module-icon">
                                        {page.icon || <Star size={24} />}
                                    </div>
                                    <div className="favorite-module-title">{page.title}</div>
                                </button>
                            ))
                        ) : (
                            <div className="favorite-modules-empty">
                                <Plus size={48} />
                                <p>MARK PAGES OR MODULES FOR QUICK ACCESS.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Templates Section */}
            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <div className="dashboard-section-title">
                        <div className="section-icon">
                            <Lightbulb size={16} />
                        </div>
                        TEMPLATES
                    </div>
                </div>

                <div className="templates-grid">
                    <button
                        className="template-card solopreneur-card"
                        onClick={() => setShowSolopreneurOS(true)}
                    >
                        <Rocket size={24} />
                        <span>SolopreneurOS</span>
                        <small style={{ fontSize: '11px', opacity: 0.7 }}>Complete Business System</small>
                    </button>

                    {TEMPLATES.map((template) => {
                        const Icon = template.icon;
                        return (
                            <button
                                key={template.id}
                                className="template-card"
                                onClick={() => {
                                    setAiPrompt(template.label);
                                    setShowPageModal(true);
                                }}
                            >
                                <Icon size={24} />
                                <span>{template.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>


            {/* AI Modals */}
            <GeneratePageModal
                isOpen={showPageModal}
                onClose={() => {
                    setShowPageModal(false);
                    setAiPrompt("");
                }}
                onGenerate={handleGeneratePage}
            />

            <GenerateTableModal
                isOpen={showTableModal}
                onClose={() => setShowTableModal(false)}
                onGenerate={handleGenerateTable}
            />

            <SolopreneurOSSetup
                isOpen={showSolopreneurOS}
                onClose={() => setShowSolopreneurOS(false)}
            />
        </div >
    );
}

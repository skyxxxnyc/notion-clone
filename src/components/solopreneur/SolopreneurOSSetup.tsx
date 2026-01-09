"use client";

import { useState } from "react";
import { X, Check, Rocket, Database, FileText, Loader2 } from "lucide-react";
import { SOLOPRENEUR_OS } from "@/config/solopreneur-os";
import { useAppStore } from "@/store";
import { generateId } from "@/lib/utils";
import "./solopreneur-setup.css";

interface SolopreneurOSSetupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SolopreneurOSSetup({ isOpen, onClose }: SolopreneurOSSetupProps) {
    const [step, setStep] = useState<"welcome" | "installing" | "complete">("welcome");
    const [progress, setProgress] = useState(0);
    const { createDatabase, createPage, updatePage, pages } = useAppStore();

    const handleInstall = async () => {
        setStep("installing");
        setProgress(0);

        try {
            const totalSteps = SOLOPRENEUR_OS.databases.length + SOLOPRENEUR_OS.pages.length;
            let currentStep = 0;

            // Helper to check if page exists (case insensitive)
            const pageExists = (name: string) => {
                return Object.values(pages).some(p =>
                    !p.isArchived &&
                    p.title.toLowerCase() === name.toLowerCase()
                );
            };

            // Create databases
            for (const dbConfig of SOLOPRENEUR_OS.databases) {
                // Skip if already exists
                if (pageExists(dbConfig.name)) {
                    console.log(`Skipping existing database: ${dbConfig.name}`);
                    currentStep++;
                    setProgress((currentStep / totalSteps) * 100);
                    continue;
                }

                const db = await createDatabase(null, dbConfig.name);

                if (db && dbConfig.icon) {
                    await updatePage(db.id, { icon: dbConfig.icon });
                }

                // Update database properties
                if (db) {
                    const properties = [
                        { id: "title", name: "Name", type: "title" as const, isVisible: true, width: 250 },
                        ...dbConfig.properties.map((prop, idx) => ({
                            id: `prop_${idx}`,
                            name: prop.name,
                            type: prop.type as any,
                            isVisible: true,
                            width: 200,
                            options: prop.options?.map(opt => ({
                                id: generateId(),
                                name: opt.name,
                                color: opt.color
                            }))
                        }))
                    ];

                    await updatePage(db.id, {
                        databaseConfig: {
                            properties,
                            views: [{
                                id: "default",
                                name: "Table",
                                type: "table" as const,
                                filters: [],
                                sorts: [],
                                visibleProperties: properties.map(p => p.id),
                                config: {}
                            }],
                            defaultViewId: "default"
                        }
                    });
                }

                currentStep++;
                setProgress((currentStep / totalSteps) * 100);
            }

            // Create pages
            for (const pageConfig of SOLOPRENEUR_OS.pages) {
                // Skip if already exists
                if (pageExists(pageConfig.name)) {
                    console.log(`Skipping existing page: ${pageConfig.name}`);
                    currentStep++;
                    setProgress((currentStep / totalSteps) * 100);
                    continue;
                }

                const page = await createPage(null, pageConfig.name);

                if (page) {
                    await updatePage(page.id, {
                        icon: pageConfig.name.split(" ")[0], // Extract emoji
                        layout: pageConfig.layout as any
                    });

                    // Add content block if provided
                    if (pageConfig.content) {
                        // In a real app we'd convert HTML to blocks, 
                        // but for now we'll just leave it empty or add a simple block
                        // This can be enhanced later
                    }
                }

                currentStep++;
                setProgress((currentStep / totalSteps) * 100);
            }

            setStep("complete");
        } catch (error: any) {
            console.error("SolopreneurOS installation failed:", error);

            // Determine if it's likely a permission error
            const isPermissionError =
                error?.message?.includes("policy") ||
                error?.message?.includes("permission") ||
                error?.message?.includes("Database error");

            if (isPermissionError) {
                alert(
                    "Installation failed due to database permissions.\n\n" +
                    "Please run the SQL migration file located at:\n" +
                    "supabase/migrations/20260109_fix_permissions.sql\n\n" +
                    "You can run this in your Supabase SQL Editor."
                );
            } else {
                alert("Installation failed. Please check the console for details and try again.");
            }

            setStep("welcome");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content solopreneur-setup-modal" onClick={(e) => e.stopPropagation()}>
                {step === "welcome" && (
                    <>
                        <div className="modal-header">
                            <div className="setup-icon">
                                <Rocket size={32} />
                            </div>
                            <button className="modal-close" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <h2 className="setup-title">Welcome to SolopreneurOS</h2>
                            <p className="setup-subtitle">
                                Your complete business operating system
                            </p>

                            <div className="setup-features">
                                <div className="setup-feature">
                                    <Database size={24} />
                                    <div>
                                        <h3>8 Essential Databases</h3>
                                        <p>Client CRM, Projects, Content, Revenue, Tasks, Goals, Ideas, Knowledge Base</p>
                                    </div>
                                </div>

                                <div className="setup-feature">
                                    <FileText size={24} />
                                    <div>
                                        <h3>Ready-to-Use Templates</h3>
                                        <p>Dashboard, Weekly Review, Client Onboarding, Content Workflow</p>
                                    </div>
                                </div>

                                <div className="setup-feature">
                                    <Check size={24} />
                                    <div>
                                        <h3>Pre-configured Workflows</h3>
                                        <p>Everything set up and ready to use immediately</p>
                                    </div>
                                </div>
                            </div>

                            <div className="setup-warning">
                                <p>This will create {SOLOPRENEUR_OS.databases.length} databases and {SOLOPRENEUR_OS.pages.length} pages in your workspace.</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleInstall}>
                                <Rocket size={16} />
                                Install SolopreneurOS
                            </button>
                        </div>
                    </>
                )}

                {step === "installing" && (
                    <div className="modal-body setup-installing">
                        <Loader2 size={48} className="animate-spin" />
                        <h2 className="setup-title">Installing SolopreneurOS...</h2>
                        <div className="setup-progress-bar">
                            <div className="setup-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="setup-progress-text">{Math.round(progress)}% complete</p>
                    </div>
                )}

                {step === "complete" && (
                    <>
                        <div className="modal-body setup-complete">
                            <div className="setup-success-icon">
                                <Check size={48} />
                            </div>
                            <h2 className="setup-title">Setup Complete!</h2>
                            <p className="setup-subtitle">
                                Your SolopreneurOS is ready to use
                            </p>

                            <div className="setup-next-steps">
                                <h3>Next Steps:</h3>
                                <ol>
                                    <li>Check out your new Dashboard</li>
                                    <li>Add your first client to the CRM</li>
                                    <li>Create a project</li>
                                    <li>Start tracking your revenue</li>
                                </ol>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-primary" onClick={onClose}>
                                <Rocket size={16} />
                                Get Started
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

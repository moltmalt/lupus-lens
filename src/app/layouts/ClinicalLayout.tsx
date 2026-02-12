import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import {
    LayoutDashboard,
    ScanEye,
    PanelLeftClose,
    PanelLeft,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { path: ROUTES.CAPTURE, label: 'Capture Hub', icon: ScanEye },
];

function getPageTitle(pathname: string) {
    if (pathname.startsWith('/patients/')) return 'Patient Profile';
    const item = NAV_ITEMS.find((n) => n.path === pathname);
    return item?.label ?? '';
}

export function ClinicalLayout() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* ── Mobile overlay ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar border-sidebar-border transition-all duration-200 ease-in-out',
                    'hidden md:flex',
                    collapsed ? 'md:w-12' : 'md:w-48',
                    mobileOpen && '!flex w-48'
                )}
            >
                {/* Logo */}
                <div className="flex items-center gap-2 px-3 h-10 border-b border-sidebar-border shrink-0">
                    {!collapsed && (
                        <span className="text-sm font-semibold truncate">Lupus-Lens</span>
                    )}
                    <button
                        className="ml-auto md:hidden text-muted-foreground hover:text-foreground"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 py-1.5 px-1.5 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-sidebar-active text-sidebar-active-foreground'
                                        : 'text-sidebar-foreground hover:bg-sidebar-active/50 hover:text-foreground'
                                )}
                            >
                                <item.icon className="h-3.5 w-3.5 shrink-0" />
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse toggle */}
                <div className="hidden md:flex items-center px-1.5 py-1.5 border-t border-sidebar-border">
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-active/50 hover:text-foreground w-full transition-colors"
                    >
                        {collapsed ? (
                            <PanelLeft className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                            <>
                                <PanelLeftClose className="h-3.5 w-3.5 shrink-0" />
                                <span>Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* ── Main area ── */}
            <div
                className={cn(
                    'flex-1 flex flex-col min-h-0 transition-all duration-200',
                    collapsed ? 'md:ml-12' : 'md:ml-48'
                )}
            >
                {/* Top bar */}
                <header className="flex items-center justify-between px-3 h-10 border-b bg-background shrink-0">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 md:hidden"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground">
                            {getPageTitle(location.pathname)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <PrivacyBadge />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

// src/ContextMenu.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'preact/compat';
import cls from './ContextMenu.module.scss';
import { VSCodeOption } from '@vscode/webview-ui-toolkit/react';

interface MenuItem {
    label: string;
    disabled?: boolean;
    onClick?: () => void;
}

interface ContextMenuState {
    x: number;
    y: number;
    items: MenuItem[];
}

interface ContextMenuContextProps {
    showMenu: (event: MouseEvent, items: MenuItem[]) => void;
    hideMenu: () => void;
    contextMenu: ContextMenuState | null;
}

const ContextMenuContext = createContext<ContextMenuContextProps | undefined>(undefined);

export const useContextMenu = () => {
    const context = useContext(ContextMenuContext);
    if (!context) {
        throw new Error('useContextMenu must be used within a ContextMenuProvider');
    }
    return context;
};

const ContextMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    const showMenu = (event: MouseEvent, items: MenuItem[]) => {
        event.preventDefault();
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            items,
        });
    };

    const hideMenu = () => {
        setContextMenu(null);
    };

    return (
        <ContextMenuContext.Provider value={{ showMenu, hideMenu, contextMenu }}>
            {children}
        </ContextMenuContext.Provider>
    );
};

const ContextMenu: React.FC = () => {
    const { contextMenu, hideMenu } = useContextMenu();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if ((event.target as HTMLElement).closest(cls.ContextMenu)) {
                return;
            }
            hideMenu();
        };

        document.addEventListener('click', handleClick as any);
        return () => {
            document.removeEventListener('click', handleClick as any);
        };
    }, [hideMenu]);

    useEffect(() => {
        if (contextMenu) {
            const adjustPosition = () => {
                const menu = menuRef.current;
                if (!menu) {
                    return;
                };

                const { innerWidth, innerHeight } = window;
                const { clientWidth: menuWidth, clientHeight: menuHeight } = menu;
                let { x, y } = contextMenu;

                if (x + menuWidth > innerWidth) {
                    x = innerWidth - menuWidth - 10;
                }
                if (y + menuHeight > innerHeight) {
                    y = innerHeight - menuHeight - 10;
                }

                menu.style.left = `${x}px`;
                menu.style.top = `${y}px`;
                menu.style.opacity = '1';
            };

            adjustPosition();
        }
    }, [contextMenu]);

    if (!contextMenu) {
        return null;
    }

    return (
        <div ref={menuRef} className={cls.ContextMenu}>
            {contextMenu.items.map((item, index) => (
                <VSCodeOption key={index} disabled={item.disabled} onClick={item.onClick} className={cls.ContextMenuItem}>
                    {item.label}
                </VSCodeOption>
            ))}
        </div>
    );
};

export const ContextMenuContainer: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <ContextMenuProvider>
            {children}
            <ContextMenu />
        </ContextMenuProvider>
    );
};

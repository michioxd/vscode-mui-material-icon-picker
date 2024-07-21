import {
    VSCodeButton,
    VSCodeRadioGroup,
    VSCodeRadio,
    VSCodeTextField,
    VSCodeProgressRing,
    VSCodePanels,
    VSCodePanelView,
    VSCodePanelTab,
    VSCodeBadge
} from "@vscode/webview-ui-toolkit/react";
import * as mui from '@mui/icons-material';
import * as cls from './style.module.scss';
import React from "react";
import { memo } from "react";
import synonyms from './Synonyms';
import API from "./API";
import IconPreview from "./IconPreview";
// @ts-ignore
import Index from "flexsearch/dist/module/index";
import type { Id, Index as IndexType } from "flexsearch";
import { ContextMenuContainer, useContextMenu } from "./components/ContextMenu";
import { copy } from "./utils/utils";


interface IconType {
    name: string,
    importName: string,
    theme: string,
    Component: React.Component
}

const searchIndex = new Index({
    tokenize: 'full',
}) as IndexType;

const listIcon: {
    [importName: string]: IconType
} = {};

const allIcons = Object.keys(mui).sort();

const IconItem = memo(({ icon, onClick }: { icon: IconType, onClick: () => void }) => {
    const { showMenu } = useContextMenu();

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        showMenu(event, [
            {
                label: icon.importName,
                disabled: true,
            },
            {
                label: 'Preview', onClick: () => {
                    onClick();
                }
            },
            {
                label: 'Copy icon name', onClick: () => {
                    copy(icon.importName);
                }
            },
            {
                label: 'Copy icon snippet', onClick: () => {
                    copy(`<${icon.importName}Icon />`);

                }
            },
            {
                label: 'Copy import snippet', onClick: () => {
                    copy(`import ${icon.importName}Icon from '@mui/icons-material/${icon.importName}';`);
                }
            }
        ]);
    };

    const MuiIcon = icon.Component;

    return (
        <div className={cls.IconItem} onContextMenu={handleContextMenu} onClick={() => {
            onClick();
        }} data-vscode-context='{"webviewSection": "iconItems", "preventDefaultContextMenuItems": true}'>
            <div className={cls.Preview}>
                {/* @ts-ignore */}
                <MuiIcon fontSize="large" />
            </div>
            <div className={cls.Name}>
                {icon.importName}
            </div>
        </div>
    );
});

const ListIcon = memo(({ keyword, filter, setPreview }: { keyword: string, filter: string, setPreview: React.Dispatch<React.SetStateAction<string>> }) => {
    const [key, setKey] = React.useState<Id[] | null>(null);

    React.useEffect(() => {
        (async () => {
            if (keyword.length < 1) {
                setKey(null);
                return;
            }
            const keys = await searchIndex.searchAsync(keyword, {
                limit: 3000
            });
            setKey(keys);
        })();
    }, [keyword]);

    const icons: IconType[] = React.useMemo(() => {
        if (key === null || key.length === 0 && keyword.length < 1) {
            return Object.entries(listIcon).filter((icon) => icon[1].theme === filter).map((icon) => icon[1]);
        }

        return key.map((id) => listIcon[id]).filter((icon) => {
            return icon.theme === filter;
        });
    }, [key, filter, keyword]);

    return (
        <ContextMenuContainer>
            <div className={cls.ListIcon} data-vscode-context='{"webviewSection": "listIcon", "mouseCount": 4}'>
                {icons.map((icon, index) => {
                    return (
                        <IconItem icon={icon} onClick={() => {
                            setPreview(icon.importName);
                        }} key={index} />
                    );
                })}
            </div>
        </ContextMenuContainer>
    );
});

export default function Selector() {
    const [search, setSearch] = React.useState("");
    const [realSearch, setRealSearch] = React.useState("");
    const [preview, setPreview] = React.useState("");
    const [active, setActive] = React.useState("iconSelector");
    const [style, setStyle] = React.useState("Filled");
    const timeout = React.useRef<NodeJS.Timeout | null>(null);
    const [indexed, setIndexed] = React.useState(false);

    React.useEffect(() => {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
            setRealSearch(search);
        }, 1000);
    }, [search]);

    React.useEffect(() => {
        if (preview === "") {
            return;
        }
        setActive("iconPreview");
    }, [preview]);

    React.useEffect(() => {
        if (indexed) {
            return;
        }
        (async () => {
            const all = allIcons.map((importName) => {
                return new Promise((resolve) => {
                    let theme;
                    if (importName.indexOf('Outlined') !== -1) {
                        theme = 'Outlined';
                    } else if (importName.indexOf('TwoTone') !== -1) {
                        theme = 'Two tone';
                    } else if (importName.indexOf('Rounded') !== -1) {
                        theme = 'Rounded';
                    } else if (importName.indexOf('Sharp') !== -1) {
                        theme = 'Sharp';
                    } else {
                        theme = 'Filled';
                    }

                    const name = importName.replace(/(Outlined|TwoTone|Rounded|Sharp)$/, '');
                    let searchable = name;
                    if (synonyms[name]) {
                        searchable += ' ' + synonyms[name];
                    }

                    listIcon[importName] = {
                        name,
                        importName,
                        theme,
                        //@ts-ignore
                        Component: mui[importName]
                    };

                    searchIndex.addAsync(importName, searchable, () => {
                        resolve(true);
                    });
                });
            });

            await Promise.all(all);
            setIndexed(true);
        })();
    }, [indexed]);

    return (
        <>
            <div className={cls.MainSelector} data-vscode-context='{"webviewSection": "main", "preventDefaultContextMenuItems": true}'>
                <div className={cls.Sidebar}>
                    <p className={cls.TextFilter}>
                        Filter the style
                    </p>
                    <VSCodeRadioGroup orientation="vertical">
                        <VSCodeRadio value="Filled" checked={style === "Filled"} onChange={() => setStyle("Filled")} >Filled</VSCodeRadio>
                        <VSCodeRadio value="Outlined" checked={style === "Outlined"} onChange={() => setStyle("Outlined")}>Outlined</VSCodeRadio>
                        <VSCodeRadio value="Rounded" checked={style === "Rounded"} onChange={() => setStyle("Rounded")}>Rounded</VSCodeRadio>
                        <VSCodeRadio value="Two tone" checked={style === "Two tone"} onChange={() => setStyle("Two tone")}>Two tone</VSCodeRadio>
                        <VSCodeRadio value="Sharp" checked={style === "Sharp"} onChange={() => setStyle("Sharp")}>Sharp</VSCodeRadio>
                    </VSCodeRadioGroup>
                    <div className={cls.Info}>
                        <p>MUI Material Icon version: <b>5.16.4</b></p>
                        <p>Icons available: <b>{allIcons.length}</b></p>
                        <p>Picker version: <b>0.0.3</b></p>
                    </div>
                    <div className={cls.Action}>
                        <VSCodeButton appearance="secondary" onClick={() => {
                            API.postMessage({
                                cmd: "openExternalBrowser",
                                content: "https://mui.com/material-ui/icons/"
                            });
                        }}>
                            MUI Docs
                            <span slot="start" className="codicon codicon-book"></span>
                        </VSCodeButton>
                        <VSCodeButton onClick={() => {
                            API.postMessage({
                                cmd: "openExternalBrowser",
                                content: "https://github.com/michioxd/vscode-mui-material-icon-picker"
                            });
                        }}>
                            Fork me on GitHub
                            <span slot="start" className="codicon codicon-github"></span>
                        </VSCodeButton>
                    </div>
                </div>
                <div className={cls.Selector}>
                    <VSCodeTextField value={search} onInput={(e) => setSearch((e.target as HTMLInputElement)?.value)} placeholder="Search icons...">
                        <span slot="start" className="codicon codicon-search"></span>
                    </VSCodeTextField>
                    <VSCodePanels activeid={active}>
                        <VSCodePanelTab id="iconSelector" onClick={() => setActive('iconSelector')}>
                            PICKER
                        </VSCodePanelTab>
                        <VSCodePanelTab id="iconPreview">
                            PREVIEW
                            {preview && <VSCodeBadge>{preview}</VSCodeBadge>}
                        </VSCodePanelTab>
                        <VSCodePanelView id="iconSelector">
                            <div className={cls.IconList}>
                                {
                                    indexed ?
                                        <ListIcon keyword={realSearch} filter={style} setPreview={setPreview} /> :
                                        <div className={cls.Loading}>
                                            <VSCodeProgressRing />
                                            <p>Please wait...</p>
                                        </div>
                                }
                            </div>
                        </VSCodePanelView>
                        <VSCodePanelView id="iconPreview">
                            <IconPreview icon={preview} />
                        </VSCodePanelView>
                    </VSCodePanels>
                </div>
            </div>
        </>
    );
}
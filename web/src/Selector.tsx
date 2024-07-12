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
import cls from './style.module.scss';
import { Dispatch, StateUpdater, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { memo } from "preact/compat";
import synonyms from './Synonyms';
import API from "./API";
import IconPreview from "./IconPreview";
// @ts-ignore
import Index from "flexsearch/dist/module/index";
import type { Id, Index as IndexType } from "flexsearch";

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

const ListIcon = memo(({ keyword, filter, setPreview }: { keyword: string, filter: string, setPreview: Dispatch<StateUpdater<string>> }) => {
    const [key, setKey] = useState<Id[] | null>(null);

    useEffect(() => {
        (async () => {
            if (keyword.length < 1) {
                return;
            }
            const keys = await searchIndex.searchAsync(keyword, {
                limit: 3000
            });
            setKey(keys);
        })();
    }, [keyword]);

    const icons: IconType[] = useMemo(() => {
        if (key === null || key.length === 0 && keyword.length < 1) {
            return Object.entries(listIcon).filter((icon) => icon[1].theme === filter).map((icon) => icon[1]);
        }

        return key.map((id) => listIcon[id]).filter((icon) => {
            return icon.theme === filter;
        });
    }, [key, filter, keyword]);

    return (
        <div className={cls.ListIcon}>
            {icons.map((icon, index) => {
                const MuiIcon = icon.Component;
                return (
                    <div className={cls.IconItem} onClick={() => setPreview(icon.importName)} key={index}>
                        <div className={cls.Preview}>
                            {/* @ts-ignore */}
                            <MuiIcon fontSize="large" />
                        </div>
                        <div className={cls.Name}>
                            {icon.importName}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

export default function Selector() {
    const [search, setSearch] = useState("");
    const [realSearch, setRealSearch] = useState("");
    const [preview, setPreview] = useState("");
    const [active, setActive] = useState("iconSelector");
    const [style, setStyle] = useState("Filled");
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const [indexed, setIndexed] = useState(false);

    useEffect(() => {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
            setRealSearch(search);
        }, 1000);
    }, [search]);

    useEffect(() => {
        if (preview === "") {
            return;
        };
        setActive("iconPreview");
    }, [preview]);

    useEffect(() => {
        if (indexed) {
            return;
        }
        (async () => {
            const all = allIcons.map((importName, i) => {
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
    }, []);

    return (
        <>
            <div className={cls.MainSelector}>
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
                        <p>MUI Material Icon version: <b>5.16.0</b></p>
                        <p>Icons available: <b>{allIcons.length}</b></p>
                        <p>Picker version: <b>0.0.1</b></p>
                    </div>
                    <div className={cls.Action}>
                        <VSCodeButton appearance="secondary" onClick={() => {
                            API.postMessage({
                                cmd: "openExternalBrowser",
                                content: "https://mui.com/material-ui/icons/"
                            });
                        }}>
                            MUI Docs
                            <span slot="start" class="codicon codicon-book"></span>
                        </VSCodeButton>
                        <VSCodeButton onClick={() => {
                            API.postMessage({
                                cmd: "openExternalBrowser",
                                content: "https://github.com/michioxd/vscode-mui-material-icon-picker"
                            });
                        }}>
                            Fork me on GitHub
                            <span slot="start" class="codicon codicon-github"></span>
                        </VSCodeButton>
                    </div>
                </div>
                <div className={cls.Selector}>
                    <VSCodeTextField value={search} onInput={(e: { target: { value: StateUpdater<string>; }; }) => setSearch(e.target.value)} placeholder="Search icons...">
                        <span slot="start" class="codicon codicon-search"></span>
                    </VSCodeTextField>
                    <VSCodePanels activeid={active}>
                        <VSCodePanelTab id="iconSelector" onClick={() => setActive('iconSelector')}>
                            PICKER
                        </VSCodePanelTab>
                        <VSCodePanelTab id="iconPreview">
                            PREVIEW
                            {preview && <VSCodeBadge appearance="primary">{preview}</VSCodeBadge>}
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
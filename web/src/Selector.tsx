import {
    VSCodeButton,
    VSCodeRadioGroup,
    VSCodeRadio,
    VSCodeDivider,
    VSCodeTextField,
    VSCodeProgressRing,
    VSCodePanels,
    VSCodePanelView,
    VSCodePanelTab,
    VSCodeBadge
} from "@vscode/webview-ui-toolkit/react";
import * as mui from '@mui/icons-material';
import cls from './style.module.scss';
import { StateUpdater, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { memo } from "preact/compat";
import * as flexsearch from "flexsearch";
import synonyms from './Synonyms';
import API from "./API";
import IconPreview from "./IconPreview";

const FlexSearchIndex = flexsearch.default.index;

const ListIcon = memo(({ keyword }: { keyword: string }) => {

    const allIcons = useMemo(() => {
        return Object.keys(mui);
    }, []);

    return (
        <div className="ListIcon">
            {allIcons.map((icon, index) => {
                const MuiIcon = mui[icon];
                return (
                    <div className={cls.IconItem}>
                        <div className={cls.Preview}>
                            <MuiIcon fontSize="large" />
                        </div>
                        <div className={cls.Name}>
                            {icon}
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
    const [style, setStyle] = useState(0);
    const timeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
            setRealSearch(search);
        }, 1000);
    }, [search]);

    // useEffect(() => {
    //     API.setState({
    //         search,
    //         preview
    //     });
    // }, [search, preview]);

    // return (
    //     <div className="Loading">
    //         <VSCodeProgressRing />
    //         <p>Loading...</p>
    //     </div>
    // );

    return (
        <>
            <div className={cls.MainSelector}>
                <div className={cls.Sidebar}>
                    <p className={cls.TextFilter}>Filter the style {style}</p>
                    <VSCodeRadioGroup orientation="vertical">
                        <VSCodeRadio value={0} checked={style === 0} onChange={() => setStyle(0)} >Filled</VSCodeRadio>
                        <VSCodeRadio value={1} checked={style === 1} onChange={() => setStyle(1)}>Outlined</VSCodeRadio>
                        <VSCodeRadio value={2} checked={style === 2} onChange={() => setStyle(2)}>Rounded</VSCodeRadio>
                        <VSCodeRadio value={3} checked={style === 3} onChange={() => setStyle(3)}>Two tone</VSCodeRadio>
                        <VSCodeRadio value={4} checked={style === 4} onChange={() => setStyle(4)}>Sharp</VSCodeRadio>
                    </VSCodeRadioGroup>
                    <div className={cls.Info}>
                        <p>MUI Material Icon version: <b>5.16.0</b></p>
                        <p>Icons available: <b>{Object.keys(mui).length}</b></p>
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
                    <VSCodePanels>
                        <VSCodePanelTab id="iconSelector">
                            PICKER
                        </VSCodePanelTab>
                        <VSCodePanelTab id="iconPreview">
                            PREVIEW
                            <VSCodeBadge appearance="secondary">AbcRounded</VSCodeBadge>
                        </VSCodePanelTab>
                        <VSCodePanelView id="iconSelector">
                            <div className={cls.IconList}>
                                {/* <ListIcon keyword={realSearch} /> */}
                            </div>
                        </VSCodePanelView>
                        <VSCodePanelView id="iconPreview">
                            <IconPreview />
                        </VSCodePanelView>
                    </VSCodePanels>
                </div>
            </div>
        </>
    );
}
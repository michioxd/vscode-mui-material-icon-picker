import { memo, useMemo } from 'preact/compat';
import Copyable from './components/Copyable';
import cls from './style.module.scss';
import * as mui from '@mui/icons-material';
import { VSCodeBadge } from '@vscode/webview-ui-toolkit/react';

const IconPreview = memo(({ icon }: { icon: string }) => {

    const MuiIcon = useMemo(() => {
        //@ts-ignore
        const IconComponent = mui[icon];
        if (IconComponent) {
            return IconComponent;
        }
    }, [icon]);

    if (!MuiIcon) {
        return (
            <>
                <div className={cls.IconPreview}>
                    Please select a valid icon!
                </div>
            </>
        );
    }

    return (
        <div className={cls.IconPreview}>
            <Copyable str={icon}><h2 className={cls.Title}>{icon} <VSCodeBadge>{
                icon.includes("Outlined") ? "Outlined" :
                    icon.includes("Rounded") ? "Rounded" :
                        icon.includes("TwoTone") ? "TwoTone" :
                            icon.includes("Sharp") ? "Sharp" :
                                icon.includes("Round") ? "Round" : "Filled"
            }</VSCodeBadge></h2></Copyable>
            <Copyable str={"import " + icon + "Icon from \"@mui/icons-material/" + icon + "\""}>
                <div className={cls.CodePreview}>
                    <span name="name">import</span>
                    <span>&nbsp;</span>
                    <span name="icon">{icon}Icon</span>
                    <span>&nbsp;</span>
                    <span name="name">from</span>
                    <span>&nbsp;</span>
                    <span name="string">"@mui/icons-material/{icon}"</span>
                </div>
            </Copyable>
            <div className={cls.Preview}>
                <div className={cls.Crossboard}>
                    <MuiIcon fontSize="large" className={cls.Icon} />
                </div>
                <div className={cls.Demo}>
                    <div className={cls.Section}>
                        <div className={cls.Icon}>
                            <MuiIcon fontSize="small" />
                        </div>
                        <Copyable str={"<" + icon + "Icon fontWeight=\"small\" />"}>
                            <div className={cls.CodePreview}>
                                <span>{"<" + icon + "Icon fontWeight=\"small\" />"}</span>
                            </div>
                        </Copyable>
                    </div>
                    <div className={cls.Section}>
                        <div className={cls.Icon}>
                            <MuiIcon fontSize="medium" />
                        </div>
                        <Copyable str={"<" + icon + "Icon fontWeight=\"medium\" />"}>
                            <div className={cls.CodePreview}>
                                <span>{"<" + icon + "Icon fontWeight=\"medium\" />"}</span>
                            </div>
                        </Copyable>
                    </div>
                    <div className={cls.Section}>
                        <div className={cls.Icon}>
                            <MuiIcon fontSize="large" />
                        </div>
                        <Copyable str={"<" + icon + "Icon fontWeight=\"large\" />"}>
                            <div className={cls.CodePreview}>
                                <span>{"<" + icon + "Icon fontWeight=\"large\" />"}</span>
                            </div>
                        </Copyable>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default IconPreview;
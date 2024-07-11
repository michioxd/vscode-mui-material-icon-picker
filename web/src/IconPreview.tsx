import cls from './style.module.scss';

export default function IconPreview() {
    return (
        <div className={cls.IconPreview}>
            <h2 className={cls.Title}>ICON_NAME</h2>
            <div className={cls.CodePreview}>
                <span name="name">import</span>
                <span>&nbsp;</span>
                <span name="icon">ICON_NAMEIcon</span>
                <span>&nbsp;</span>
                <span name="name">from</span>
                <span>&nbsp;</span>
                <span name="string">"@mui/material-icon/ICON_NAME"</span>
            </div>
        </div>
    );
}
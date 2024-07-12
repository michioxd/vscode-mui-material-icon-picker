import { ReactNode } from "preact/compat";
import cls from "./../style.module.scss";

export default function Copyable({ children, str }: { children: ReactNode, str: string }) {

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(str);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <span title="Click to copy" onClick={handleCopy} className={cls.Copyable}>
            {children}
        </span>
    );
}
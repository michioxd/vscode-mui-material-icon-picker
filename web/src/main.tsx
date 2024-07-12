import { createRoot } from 'react-dom/client';
import Selector from './Selector.js';
import '@vscode/codicons/dist/codicon.css';

createRoot(document.getElementById('app')!).render(<Selector />);

import { useEffect, useState } from 'react';

export function useContentProtection() {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // 2. Blur quando perde foco (tentativa de screenshot)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      }
    };

    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      // Pequeno delay para evitar flash
      setTimeout(() => setIsBlurred(false), 100);
    };

    // 3. Bloquear tecla PrintScreen
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detecta PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        // Limpa o clipboard
        navigator.clipboard.writeText('').catch(() => {});
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 500);
      }
      
      // Bloqueia Ctrl+P (print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
      }
      
      // Bloqueia Ctrl+Shift+S (screenshot no Windows)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        // Tenta limpar clipboard novamente após a captura
        navigator.clipboard.writeText('Conteúdo protegido - True Signal').catch(() => {});
      }
    };

    // 4. Bloquear menu de contexto (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Adiciona listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return { isBlurred };
}

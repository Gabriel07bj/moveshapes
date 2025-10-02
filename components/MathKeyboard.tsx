import React from 'react';

interface MathKeyboardProps {
    isVisible: boolean;
    activeInput: HTMLInputElement | HTMLTextAreaElement | null;
    onDone: () => void;
}

const MathKeyboard: React.FC<MathKeyboardProps> = ({ isVisible, activeInput, onDone }) => {
    const handleKeyClick = (key: string) => {
        if (!activeInput) return;
        
        activeInput.focus();
        const start = activeInput.selectionStart || 0;
        const end = activeInput.selectionEnd || 0;
        const value = activeInput.value;

        let newValue;
        let newCursorPos;

        if (key === 'backspace') {
            if (start === end && start > 0) {
                newValue = value.substring(0, start - 1) + value.substring(end);
                newCursorPos = start - 1;
            } else {
                newValue = value.substring(0, start) + value.substring(end);
                newCursorPos = start;
            }
        } else {
            newValue = value.substring(0, start) + key + value.substring(end);
            newCursorPos = start + key.length;
        }

        activeInput.value = newValue;
        // Manually trigger change event for React state updates
        const event = new Event('input', { bubbles: true });
        activeInput.dispatchEvent(event);

        activeInput.selectionStart = activeInput.selectionEnd = newCursorPos;
    };

    // Rearranged keys into a more logical 4x6 grid
    const keys = [
        ['7', '8', '9', '+', 'x', '('],
        ['4', '5', '6', '-', 'y', ')'],
        ['1', '2', '3', '*', '^', '√'],
        ['0', '.', '=', '/', '²', 'backspace']
    ];

    const renderKey = (key: string) => {
        let display = key;
        if (key === '²') display = 'x²';
        if (key === '*') display = '×';
        if (key === '/') display = '÷';
        if (key === 'backspace') display = '⌫';
        
        return (
            <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className="keyboard-key bg-white rounded p-3 text-lg font-bold text-gray-700 hover:bg-gray-200 active:bg-gray-300"
            >
                {display}
            </button>
        );
    };

    return (
        <div
            id="math-keyboard"
            className={`fixed bottom-0 left-0 right-0 bg-[#F3F0E9] p-2 shadow-lg rounded-t-lg transform transition-transform duration-300 z-50 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        >
            <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto">
                {keys.flat().map(renderKey)}
                <button
                    id="keyboard-done"
                    onClick={onDone}
                    className="col-span-6 bg-[#D68A57] text-white rounded p-3 text-lg font-bold hover:bg-[#C07643]"
                >
                    완료
                </button>
            </div>
        </div>
    );
};

export default MathKeyboard;

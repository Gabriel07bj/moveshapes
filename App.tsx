
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Part1 from './components/Part1';
import Part2 from './components/Part2';
import Reflection from './components/Reflection';
import AIPractice from './components/AIPractice';
import Summary from './components/Summary';
import Footer from './components/Footer';
import MathKeyboard from './components/MathKeyboard';

const App: React.FC = () => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const appRef = useRef<HTMLDivElement>(null);

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setActiveInput(e.target);
        setKeyboardVisible(true);
    };

    const handleKeyboardDone = () => {
        if (activeInput) {
            activeInput.blur();
        }
        setKeyboardVisible(false);
        setActiveInput(null);
    };

    useEffect(() => {
        const keyboardHeight = 250; 
        if (isKeyboardVisible) {
            document.body.style.paddingBottom = `${keyboardHeight}px`;
            if (activeInput) {
                const inputRect = activeInput.getBoundingClientRect();
                const keyboardTop = window.innerHeight - keyboardHeight;
                if (inputRect.bottom > keyboardTop) {
                    window.scrollBy({
                        top: inputRect.bottom - keyboardTop + 20,
                        behavior: 'smooth'
                    });
                }
            }
        } else {
            document.body.style.paddingBottom = '0px';
        }
    }, [isKeyboardVisible, activeInput]);

    return (
        <div ref={appRef}>
            <Header />
            <main className="container mx-auto px-4 py-12">
                <Part1 onInputFocus={handleInputFocus} />
                <hr className="part-divider my-16" />
                <Part2 onInputFocus={handleInputFocus} />
                <Reflection onInputFocus={handleInputFocus}/>
                <hr className="part-divider my-16" />
                <AIPractice />
                <hr className="part-divider my-16" />
                <Summary />
            </main>
            <Footer />
            <MathKeyboard
                isVisible={isKeyboardVisible}
                activeInput={activeInput}
                onDone={handleKeyboardDone}
            />
        </div>
    );
};

export default App;
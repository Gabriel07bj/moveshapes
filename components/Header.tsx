
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center py-12 bg-[#F3F0E9]">
            <h1 className="text-4xl md:text-5xl font-bold text-[#4A5568]">모양 옮기기, 왜 <span className="math-var">f(x, y) = 0</span> 일까?</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                모든 모양의 움직임을 설명하는 '만능 열쇠'의 비밀을 함께 탐구해 봅시다.
            </p>
        </header>
    );
};

export default Header;

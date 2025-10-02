
import React, { useState } from 'react';
import { callGeminiAPI } from '../services/geminiService';
import { formatApiResult } from '../utils/formatter';
import Loader from './Loader';

const Summary: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [isContainerVisible, setContainerVisible] = useState(false);

    const getSummary = async () => {
        setIsLoading(true);
        setContainerVisible(true);
        setSummary('');
        const prompt = `오늘 'f(x, y)=0'을 이용한 모양 움직임의 원리에 대해 학습했습니다. 주요 내용은 1) 다양한 모양들이 놓인 자리를 f(x, y)=0으로 통합하는 것, 2) 옮긴 후의 자리 (x', y')과 원래 자리 (x, y)의 관계를 이용해 평행이동 공식을 유도하는 원리, 3) 이 원리가 모든 모양의 움직임에 일관되게 적용된다는 점입니다. 이 세 가지 핵심 내용을 바탕으로, 고등학생이 복습 노트에 정리할 수 있도록 친절한 격려의 메시지와 함께 명확한 요약 노트를 만들어주세요.`;
        const result = await callGeminiAPI(prompt, "You are a friendly and enthusiastic high school math tutor in Korea. Always respond in Korean.");
        setSummary(formatApiResult(result));
        setIsLoading(false);
    };

    return (
        <section id="summary">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#4A5568] mb-12">최종 정리: <span className="math-var">f(x, y) = 0</span>은 왜 만능 열쇠일까?</h2>
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold mb-6 text-center">우리가 발견한 '<span className="math-var">f(x, y) = 0</span>'의 힘</h3>
                <ul className="space-y-4 text-lg">
                    <li className="flex items-start">
                        <span className="text-2xl text-[#D68A57] mr-3">✓</span>
                        <div><strong className="text-[#4A5568]">통합:</strong> 직선, 포물선, 원 등 제각각이던 모양들이 놓인 자리를 하나의 형태로 통합하여 설명할 수 있습니다.</div>
                    </li>
                    <li className="flex items-start">
                        <span className="text-2xl text-[#D68A57] mr-3">✓</span>
                        <div><strong className="text-[#4A5568]">일관성:</strong> 모양을 옮기거나(평행이동), 뒤집는(대칭이동) 등 모든 움직임을 '위치 관계'로부터 유도하는 일관된 원리로 설명할 수 있습니다.</div>
                    </li>
                    <li className="flex items-start">
                        <span className="text-2xl text-[#D68A57] mr-3">✓</span>
                        <div><strong className="text-[#4A5568]">모든 모양:</strong> 우리가 아직 배우지 않은 복잡한 모양이라도 규칙만 있다면, 모두 같은 이동 규칙을 적용할 수 있는 강력한 확장성을 가집니다.</div>
                    </li>
                </ul>
                <div className="text-center mt-10">
                    <button
                        id="summarize-button"
                        onClick={getSummary}
                        disabled={isLoading}
                        className="bg-emerald-500 text-white text-lg px-6 py-3 rounded-full hover:bg-emerald-600 transition shadow-lg disabled:bg-gray-400"
                    >
                        {isLoading ? '요약 중...' : '✨ AI로 핵심 개념 정리하기'}
                    </button>
                    {isContainerVisible && (
                        <div id="summary-container" className="mt-6 text-left p-6 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg prose max-w-none">
                            {isLoading ? <Loader /> : <div dangerouslySetInnerHTML={{ __html: summary }} />}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Summary;

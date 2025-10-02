
import React, { useState } from 'react';
import { callGeminiAPI } from '../services/geminiService';
import Loader from './Loader';

const AIPractice: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [problems, setProblems] = useState('');
    const [isContainerVisible, setContainerVisible] = useState(false);

    const generateProblems = async () => {
        setIsLoading(true);
        setContainerVisible(true);
        setProblems('');
        const prompt = `당신은 대한민국 고등학교 수학 선생님입니다. 학생들이 '도형의 이동' 단원을 학습한 후 실력을 점검할 수 있도록, 다음 조건에 맞는 연습문제 3개를 만들어주세요.

1.  각 문제는 직선, 포물선, 원 중 하나를 다루어야 합니다 (총 3문제).
2.  각 문제는 평행이동 또는 대칭이동(x축, y축, 원점) 개념을 포함해야 합니다.
3.  문제와 정답을 명확히 구분하여 작성해주세요. 각 문제의 정답은 '<정답>' 이라는 태그 바로 아래에 작성해주세요.

출력 형식 예시:
문제 1: 직선 ...
<정답>
...

문제 2: 포물선 ...
<정답>
...`;
        const result = await callGeminiAPI(prompt, "You are a friendly and enthusiastic high school math tutor in Korea. Always respond in Korean.");
        setProblems(result);
        setIsLoading(false);
    };

    const renderProblems = () => {
        if (!problems) return null;
    
        // Split into individual problems using "문제 X:" as a delimiter
        const problemBlocks = problems.split(/(?=문제 \d:)/).filter(p => p.trim());

        return problemBlocks.map((block, index) => {
            const [question, answer] = block.split('<정답>');
            return (
                <div key={index} className="mt-4 first:mt-0">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: question.replace(/\n/g, '<br />') }} />
                    {answer && (
                        <details className="mt-4">
                            <summary className="cursor-pointer font-semibold text-[#D68A57]">정답 보기</summary>
                            <div className="prose max-w-none mt-2 p-4 bg-gray-50 rounded" dangerouslySetInnerHTML={{ __html: answer.trim().replace(/\n/g, '<br />') }}></div>
                        </details>
                    )}
                </div>
            );
        });
    };

    return (
        <section id="ai-practice" className="my-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#4A5568] mb-12">✨ AI 실전 문제 만들기</h2>
            <div className="max-w-3xl mx-auto text-center">
                <p className="text-lg mb-6">오늘 배운 내용을 바탕으로 AI가 새로운 연습 문제를 만들어 줍니다. 자신의 실력을 점검해 보세요!</p>
                <button
                    id="generate-problems-btn"
                    onClick={generateProblems}
                    disabled={isLoading}
                    className="bg-teal-500 text-white text-lg px-6 py-3 rounded-full hover:bg-teal-600 transition shadow-lg disabled:bg-gray-400"
                >
                    {isLoading ? '생성 중...' : '연습 문제 생성하기'}
                </button>
                {isContainerVisible && (
                    <div id="problems-container" className="mt-8 text-left p-6 bg-white border border-gray-200 rounded-lg shadow">
                        {isLoading ? <Loader /> : renderProblems()}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AIPractice;

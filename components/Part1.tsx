import React, { useState, useRef, useEffect } from 'react';
import { Chart } from 'chart.js';
import { normalizeAnswer, formatApiResult } from '../utils/formatter';
import { callGeminiAPI } from '../services/geminiService';
import Modal from './Modal';
import Loader from './Loader';

interface ActivityItemProps {
    id: string;
    title: string;
    equation: string;
    equationDisplay: React.ReactNode;
    placeholder: string;
    correctAnswer: string;
    problemType: string;
    hint?: string;
    onInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ id, title, equation, equationDisplay, placeholder, correctAnswer, problemType, hint, onInputFocus }) => {
    const [value, setValue] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isHintVisible, setHintVisible] = useState(false);
    const [isHintModalOpen, setHintModalOpen] = useState(false);
    const [hintContent, setHintContent] = useState<React.ReactNode>('');

    const checkAnswer = () => {
        if (normalizeAnswer(value) === normalizeAnswer(correctAnswer)) {
            setFeedback('정답입니다! 훌륭해요!');
            setIsCorrect(true);
            setHintVisible(false);
        } else {
            setFeedback('다시 한번 생각해볼까요?');
            setIsCorrect(false);
            setHintVisible(true);
        }
    };

    const handleHintClick = async () => {
        setHintModalOpen(true);
        setHintContent(<Loader />);
        let prompt = `학생이 '${equation}' 라는 식을 'f(x, y) = 0' 꼴로 바꾸는 데 어려움을 겪고 있습니다. 모든 항을 좌변으로 옮기는 과정을 단계별로 친절하게 설명하는 힌트를 주세요.`;
        if (problemType.includes('전개')) {
            prompt += ` 특히 원의 방정식의 경우, 완전제곱식을 전개하는 과정도 포함해서 설명해주세요.`
        }
        const hintText = await callGeminiAPI(prompt, "You are a friendly and enthusiastic high school math tutor in Korea. Explain concepts using simple, everyday analogies that a 10th-grade student can easily understand. Always respond in Korean.");
        setHintContent(formatApiResult(hintText));
    };

    return (
        <div>
            <p className="font-semibold">{title}</p>
            <p className="text-lg formula py-2 my-2">{equationDisplay}</p>
            {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
            <div className="flex items-center justify-center mt-2">
                <input
                    type="text"
                    id={id}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={onInputFocus}
                    className={`activity-input border rounded-l-md p-2 w-full text-center ${isCorrect === true ? 'border-green-500' : ''} ${isCorrect === false ? 'border-red-500' : ''}`}
                    placeholder={placeholder}
                />
                <button
                    onClick={checkAnswer}
                    className="check-btn bg-gray-500 text-white px-4 py-2 rounded-r-md hover:bg-gray-600"
                >
                    확인
                </button>
            </div>
            <p className={`feedback-msg h-6 mt-1 text-sm font-medium flex items-center justify-center ${isCorrect === true ? 'text-green-600' : ''} ${isCorrect === false ? 'text-red-600' : ''}`}>
                {feedback}
                {isHintVisible && <button onClick={handleHintClick} className="ai-hint-btn">✨ AI 힌트 보기</button>}
            </p>
            <Modal isOpen={isHintModalOpen} onClose={() => setHintModalOpen(false)} title="✨ AI 힌트 도우미">
                {hintContent}
            </Modal>
        </div>
    );
};


const CircleLimitChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                const circleData = [];
                for(let i=0; i<=360; i++) { const a=i*Math.PI/180; circleData.push({x:1+3*Math.cos(a),y:2+3*Math.sin(a)}); }

                chartInstance.current = new Chart(ctx, {
                    type: 'scatter',
                    data: {
                        datasets: [
                            {data: circleData, borderColor: '#4A5568', borderWidth: 2, showLine: true, pointRadius: 0 },
                            {type: 'line', data: [{x:2, y:-10}, {x:2, y:10}], borderColor: '#D68A57', borderWidth: 2, borderDash: [5,5], pointRadius: 0}
                        ]
                    },
                    options: {
                        maintainAspectRatio: false,
                        scales: { x: { min: -10, max: 10, grid: { color: '#eee' }, ticks: { stepSize: 2 } }, y: { min: -10, max: 10, grid: { color: '#eee' }, ticks: { stepSize: 2 } } },
                        plugins: { legend: { display: false }, tooltip: { enabled: false } }
                    }
                });
            }
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, []);

    return (
        <div className="chart-container h-64 md:h-80">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};


interface Part1Props {
    onInputFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const Part1: React.FC<Part1Props> = ({ onInputFocus }) => {
    const [isAnswerVisible, setAnswerVisible] = useState(false);

    return (
        <section id="part1" className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#4A5568] mb-4">모든 모양을 담는 그릇, <span className="math-var">f(x, y) = 0</span></h2>
            <p className="text-center text-lg text-gray-600 mb-12">먼저 이 낯선 표현과 친해져 볼까요?</p>

            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200 mb-12">
                <h3 className="text-2xl font-bold mb-6 text-center">활동 1: 여러 가지 모양을 하나의 식으로 나타내기</h3>
                <p className="text-center mb-8">다양한 모양들이 놓인 자리는 하나의 형태로 표현할 수 있습니다. 모든 항을 좌변으로 옮겨 `<span className="math-var">x</span>, <span className="math-var">y</span>에 대한 식 = 0` 꼴로 직접 만들어 보세요.</p>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <ActivityItem
                        id="line-input"
                        title="직선 모양"
                        equation="y = 2x + 1"
                        equationDisplay={<><span className="math-var">y</span> = 2<span className="math-var">x</span> + 1</>}
                        placeholder="f(x, y) = 0 꼴로 입력"
                        correctAnswer="2x-y+1=0"
                        problemType="변환"
                        onInputFocus={onInputFocus}
                    />
                     <ActivityItem
                        id="parabola-input"
                        title="포물선 모양"
                        equation="y = x² - 4x + 5"
                        equationDisplay={<><span className="math-var">y</span> = <span className="math-var">x</span>² - 4<span className="math-var">x</span> + 5</>}
                        placeholder="f(x, y) = 0 꼴로 입력"
                        correctAnswer="x^2-4x-y+5=0"
                        problemType="변환"
                        onInputFocus={onInputFocus}
                    />
                     <ActivityItem
                        id="circle-input"
                        title="원 모양"
                        equation="(x-1)² + (y-2)² = 9"
                        equationDisplay={<>(<span className="math-var">x</span>-1)² + (<span className="math-var">y</span>-2)² = 9</>}
                        placeholder="f(x, y) = 0 꼴로 입력"
                        correctAnswer="x^2+y^2-2x-4y-4=0"
                        problemType="변환 및 전개"
                        hint="힌트: 곱셈 공식을 이용해 정리해보세요!"
                        onInputFocus={onInputFocus}
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto bg-amber-50 p-8 rounded-lg border-l-4 border-amber-400">
                <h3 className="text-2xl font-bold mb-4 text-center text-amber-800">🤔 생각하고 토론하기</h3>
                <p className="text-lg text-center mb-6">왜 굳이 익숙한 <span className="math-var">y = ...</span> 꼴 대신, 낯선 <span className="math-var">f(x, y) = 0</span> 꼴을 사용해서 모양을 나타내는 걸까요? <br />이 표현의 장점은 무엇일지, 여러분의 생각을 자유롭게 적어보고 짝과 이야기해 보세요.</p>
                <textarea
                    id="student-idea"
                    className="activity-input w-full h-24 p-3 border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    placeholder="여기에 생각을 입력하세요..."
                    onFocus={onInputFocus}
                />
                <div className="text-center mt-4">
                    <button
                        id="reveal-answer-btn"
                        onClick={() => setAnswerVisible(!isAnswerVisible)}
                        className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 transition"
                    >
                        장점 확인하기
                    </button>
                </div>
                {isAnswerVisible && (
                    <div id="answer-div" className="mt-6">
                        <h4 className="font-bold text-xl mb-2">가장 큰 장점: 모든 모양을 '차별 없이' 표현할 수 있어요!</h4>
                        <p className="mb-4">특히 **원 모양**을 생각해 보세요. 원은 <span className="math-var">y = ...</span> 형태의 하나의 식으로 표현하기 어렵습니다. 아래 그래프처럼 <span className="math-var">x</span>값 하나에 <span className="math-var">y</span>값이 두 개씩 대응되기 때문이죠. 하지만 <span className="math-var">f(x, y) = 0</span> 꼴은 모양이 놓인 '규칙' 자체를 의미하므로, 원을 포함한 **어떤 복잡한 모양이라도 간결하게 표현**할 수 있는 강력한 장점이 있습니다.</p>
                        <CircleLimitChart />
                    </div>
                )}
            </div>
        </section>
    );
};

export default Part1;
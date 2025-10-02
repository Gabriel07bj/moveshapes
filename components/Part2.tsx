
import React, { useState, useRef, useEffect } from 'react';
import { Chart, ChartConfiguration, Point } from 'chart.js';
import { normalizeAnswer, formatApiResult } from '../utils/formatter';
import { callGeminiAPI } from '../services/geminiService';
import Modal from './Modal';
import Loader from './Loader';

const chartDefaultOptions: ChartConfiguration['options'] = {
    maintainAspectRatio: false,
    scales: { x: { min: -10, max: 10, grid: { color: '#eee' } }, y: { min: -10, max: 10, grid: { color: '#eee' } } },
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
};

interface TransformationChartProps {
    originalData: Point[];
    transformedData: Point[];
}

const TransformationChart: React.FC<TransformationChartProps> = ({ originalData, transformedData }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.data.datasets[0].data = originalData;
                    chartInstance.current.data.datasets[1].data = transformedData;
                    chartInstance.current.update('none');
                } else {
                    chartInstance.current = new Chart(ctx, {
                        type: 'scatter',
                        data: {
                            datasets: [
                                { label: 'Original', data: originalData, borderColor: 'rgba(0,0,0,0.2)', borderWidth: 2, showLine: true, pointRadius: 0 },
                                { label: 'Transformed', data: transformedData, borderColor: '#D68A57', borderWidth: 3, showLine: true, pointRadius: 0 }
                            ]
                        },
                        options: chartDefaultOptions
                    });
                }
            }
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [originalData, transformedData]);

    return <div className="chart-container"><canvas ref={chartRef}></canvas></div>;
};

interface SymmetryCardProps {
    shape: 'line' | 'parabola' | 'circle';
    equation: string;
    equationDisplay: React.ReactNode;
    answers: { [key: string]: string[] };
    onInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const SymmetryCard: React.FC<SymmetryCardProps> = ({ shape, equation, equationDisplay, answers, onInputFocus }) => {
    const [selectedSym, setSelectedSym] = useState<string | null>(null);
    const [value, setValue] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isHintVisible, setHintVisible] = useState(false);
    const [isHintModalOpen, setHintModalOpen] = useState(false);
    const [hintContent, setHintContent] = useState<React.ReactNode>('');

    const handleSymSelect = (sym: string) => {
        setSelectedSym(sym);
        setValue('');
        setFeedback('');
        setIsCorrect(null);
        setHintVisible(false);
    };

    const checkAnswer = async () => {
        if (!selectedSym) {
            setFeedback('먼저 뒤집기 종류를 선택하세요.');
            setIsCorrect(null);
            return;
        }
        const correctAnswers = answers[selectedSym].map(normalizeAnswer);
        const userAnswer = normalizeAnswer(value);

        if (correctAnswers.includes(userAnswer)) {
            setFeedback('정답입니다! 원리를 이해했네요!');
            setIsCorrect(true);
            setHintVisible(false);
        } else {
            setFeedback('아쉬워요, 다시 한번 확인해볼까요?');
            setIsCorrect(false);
            setHintVisible(true);
        }
    };

    const handleHintClick = async () => {
        if (!selectedSym) return;
        setHintModalOpen(true);
        setHintContent(<Loader />);
        const symText = {'x-axis': 'x축', 'y-axis': 'y축', 'origin': '원점'}[selectedSym];
        const prompt = `학생이 '${equation}' 라는 모양을 '${symText}'에 대해 대칭이동한 식을 구하는 데 어려움을 겪고 있습니다. 대칭이동의 기본 원리(예: x축 대칭이면 y 대신 -y 대입)를 상기시켜주고, 이 원리를 주어진 식에 어떻게 적용하는지 단계별로 힌트를 주세요.`;
        const hintText = await callGeminiAPI(prompt, "You are a friendly high school math tutor in Korea. Explain concepts simply. Always respond in Korean.");
        setHintContent(formatApiResult(hintText));
    };

    const symLabels: { [key: string]: string } = { 'x-axis': 'x축 대칭', 'y-axis': 'y축 대칭', 'origin': '원점 대칭' };

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-center">{shape === 'line' ? '직선' : shape === 'parabola' ? '포물선' : '원'} 모양</p>
            <p className="text-md formula py-1 my-2 text-center">{equationDisplay}</p>
            <div className="flex justify-center space-x-1 my-2">
                {Object.keys(answers).map(sym => (
                    <button key={sym} onClick={() => handleSymSelect(sym)} className={`sym-act-btn text-xs px-2 py-1 rounded ${selectedSym === sym ? 'active' : ''}`}>
                        {symLabels[sym].split(' ')[0]}
                    </button>
                ))}
            </div>
            <p className="text-center text-sm font-semibold text-blue-600 h-6">
                {selectedSym ? `${symLabels[selectedSym]} 식은?` : '뒤집기 종류를 선택하세요'}
            </p>
            <div className="flex items-center justify-center mt-1">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={onInputFocus}
                    className={`activity-input border rounded-l-md p-2 w-full text-center ${isCorrect === true ? 'border-green-500' : ''} ${isCorrect === false ? 'border-red-500' : ''}`}
                    placeholder="뒤집힌 식 입력"
                    disabled={!selectedSym}
                />
                <button onClick={checkAnswer} className="check-sym-btn bg-gray-500 text-white px-4 py-2 rounded-r-md" disabled={!selectedSym}>확인</button>
            </div>
            <p className={`feedback-msg h-6 mt-1 text-sm font-medium text-center flex items-center justify-center ${isCorrect === true ? 'text-green-600' : ''} ${isCorrect === false ? 'text-red-600' : ''}`}>
                {feedback}
                {isHintVisible && <button onClick={handleHintClick} className="ai-hint-btn">✨ AI 힌트 보기</button>}
            </p>
            <Modal isOpen={isHintModalOpen} onClose={() => setHintModalOpen(false)} title="✨ AI 힌트 도우미">{hintContent}</Modal>
        </div>
    );
};


interface Part2Props {
    onInputFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const Part2: React.FC<Part2Props> = ({ onInputFocus }) => {
    // State for Translation
    const [a, setA] = useState(0);
    const [b, setB] = useState(0);
    const originalShape = [{x: 1, y: 1}, {x: 3, y: 1}, {x: 2, y: 3}, {x: 1, y: 1}];
    const translatedShape = originalShape.map(p => ({x: p.x + a, y: p.y + b}));

    const aStr = a >= 0 ? `+ ${a.toFixed(1)}` : `- ${-a.toFixed(1)}`;
    const bStr = b >= 0 ? `+ ${b.toFixed(1)}` : `- ${-b.toFixed(1)}`;
    const negAStr = a > 0 ? `- ${a.toFixed(1)}` : (a < 0 ? `+ ${-a.toFixed(1)}` : '');
    const negBStr = b > 0 ? `- ${b.toFixed(1)}` : (b < 0 ? `+ ${-b.toFixed(1)}` : '');

    // State for Reflection
    const [reflectionType, setReflectionType] = useState('x-axis');
    const reflectionShape = [{ x: 1, y: 2 }, { x: 4, y: 4 }, { x: 3, y: 1 }];
    let reflectedShape: Point[];
    let reflectionInfo = '';

    switch (reflectionType) {
        case 'y-axis':
            reflectedShape = reflectionShape.map(p => ({ x: -p.x, y: p.y }));
            reflectionInfo = `(<span class="math-var">x', y'</span>) = (<span class="math-var">-x, y</span>)  ➡️  <span class="math-var">x</span> 대신 <span class="math-var">-x</span> 대입`;
            break;
        case 'origin':
            reflectedShape = reflectionShape.map(p => ({ x: -p.x, y: -p.y }));
            reflectionInfo = `(<span class="math-var">x', y'</span>) = (<span class="math-var">-x, -y</span>) ➡️ <span class="math-var">x, y</span> 대신 <span class="math-var">-x, -y</span> 대입`;
            break;
        case 'x-axis':
        default:
            reflectedShape = reflectionShape.map(p => ({ x: p.x, y: -p.y }));
            reflectionInfo = `(<span class="math-var">x', y'</span>) = (<span class="math-var">x, -y</span>)  ➡️  <span class="math-var">y</span> 대신 <span class="math-var">-y</span> 대입`;
            break;
    }

    const symmetryAnswers = {
        line: { 'x-axis': ['-y=2x+1', 'y=-2x-1'], 'y-axis': ['y=2(-x)+1', 'y=-2x+1'], 'origin': ['-y=2(-x)+1', '-y=-2x+1', 'y=2x-1'] },
        parabola: { 'x-axis': ['-y=x^2-4x+5'], 'y-axis': ['y=(-x)^2-4(-x)+5', 'y=x^2+4x+5'], 'origin': ['-y=(-x)^2-4(-x)+5', '-y=x^2+4x+5'] },
        circle: { 'x-axis': ['(x-1)^2+(-y-2)^2=9', '(x-1)^2+(y+2)^2=9'], 'y-axis': ['(-x-1)^2+(y-2)^2=9', '(x+1)^2+(y-2)^2=9'], 'origin': ['(-x-1)^2+(-y-2)^2=9', '(x+1)^2+(y+2)^2=9'] }
    };

    return (
        <section id="part2" className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#4A5568] mb-12">만능 열쇠 <span className="math-var">f(x, y) = 0</span> 으로 모양 옮기기</h2>

            {/* 평행이동 */}
            <div className="mb-20">
                <h3 className="text-3xl font-bold text-center text-[#4A5568] mb-10">평행이동: 모양을 그대로 옮기기</h3>
                <div className="text-center mb-10 max-w-3xl mx-auto">
                    <p className="text-lg">"어떤 모양이 (<span className="math-var">x, y</span>) 지점에 있다"는 것은 "좌표 (<span className="math-var">x, y</span>)가 모양의 규칙을 만족한다"는 뜻입니다. 이 간단한 사실을 이용해 모양을 상하좌우로 옮기는 규칙을 직접 발견해 봅시다. 슬라이더를 움직여 모양을 옮겨보세요!</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <TransformationChart originalData={originalShape} transformedData={translatedShape} />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label htmlFor="slider-a" className="block text-center">가로로 옮기기 (→): <span id="a-value">{a.toFixed(1)}</span></label>
                                <input id="slider-a" type="range" min="-5" max="5" value={a} step="0.1" onChange={(e) => setA(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div>
                                <label htmlFor="slider-b" className="block text-center">세로로 옮기기 (↑): <span id="b-value">{b.toFixed(1)}</span></label>
                                <input id="slider-b" type="range" min="-5" max="5" value={b} step="0.1" onChange={(e) => setB(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="font-semibold">1. 옮기기 전후 모양의 위치 관계</p>
                            <p className="text-gray-700 formula p-3 mt-2 rounded-md text-lg"><span className="math-var">x' = x {aStr}</span>, &nbsp;&nbsp; <span className="math-var">y' = y {bStr}</span></p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="font-semibold">2. 원래 자리에 대해 정리하기</p>
                            <p className="text-gray-700 formula p-3 mt-2 rounded-md text-lg"><span className="math-var">x = x' {negAStr}</span>, &nbsp;&nbsp; <span className="math-var">y = y' {negBStr}</span></p>
                        </div>
                         <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-[#D68A57]">
                            <p className="font-bold text-[#D68A57]">3. 새로운 자리의 규칙 (유레카!)</p>
                            <p className="text-gray-700 formula p-3 mt-2 rounded-md text-xl font-bold"><span className="math-var">f(x' {negAStr}, y' {negBStr}) = 0</span></p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="font-semibold text-center mb-2">나의 발견 기록하기 📝</h4>
                            <p className="text-center text-sm text-gray-600 mb-4">모양을 <span className="math-var">x</span>축으로 <span className="math-var">a</span>만큼 옮겼을 때, 왜 식에는 <span className="math-var">x</span> 대신 <span className="math-var">x-a</span>를 대입하는지 자신의 언어로 설명해 보세요.</p>
                            <textarea
                                className="activity-input w-full h-24 p-3 border rounded-md focus:ring-[#D68A57] focus:border-[#D68A57]"
                                placeholder="옮겨진 점 (x', y') 입장에서 원래 점 (x, y)를 찾아 규칙에 대입해야 하기 때문에..."
                                onFocus={onInputFocus}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 대칭이동 */}
            <div>
                 <h3 className="text-3xl font-bold text-center text-[#4A5568] mb-10">대칭이동: 모양을 뒤집기</h3>
                 <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <p className="text-center text-lg mb-6">평행이동의 원리는 모양을 뒤집을 때도 똑같이 적용됩니다. 뒤집기 전 자리 (<span className="math-var">x, y</span>)와 뒤집은 후 자리 (<span className="math-var">x', y'</span>)의 관계만 알면 됩니다. 아래 버튼을 눌러 관계를 확인하고, 모양이 어떻게 변하는지 관찰해 보세요.</p>
                    <div className="lg:grid lg:grid-cols-2 gap-8 items-center">
                        <div className="mb-8 lg:mb-0">
                             <TransformationChart originalData={reflectionShape} transformedData={reflectedShape} />
                        </div>
                        <div className="flex flex-col space-y-4">
                            <div className="flex justify-center space-x-2">
                                <button onClick={() => setReflectionType('x-axis')} className={`px-4 py-2 rounded-md text-white ${reflectionType === 'x-axis' ? 'bg-blue-600' : 'bg-blue-400 hover:bg-blue-500'}`}>x축 대칭</button>
                                <button onClick={() => setReflectionType('y-axis')} className={`px-4 py-2 rounded-md text-white ${reflectionType === 'y-axis' ? 'bg-green-600' : 'bg-green-400 hover:bg-green-500'}`}>y축 대칭</button>
                                <button onClick={() => setReflectionType('origin')} className={`px-4 py-2 rounded-md text-white ${reflectionType === 'origin' ? 'bg-purple-600' : 'bg-purple-400 hover:bg-purple-500'}`}>원점 대칭</button>
                            </div>
                             <div className="text-center font-semibold text-lg h-16 formula p-4 rounded-md flex items-center justify-center" dangerouslySetInnerHTML={{ __html: reflectionInfo }}></div>
                        </div>
                    </div>
                    
                    <div className="mt-8 border-t pt-6">
                        <h4 className="text-xl font-bold text-center mb-6">직접 해보기: 원리를 이용해 모양 뒤집기</h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            <SymmetryCard
                                shape="line"
                                equation="y = 2x + 1"
                                equationDisplay={<><span className="math-var">y</span> = 2<span className="math-var">x</span> + 1</>}
                                answers={symmetryAnswers.line}
                                onInputFocus={onInputFocus}
                            />
                            <SymmetryCard
                                shape="parabola"
                                equation="y = x² - 4x + 5"
                                equationDisplay={<><span className="math-var">y</span> = <span className="math-var">x</span>² - 4<span className="math-var">x</span> + 5</>}
                                answers={symmetryAnswers.parabola}
                                onInputFocus={onInputFocus}
                            />
                            <SymmetryCard
                                shape="circle"
                                equation="(x-1)² + (y-2)² = 9"
                                equationDisplay={<>(<span className="math-var">x</span>-1)²+(<span className="math-var">y</span>-2)²=9</>}
                                answers={symmetryAnswers.circle}
                                onInputFocus={onInputFocus}
                            />
                        </div>
                    </div>
                 </div>
            </div>
        </section>
    );
};

export default Part2;

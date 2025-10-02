
import React from 'react';

interface ReflectionProps {
    onInputFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

const Reflection: React.FC<ReflectionProps> = ({ onInputFocus }) => {
    return (
        <section id="reflection-page" className="my-20">
            <h3 className="text-3xl font-bold text-center text-[#4A5568] mb-10">나의 생각 정리하기</h3>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* 평행이동 정리 */}
                    <div>
                        <h4 className="text-xl font-bold mb-4 text-center">평행이동</h4>
                        <p className="text-center text-sm text-gray-600 mb-4">
                            모양을 상하좌우로 옮길 때, 새로운 식은 어떻게 만들어졌나요? 핵심 원리를 자신의 언어로 정리해 보세요.
                        </p>
                        <textarea
                            id="parallel-summary"
                            className="activity-input w-full h-40 p-3 border rounded-md focus:ring-[#D68A57] focus:border-[#D68A57]"
                            placeholder="예) 옮긴 후의 점 (x', y')을 원래 점 (x, y)로 표현해서 f(x, y)=0에 대입한다..."
                            onFocus={onInputFocus}
                        />
                    </div>
                    {/* 대칭이동 정리 */}
                    <div>
                        <h4 className="text-xl font-bold mb-4 text-center">대칭이동</h4>
                        <p className="text-center text-sm text-gray-600 mb-4">
                            모양을 뒤집을 때도 평행이동과 같은 원리가 적용되었나요? 공통점과 차이점을 생각하며 정리해 보세요.
                        </p>
                        <textarea
                            id="symmetric-summary"
                            className="activity-input w-full h-40 p-3 border rounded-md focus:ring-[#D68A57] focus:border-[#D68A57]"
                            placeholder="예) 평행이동과 마찬가지로 이동 전후의 관계를 이용한다. x축 대칭은 y좌표의 부호가..."
                            onFocus={onInputFocus}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Reflection;

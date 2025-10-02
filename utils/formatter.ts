
export const normalizeAnswer = (str: string): string => {
    return str.replace(/\s/g, '').replace(/[²]/g, '^2').replace(/ｘ/g, 'x').replace(/ｙ/g, 'y');
};

export const formatApiResult = (text: string): string => {
    return text.replace(/\n/g, '<br>').replace(/\* /g, '• ');
}

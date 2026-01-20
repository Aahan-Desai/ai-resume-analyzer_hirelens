import type { FeedbackData } from '~/types'
import { cn } from '~/lib/utils'

const ATS = ({
    score,
    suggestions,
}: {
    score: number;
    suggestions: FeedbackData['ATS']['tips'];
}
) => {
    return (
        <div
            className={cn(
                "rounded-2xl shadow-md w-full bg-gradient-to-b to-light-white p-8 flex flex-col gap-4",
                score > 69
                    ? "from-green-100"
                    : score > 49
                        ? "from-yellow-100"
                        : "from-red-100"
            )}
        >
            <div className='flex flex-col gap-4 items-center'>
                <img src={
                    score > 69
                        ? "/icons/ats-good.svg"
                        : score > 49
                            ? "/icons/ats-warning.svg"
                            : "/icons/ats-bad.svg"
                } alt="ATSscore" />
                <h2 className='font-bold text-2xl color-gray-800'> ATS Score </h2>
                <p>Score is calculated based on the variables listed below </p>
            </div>
            <div className='flex flex-col gap-2'>
                <p className='font-medium text-xl'>
                    How well does Resume match pass the ATS?
                </p>
                <p className='text-lg text-gray-600'>
                    Your resume was scanned like an employer would. Here is how it performed.
                </p>
                {suggestions.map((suggestion, index) => (
                    <div className='flex flex-row gap-2 items-center' key={index}>
                        <img src={suggestion.type === 'good' ? '/icons/check.svg' : '/icons/warning.svg'} alt="ATS" className='w-4 h-4' />
                        <p className='text-sm'>{suggestion.tip}</p>
                    </div>
                ))}
                <p className='text-lg text-gray-500'>
                    Want a better score? Improve your resume by applying the suggestions listed below.
                </p>
            </div>
        </div>
    );
};

export default ATS
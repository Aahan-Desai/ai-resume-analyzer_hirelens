import type { FeedbackData } from '~/types'
import ScoreGauge from './ScoreGauge'

const Summary = ({ feedback }: { feedback: FeedbackData }) => {
    return (
        <div className='bg-white rounded-2xl shadow-md w-full'>
            <div className='flex flex-row items-center p-4 gap-8'>
                <ScoreGauge score={feedback.overallScore} />
            </div>
            <div className='flex flex-col gap-2'>
                <h2 className='font-bold text-2xl color-gray-800'> Your Resume Score </h2>
                <p>Score is calculated based on the variables listed below </p>
            </div>
        </div>
    )
}

export default Summary
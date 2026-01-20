import type { FeedbackData } from '~/types'
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordian";

const Details = ({ feedback }: { feedback: FeedbackData }) => {
    const sections = [
        { title: "Content & Impact", data: feedback.content },
        { title: "Structure & Layout", data: feedback.structure },
        { title: "Tone & Style", data: feedback.toneAndStyle },
        { title: "Skills Match", data: feedback.skills },
    ];

    return (
        <div className="flex flex-col gap-6 w-full">
            <h3 className="text-2xl font-bold text-gray-800">Detailed Feedback</h3>
            <Accordion allowMultiple className="flex flex-col gap-4">
                {sections.map((section, idx) => (
                    <AccordionItem
                        key={idx}
                        id={`section-${idx}`}
                        className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                        <AccordionHeader itemId={`section-${idx}`} className="hover:bg-gray-50">
                            <div className="flex justify-between items-center w-full pr-4">
                                <span className="font-semibold text-lg">{section.title}</span>
                                <span className={`font-bold ${section.data.score >= 80 ? 'text-green-600' : section.data.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {section.data.score}/100
                                </span>
                            </div>
                        </AccordionHeader>
                        <AccordionContent itemId={`section-${idx}`}>
                            <div className="flex flex-col gap-3 py-2">
                                {section.data.tips.map((tip, tipIdx) => (
                                    <div
                                        key={tipIdx}
                                        className={`p-4 rounded-lg text-sm ${tip.type === "good"
                                                ? "bg-green-50 text-green-800 border-l-4 border-green-500"
                                                : "bg-red-50 text-red-800 border-l-4 border-red-500"
                                            }`}
                                    >
                                        <p className="font-bold">{tip.tip}</p>
                                        {tip.explanation && (
                                            <p className="mt-1 opacity-90">{tip.explanation}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

export default Details;

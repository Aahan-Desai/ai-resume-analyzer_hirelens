
import React, { useEffect, useState, useRef, } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import Navbar from '~/components/Navbar';
import { usePuterStore } from '~/lib/puter';
import { prepareInstructions, AIResponseFormat } from '~/constants';
import ATS from '~/components/ATS';
import Summary from '~/components/Summary';
import Details from '~/components/Details';

export const meta = () => ([
    { title: 'HireLens | Review' },
    { name: "description", content: "Detailed overview of your resume" }
]);

interface FeedbackTip {
    type: "good" | "improve";
    tip: string;
    explanation?: string;
}

interface FeedbackSection {
    score: number;
    tips: FeedbackTip[];
}

interface FeedbackData {
    overallScore: number;
    ATS: FeedbackSection;
    toneAndStyle: FeedbackSection;
    content: FeedbackSection;
    structure: FeedbackSection;
    skills: FeedbackSection;
}

interface ResumeData {
    id: string;
    createdAt: number;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    image: string;
    file: string;
    feedback: FeedbackData | null;
}

const ScoreCard = ({ title, score, tips }: { title: string, score: number, tips: FeedbackTip[] }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
            <div className={`text-xl font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {score}/100
            </div>
        </div>
        <div className="flex flex-col gap-3 mt-2">
            {tips.map((tip, index) => (
                <div key={index} className={`p-3 rounded-lg text-sm ${tip.type === 'good' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
                    <p className="font-semibold">{tip.tip}</p>
                    {tip.explanation && <p className="mt-1 opacity-90">{tip.explanation}</p>}
                </div>
            ))}
        </div>
    </div>
);

export default function Result() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { kv, ai, fs } = usePuterStore();
    const [data, setData] = useState<ResumeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const analysisStarted = useRef(false);
    const [resumeUrl, setresumeUrl] = useState<string | null>(null);
    const [imageUrl, setimageUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchBaseData = async () => {
            if (!id) return;
            try {
                const storedData = await kv.get(`resume:${id}`);
                if (!storedData) {
                    console.error("No data found for ID:", id);
                    navigate('/');
                    return;
                }
                const parsedData: ResumeData = JSON.parse(storedData);
                setData(parsedData);

                // Load binary data as URLs
                if (parsedData.file) {
                    console.log("Reading PDF from:", parsedData.file);
                    try {
                        const resumeBlob = await fs.read(parsedData.file);
                        console.log("PDF read success:", resumeBlob instanceof Blob);
                        if (resumeBlob instanceof Blob) {
                            setresumeUrl(URL.createObjectURL(resumeBlob));
                        } else if (resumeBlob) {
                            const blob = new Blob([resumeBlob], { type: 'application/pdf' });
                            setresumeUrl(URL.createObjectURL(blob));
                        }
                    } catch (e) {
                        console.error("Failed to read PDF:", e);
                    }
                }

                if (parsedData.image) {
                    try {
                        const imgBlob = await fs.read(parsedData.image);
                        if (imgBlob instanceof Blob) {
                            setimageUrl(URL.createObjectURL(imgBlob));
                        } else if (imgBlob) {
                            const blob = new Blob([imgBlob], { type: 'image/jpeg' });
                            setimageUrl(URL.createObjectURL(blob));
                        }
                    } catch (e) {
                        console.error("Failed to read Image:", e);
                    }
                }
            } catch (error) {
                console.error("Failed to load result:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBaseData();
    }, [id, kv, fs, navigate]);

    useEffect(() => {
        const runAnalysis = async () => {
            if (!data || data.feedback || analyzing || analysisStarted.current) return;

            analysisStarted.current = true;
            setAnalyzing(true);

            try {
                const feedbackResponse = await ai.feedback(
                    data.file,
                    prepareInstructions({
                        jobTitle: data.jobTitle,
                        jobDescription: data.jobDescription,
                        AIResponseFormat
                    })
                );

                if (!feedbackResponse) throw new Error('Failed to analyze resume');

                let feedbackContent = '';
                if (typeof feedbackResponse.message.content === 'string') {
                    feedbackContent = feedbackResponse.message.content;
                } else if (Array.isArray(feedbackResponse.message.content) && feedbackResponse.message.content.length > 0) {
                    feedbackContent = feedbackResponse.message.content[0].text;
                }

                if (!feedbackContent) {
                    throw new Error('Received invalid feedback from AI');
                }

                const parsedFeedback: FeedbackData = JSON.parse(feedbackContent);
                const updatedData = { ...data, feedback: parsedFeedback };

                setData(updatedData);
                await kv.set(`resume:${id}`, JSON.stringify(updatedData));

            } catch (err) {
                console.error("Analysis failed:", err);
            } finally {
                setAnalyzing(false);
            }
        };

        if (data && !data.feedback) {
            runAnalysis();
        }
    }, [data, ai, kv, id, analyzing]);

    if (loading && !data) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl text-gray-500 animate-pulse">Loading...</p>
                </div>
            </main>
        );
    }

    if (!data) return null;

    return (
        <main className="min-h-screen bg-[url('/images/bg-main.svg')] bg-fixed bg-cover !pt-0">
            <nav className='resume-nav'>
                <Link to="/" className='back-button' >
                    <img src="/icons/back.svg" alt="logo" className='h-4 w-4' />
                    <span className='text-gray-800 text-sm font-semibold'>Back to Homepage</span>
                </Link>
            </nav>
            <div className='flex flex-row w-full max-lg:flex-col p-6 gap-8'>
                <section className="lg:w-1/2 flex flex-col gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 overflow-hidden h-fit max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 sticky top-0 bg-white z-10 py-2 border-b">Uploaded Resume</h2>
                        <div className="w-full bg-gray-100 rounded-lg overflow-hidden relative">
                            <img
                                src={imageUrl || data.image}
                                alt="Resume Preview"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                        {resumeUrl && (
                            <a
                                href={resumeUrl}
                                download={`${data.jobTitle}_Resume.pdf`}
                                className="mt-4 block text-center py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
                            >
                                Download PDF
                            </a>
                        )}
                    </div>
                </section>

                <section className="lg:w-1/2 flex flex-col gap-8">
                    <h2 className='text-4xl text-black font-bold'>Resume Review</h2>
                    {data.feedback && typeof data.feedback === 'object' ? (
                        <div className='flex flex-col gap-8 animate-in fade-in duration-1000'>
                            <Summary feedback={data.feedback as any} />
                            <ATS score={(data.feedback as any).ATS.score || 0} suggestions={(data.feedback as any).ATS.tips || []} />
                            <Details feedback={data.feedback as any} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-6 py-20">
                            <img src="/images/scan-2.gif" className='w-64 h-64 object-contain' />
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing your resume...</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Our AI is checking ATS compatibility and generating personalized feedback.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>

        </main>
    );
}

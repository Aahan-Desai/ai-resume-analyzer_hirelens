import React, { type FormEvent } from 'react'
import Navbar from '~/components/Navbar'
import FileUploader from '~/components/FileUploader'
import { useState } from 'react'
import { usePuterStore } from '~/lib/puter'
import { convertPdfToImage } from '~/lib/pdf2img'
import { useNavigate } from 'react-router'
import { generateUUID, cleanAIResponse } from '~/lib/utils'
import { prepareInstructions, AIResponseFormat } from '~/constants'
import { MOCK_FEEDBACK } from '~/constants/mock'


const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isTestMode, setIsTestMode] = useState(false);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }
    const handleAnalyzer = async ({ jobDescription, jobTitle, companyName, file }: { jobDescription: string, jobTitle: string, companyName: string, file: File }) => {
        try {
            setIsProcessing(true);
            const uuid = generateUUID();

            if (isTestMode) {
                setStatusText('Generating Test Results...');
                // Bypass all uploads and processing in Test Mode
                await new Promise(resolve => setTimeout(resolve, 2000));

                const data = {
                    id: uuid,
                    createdAt: Date.now(),
                    jobDescription,
                    jobTitle,
                    companyName,
                    file: '/mock/resume.pdf',
                    image: '/images/resume_01.png', // Using a local asset for preview
                    feedback: MOCK_FEEDBACK
                }

                await kv.set(`resume:${uuid}`, JSON.stringify(data));
                setStatusText('Analysis Complete, redirecting...')
                navigate(`/resume/${uuid}`);
                return;
            }

            setStatusText('Analyzing your resume...');
            const uploadedFiles = await fs.upload([file]);
            if (!uploadedFiles || (Array.isArray(uploadedFiles) && uploadedFiles.length === 0)) {
                throw new Error('Failed to upload file');
            }
            const uploadedFile = Array.isArray(uploadedFiles) ? uploadedFiles[0] : uploadedFiles;

            setStatusText('Converting pdf to image');
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) {
                console.error("PDF Conversion Error:", imageFile.error);
                throw new Error(`Failed to convert pdf to image: ${imageFile.error || 'Unknown error'}`);
            }
            setStatusText('Uploading Image...');
            const uploadedImages = await fs.upload([imageFile.file]);
            if (!uploadedImages || (Array.isArray(uploadedImages) && uploadedImages.length === 0)) {
                throw new Error('Failed to upload image');
            }
            const uploadedImage = Array.isArray(uploadedImages) ? uploadedImages[0] : uploadedImages;

            setStatusText('Preparing data...');
            const data = {
                id: uuid,
                createdAt: Date.now(),
                jobDescription,
                jobTitle,
                companyName,
                file: uploadedFile.path,
                image: uploadedImage.path,
                feedback: null as any
            }

            setStatusText('Analyzing...');
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({
                    jobTitle,
                    jobDescription,
                    AIResponseFormat
                })
            );
            if (!feedback) throw new Error('Failed to analyze resume');

            let feedbackContent = '';
            if (typeof feedback.message.content === 'string') {
                feedbackContent = feedback.message.content;
            } else if (Array.isArray(feedback.message.content) && feedback.message.content.length > 0) {
                feedbackContent = feedback.message.content[0].text;
            }

            if (!feedbackContent) {
                console.error('Invalid feedback format:', feedback);
                throw new Error('Received invalid feedback from AI');
            }

            const cleanedContent = cleanAIResponse(feedbackContent);
            console.log('Cleaned AI Response:', cleanedContent);
            data.feedback = JSON.parse(cleanedContent);

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis Complete, redirecting...')
            navigate(`/resume/${uuid}`);
        } catch (error) {
            console.error('Detailed Debug Error:', error);

            let errorMessage = 'Unknown error occurred';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object') {
                try {
                    errorMessage = JSON.stringify(error);
                } catch {
                    errorMessage = String(error);
                }
            } else {
                errorMessage = String(error);
            }

            setStatusText(`Error: ${errorMessage}`);
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('Company Name') as string;
        const jobTitle = formData.get('Job Title') as string;
        const jobDescription = formData.get('Job Description') as string;

        if (!file) return;

        handleAnalyzer({ jobDescription, jobTitle, companyName, file })
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] p-3">
            <Navbar />

            <section className="main-section items-center">
                <div className="page-heading py-16">
                    <h1 className=''>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-2 -mt-4">
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className='w-full max-w-2xl' />
                        </div>
                    ) :
                        (
                            <div className="flex flex-col gap-2">
                                <h2>Upload your resume for an ATS score and improvement tip</h2>
                                {statusText && statusText.includes('Error') && (
                                    <div className="flex flex-col gap-2 items-center text-center">
                                        <p className="text-red-500 font-bold">{statusText}</p>
                                        {(statusText.toLowerCase().includes('balance') || statusText.toLowerCase().includes('credit')) && (
                                            <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-4 rounded-xl mt-2 max-w-lg">
                                                <p className="font-semibold mb-1">💡 Out of Credits?</p>
                                                <p className="text-sm">Your Puter account has run out of AI balance. Enable <b>"Test Mode"</b> below to continue designing and testing with mock data for free!</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    }
                    {!isProcessing && (
                        <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4'>
                            <div className='form-div'>
                                <label htmlFor='Company Name'>Company Name</label>
                                <input type="text" id='Company Name' name='Company Name' placeholder='Company Name' required />
                            </div>
                            <div className='form-div'>
                                <label htmlFor='Job Title'>Job Title</label>
                                <input type="text" id='Job Title' name='Job Title' placeholder='Job Title' required />
                            </div>
                            <div className='form-div'>
                                <label htmlFor='Job Description'>Job Description</label>
                                <textarea rows={5} name='Job Description' placeholder='Job Description' required />
                            </div>
                            <div className="form-div">
                                <label htmlFor="Upload Resume">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>
                            <button className='primary-button' type='submit'>Analyze Resume</button>

                            <div className="flex items-center gap-2 mt-2 bg-indigo-50 p-3 rounded-xl border border-indigo-100 self-stretch justify-center">
                                <input
                                    type="checkbox"
                                    id="test-mode"
                                    checked={isTestMode}
                                    onChange={(e) => setIsTestMode(e.target.checked)}
                                    className="w-5 h-5 accent-indigo-600 cursor-pointer"
                                />
                                <label htmlFor="test-mode" className="text-sm font-semibold text-indigo-700 cursor-pointer select-none">
                                    Enable Test Mode (Bypass AI credits)
                                </label>
                            </div>
                        </form>
                    )}

                </div>
            </section>
        </main>
    )
}

export default Upload
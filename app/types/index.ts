export interface FeedbackTip {
    type: "good" | "improve";
    tip: string;
    explanation?: string;
}

export interface FeedbackSection {
    score: number;
    tips: FeedbackTip[];
}

export interface FeedbackData {
    overallScore: number;
    ATS: FeedbackSection;
    toneAndStyle: FeedbackSection;
    content: FeedbackSection;
    structure: FeedbackSection;
    skills: FeedbackSection;
}

export interface ResumeData {
    id: string;
    createdAt?: number;
    companyName: string;
    jobTitle: string;
    imagePath?: string;
    image?: string;
    resumePath?: string;
    file?: string;
    feedback: FeedbackData;
}

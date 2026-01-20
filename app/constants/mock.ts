export const MOCK_FEEDBACK = {
    overallScore: 82,
    ATS: {
        score: 88,
        tips: [
            { type: "good", tip: "Action verbs are used effectively throughout the experience section." },
            { type: "improve", tip: "Consider adding more industry-specific keywords to pass automated filters." },
            { type: "good", tip: "Contact information is clear and professional." }
        ]
    },
    toneAndStyle: {
        score: 85,
        tips: [
            {
                type: "good",
                tip: "Professional Tone",
                explanation: "The resume maintains a consistently professional and confident tone that aligns with corporate expectations."
            },
            {
                type: "improve",
                tip: "Active Voice",
                explanation: "Some bullet points use passive language. Switching to active-voice verbs (e.g., 'Led' instead of 'Was responsible for') will create a stronger impact."
            }
        ]
    },
    content: {
        score: 78,
        tips: [
            {
                type: "improve",
                tip: "Quantify Achievements",
                explanation: "Whenever possible, use numbers and percentages (e.g., 'Increased revenue by 20%') to provide concrete proof of your impact."
            },
            {
                type: "good",
                tip: "Clear Hierarchy",
                explanation: "The sequence of your sections (Experience, Education, Skills) follows the standard reverse-chronological format preferred by recruiters."
            }
        ]
    },
    structure: {
        score: 92,
        tips: [
            {
                type: "good",
                tip: "Consistent Formatting",
                explanation: "Fonts, sizes, and spacing are uniform, which makes the document very easy to skim."
            }
        ]
    },
    skills: {
        score: 80,
        tips: [
            {
                type: "improve",
                tip: "Soft Skills Context",
                explanation: "Instead of just listing 'Leadership', show how you used it in your job descriptions to provide better context."
            }
        ]
    }
};

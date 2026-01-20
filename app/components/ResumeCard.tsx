import React, { useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "./ScoreCards";
import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import type { ResumeData } from "~/types";

const ResumeCard = ({
  resume,
  onDelete,
}: {
  resume: ResumeData;
  onDelete: (id: string, filePath?: string, imagePath?: string) => void;
}) => {

  const { companyName, jobTitle, id, feedback, image, imagePath } = resume;
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    const loadResume = async () => {
      const path = image || imagePath;
      if (!path) return;

      // If it looks like a local mock image path, just use it
      if (path.startsWith('/images/')) {
        setResumeUrl(path);
        return;
      }

      try {
        const data = await fs.read(path);
        if (!data) return;

        // Ensure we have a Blob for createObjectURL
        const blob = data instanceof Blob ? data : new Blob([data], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setResumeUrl(url);
      } catch (error) {
        console.error("Failed to load resume image:", error);
      }
    };
    loadResume();
  }, [fs, image, imagePath]);

  return (
    <div className="group relative">
      <Link to={`/resume/${id}`} className="resume-card block">
        <div className="resume-card-header flex w-full items-center">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {companyName && (
              <h2 className="text-black font-bold truncate">
                {companyName}
              </h2>
            )}
            {jobTitle && (
              <h3 className="text-gray-500 text-sm truncate">{jobTitle}</h3>
            )}
            {!companyName && !jobTitle && (
              <h2 className="text-black font-bold">Resume</h2>
            )}
          </div>
          <div className="shrink-0 ml-4">
            <ScoreCircle score={feedback.overallScore} />
          </div>
        </div>
        {resumeUrl && (
          <div className="gradient-border animate-in fade-in duration-1000 mt-4 overflow-hidden rounded-lg">
            <img
              src={resumeUrl}
              alt=""
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
            />
          </div>
        )}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(id, resume.file, resume.image);
        }}
        className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-700 shadow-sm border border-red-100"
        title="Delete Resume"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </button>
    </div>

  );
};

export default ResumeCard;

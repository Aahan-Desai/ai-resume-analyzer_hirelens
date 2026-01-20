import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useNavigate, useLocation, Link } from "react-router";
import { useEffect, useState } from "react";
import type { ResumeData } from "~/types";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Hirelens" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, isLoading, kv, fs } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [resume, setresume] = useState<ResumeData[]>([]);
  const [loadingResumes, setloadingResumes] = useState(false);



  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate('/auth?next=/');

  }, [auth.isAuthenticated, isLoading, navigate]);

  const loadResumes = async () => {
    setloadingResumes(true);
    const items = (await kv.list('resume:*', true)) as KVItem[];
    const parsedResumes = items?.map((item) => (
      JSON.parse(item.value) as ResumeData
    )).filter(r => r && typeof r.feedback === 'object')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setresume(parsedResumes || []);
    setloadingResumes(false);
  }

  useEffect(() => {
    loadResumes();
  }, [kv]);

  const handleDelete = async (id: string, filePath?: string, imagePath?: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        await kv.delete(`resume:${id}`);
        if (filePath) await fs.delete(filePath);
        if (imagePath) await fs.delete(imagePath);
        setresume(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error("Failed to delete resume:", error);
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all resumes? This cannot be undone. Files will also be deleted from storage.")) {
      try {
        // Delete each item's files first
        for (const item of resume) {
          if (item.file) await fs.delete(item.file);
          if (item.image) await fs.delete(item.image);
        }
        await kv.flush();
        setresume([]);
      } catch (error) {
        console.error("Failed to clear all resumes:", error);
      }
    }
  };



  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading">
          <h1>Track your Applications and Resume here</h1>
          {!loadingResumes && resume.length === 0 ? (
            <h2>No resumes found.Upload your first resume to get feedback</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback</h2>
          )}
          {!loadingResumes && resume.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer transition-colors"
            >
              Clear all resumes
            </button>
          )}
        </div>
        {loadingResumes && (
          <div className="flex flex-col justify-center items-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}

        {!loadingResumes && resume.length > 0 && (
          <div className="resumes-section grid grid-cols-3 gap-6 mt-10">
            {resume.map((item) => (
              <ResumeCard key={item.id} resume={item} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {!loadingResumes && resume.length === 0 && (
          <div className="flex flex-col justify-center items-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit font-semibold text-xl">
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

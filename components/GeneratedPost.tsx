
import React, { useState } from 'react';
import { Agent, PostContent } from '../types';

interface GeneratedPostProps {
  agent: Agent;
  post: PostContent;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2 right-2 bg-gray-800/50 text-white p-1.5 rounded-md hover:bg-gray-700 transition"
            aria-label="Copy to clipboard"
        >
            {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                </svg>
            )}
        </button>
    );
};

export const GeneratedPost: React.FC<GeneratedPostProps> = ({ agent, post }) => {
  const hashtagsText = post.hashtags.map(h => `#${h}`).join(' ');

  return (
     <div className="flex items-start gap-3 justify-start">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
          {agent.icon}
        </div>
        <div className="max-w-lg lg:max-w-xl w-full">
            <p className="font-bold text-sm text-indigo-300 mb-1">{agent.name}</p>
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <div className="p-4">
                    <p className="font-bold text-lg text-indigo-300 mb-2">Here is your ready-to-publish post!</p>
                </div>
                <img src={post.imageUrl} alt="Generated for post" className="w-full h-auto object-cover aspect-square" />
                <div className="p-4 space-y-4">
                    <div className="relative">
                        <h3 className="font-semibold text-gray-300 mb-1">Caption</h3>
                        <div className="bg-gray-700 p-3 rounded-lg">
                            <p className="text-gray-200 whitespace-pre-wrap">{post.caption}</p>
                            <CopyButton textToCopy={post.caption} />
                        </div>
                    </div>
                     <div className="relative">
                        <h3 className="font-semibold text-gray-300 mb-1">Hashtags</h3>
                        <div className="bg-gray-700 p-3 rounded-lg">
                            <p className="text-indigo-400 break-words">{hashtagsText}</p>
                            <CopyButton textToCopy={hashtagsText} />
                        </div>
                    </div>
                </div>
                 <div className="bg-gray-900/50 p-4 text-center">
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg transition duration-200">
                        Schedule Post
                    </button>
                 </div>
            </div>
        </div>
    </div>
  );
};

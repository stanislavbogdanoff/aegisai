'use client'

import { useState } from 'react'
import { generateSecureCode, type Vulnerability, type SecureCodeResponse } from '@/app/actions'
import { IconLoader2, IconAlertTriangle, IconChevronDown, IconChevronUp, IconAlertCircle, IconCode, IconTerminal2, IconCopy, IconCheck } from '@tabler/icons-react'

// Sample response data for development without API calls
const SAMPLE_RESPONSE: SecureCodeResponse = {
  secureCode: `// Secure version of the code
function processUserInput(input) {
  // Input is sanitized before use
  const sanitizedInput = DOMPurify.sanitize(input);
  
  // Prepared statement used instead of string concatenation
  const query = 'SELECT * FROM users WHERE username = ?';
  const stmt = connection.prepare(query);
  const result = stmt.get(sanitizedInput);
  
  return result;
}`,
  vulnerabilities: [
    {
      description: "SQL Injection vulnerability in database query. The original code used string concatenation to build SQL queries which allows attackers to inject malicious SQL commands.",
      severity: "high",
      location: "Line 5 in function processUserInput()",
      solution: "Used prepared statements with parameterized queries instead of concatenating strings."
    },
    {
      description: "Cross-Site Scripting (XSS) vulnerability due to unfiltered user input being processed. User input was not sanitized before use.",
      severity: "medium",
      location: "Throughout the function where input is used",
      solution: "Added input sanitization using DOMPurify before processing user input."
    }
  ]
};

export default function AegisChatBot() {
  const [prompt, setPrompt] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [secureCode, setSecureCode] = useState<string>('')
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [expandedVulnerability, setExpandedVulnerability] = useState<number | null>(null)
  const [useSampleData, setUseSampleData] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  async function onSubmit() {
    try {
      setIsLoading(true)
      
      let result: SecureCodeResponse;
      
      if (useSampleData) {
        // Use sample data instead of making an API call
        console.log('Using sample data (no API call made)');
        result = SAMPLE_RESPONSE;
      } else {
        // Make the actual API call
        result = await generateSecureCode(prompt);
        // Log the full response to console for later reuse
        console.log('API Response:');
        console.log(JSON.stringify(result, null, 2));
      }
      
      setSecureCode(result.secureCode)
      setVulnerabilities(result.vulnerabilities)
    } catch (error) {
      console.error('Error generating secure code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'medium':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'low':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  const toggleVulnerability = (index: number) => {
    if (expandedVulnerability === index) {
      setExpandedVulnerability(null)
    } else {
      setExpandedVulnerability(index)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(secureCode);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto relative z-10 flex items-center space-x-4 rounded-sm flex-col bg-zinc-950/50 p-10 ring-1 ring-white/10 backdrop-blur-md">
      <h2 className="text-2xl font-medium text-zinc-800 dark:text-zinc-100 mb-6">
        AegisAI – Secure Code Generator
      </h2>

      <div className="w-full flex flex-col items-center gap-4 mb-6">
        <div className="w-full rounded-lg overflow-hidden shadow-lg ring-1 ring-zinc-400/10 dark:ring-zinc-700/30">
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-b border-zinc-300/70 dark:border-zinc-700/80">
            <div className="flex items-center">
              <IconTerminal2 className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Code Input</span>
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSampleData}
                  onChange={() => setUseSampleData(!useSampleData)}
                  className="mr-2 h-3.5 w-3.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Use sample data</span>
              </label>
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-b from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border-r border-zinc-300/50 dark:border-zinc-700/50 flex flex-col items-center py-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              {Array.from({ length: Math.max(1, prompt.split('\n').length) }).map((_, i) => (
                <div key={i} className="leading-6 w-full text-center">{i + 1}</div>
              ))}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste your code here for security analysis..."
              className="min-h-[400px] w-full pl-14 pr-4 py-3 bg-gradient-to-b from-zinc-50/90 to-white dark:from-slate-900/90 dark:to-slate-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none font-mono text-sm leading-6 resize-none"
              spellCheck="false"
            />
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isLoading || !prompt}
          className="no-underline w-lg group cursor-pointer relative shadow-2x rounded-full p-px text-xs font-semibold leading-6  text-white inline-block"
        >
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </span>
          <div className="relative flex space-x-2 items-center justify-center z-10 rounded-full bg-zinc-950/50 py-2 px-7 ring-1 ring-white/10 ">
            <span className="text-[16px] font-medium text-center">
              {isLoading && <IconLoader2 className="w-5 h-5 animate-spin" />}
              {!isLoading && (useSampleData ? 'Use Sample Data' : 'Analyze & Secure Code')}
            </span>
          </div>
          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
        </button>
      </div>

      {vulnerabilities.length > 0 && (
        <div className="w-full mb-6">
          <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-4 flex items-center">
            <IconAlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
            Vulnerabilities Detected ({vulnerabilities.length})
          </h3>
          <div className="space-y-3">
            {vulnerabilities.map((vulnerability, index) => (
              <div 
                key={index}
                className="border border-zinc-800 rounded-lg overflow-hidden"
              >
                <div 
                  className={`px-4 py-3 flex justify-between items-center cursor-pointer ${getSeverityColor(vulnerability.severity)}`}
                  onClick={() => toggleVulnerability(index)}
                >
                  <div className="flex items-center">
                    <IconAlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">{vulnerability.description.split('.')[0]}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs uppercase font-semibold mr-3 px-2 py-1 rounded-full border">
                      {vulnerability.severity}
                    </span>
                    {expandedVulnerability === index ? (
                      <IconChevronUp className="w-5 h-5" />
                    ) : (
                      <IconChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
                {expandedVulnerability === index && (
                  <div className="px-4 py-3 bg-zinc-900 text-zinc-200 border-t border-zinc-800">
                    <div className="mb-2">
                      <span className="text-zinc-400 text-sm">Description:</span>
                      <p className="mt-1">{vulnerability.description}</p>
                    </div>
                    {vulnerability.location && (
                      <div className="mb-2">
                        <span className="text-zinc-400 text-sm">Location:</span>
                        <p className="mt-1">{vulnerability.location}</p>
                      </div>
                    )}
                    {vulnerability.solution && (
                      <div className="mb-2">
                        <span className="text-zinc-400 text-sm">Solution:</span>
                        <p className="mt-1">{vulnerability.solution}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {secureCode && (
        <div className="mt-6 w-full max-h-[400px] overflow-auto">
          <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-2">
            Generated Secure Code:
          </h3>
          <div className="rounded-lg overflow-hidden shadow-lg ring-1 ring-zinc-400/10 dark:ring-zinc-700/30">
            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 border-b border-zinc-300/70 dark:border-zinc-700/80">
              <div className="flex items-center">
                <IconCode className="w-4 h-4 mr-2 text-emerald-500 dark:text-emerald-400" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Secure Code</span>
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center text-xs px-2 py-1 rounded bg-zinc-200/70 dark:bg-zinc-700/70 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                {isCopied ? (
                  <>
                    <IconCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="w-3.5 h-3.5 mr-1" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gradient-to-b from-zinc-50/90 to-white dark:from-slate-900/90 dark:to-slate-950 p-4 overflow-x-auto text-sm text-left text-zinc-800 dark:text-zinc-100 font-mono">
              <code>{secureCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

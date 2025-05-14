'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { generateSecureCode, type Vulnerability, type SecureCodeResponse, type CodeDiff } from '@/app/actions'
import { IconLoader2, IconAlertTriangle, IconChevronDown, IconChevronUp, IconAlertCircle, IconCode, IconTerminal2, IconCopy, IconCheck, IconShield, IconBug, IconMapPin, IconTools, IconExchange, IconColumns, IconMaximize, IconMinimize, IconX, IconInfoCircle } from '@tabler/icons-react'

// Sample response data for development without API calls
const SAMPLE_RESPONSE: SecureCodeResponse = {
  secureCode: `function processUserInput(input) {
  const sanitizedInput = DOMPurify.sanitize(input);
  
  const query = 'SELECT * FROM users WHERE username = ?';
  const stmt = connection.prepare(query);
  const result = stmt.get(sanitizedInput);
  
  return result;
}`,
  vulnerabilities: [
    {
      description: "SQL Injection vulnerability in database query. The original code used string concatenation to build SQL queries which allows attackers to inject malicious SQL commands.",
      severity: "high",
      cvssScore: 8.6,
      cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:N",
      location: "Line 4 in function processUserInput()",
      solution: "Used prepared statements with parameterized queries instead of concatenating strings."
    },
    {
      description: "Cross-Site Scripting (XSS) vulnerability due to unfiltered user input being processed. User input was not sanitized before use.",
      severity: "medium",
      cvssScore: 6.1,
      cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
      location: "Line 2 where input is used directly",
      solution: "Added input sanitization using DOMPurify before processing user input."
    },
    {
      description: "Insecure Direct Object Reference (IDOR) vulnerability allows attackers to access unauthorized resources by manipulating reference parameters.",
      severity: "high",
      cvssScore: 7.5,
      cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N",
      location: "Line 5 in function getUserData()",
      solution: "Implemented proper authorization checks before accessing user data."
    },
    {
      description: "Path Traversal vulnerability allows attackers to access files and directories outside of the intended directory through manipulating file paths.",
      severity: "high",
      cvssScore: 7.7,
      cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:N/A:N",
      location: "Line 12 in fileDownload function",
      solution: "Used path normalization and validation to prevent directory traversal."
    },
    {
      description: "Insecure cryptographic storage due to the use of an outdated and weak hashing algorithm (MD5) for password storage.",
      severity: "medium",
      cvssScore: 6.5,
      cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
      location: "Line 23 in hashPassword function",
      solution: "Replaced MD5 with bcrypt, a strong adaptive hashing function designed specifically for password hashing."
    },
    {
      description: "Open Redirect vulnerability allows attackers to redirect users to malicious websites by manipulating the redirect URL parameter.",
      severity: "medium",
      cvssScore: 5.4,
      cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
      location: "Line 38 in redirect function",
      solution: "Implemented URL validation and whitelist of allowed domains for redirects."
    },
    {
      description: "XML External Entity (XXE) vulnerability allows attackers to read sensitive files or perform server side request forgery by injecting malicious XML.",
      severity: "high",
      cvssScore: 8.2,
      cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:L",
      location: "Line 45 in processXML function",
      solution: "Disabled external entity processing in the XML parser configuration."
    },
    {
      description: "Hardcoded credentials in the source code expose sensitive authentication information that could lead to unauthorized access.",
      severity: "high",
      cvssScore: 9.1,
      cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      location: "Line 57 - Database connection string",
      solution: "Moved credentials to environment variables and implemented secure configuration management."
    },
    {
      description: "Insecure random number generation using Math.random() which is not cryptographically secure and can be predicted.",
      severity: "low",
      cvssScore: 3.7,
      cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:N",
      location: "Line 72 in generateToken function",
      solution: "Used the crypto.getRandomValues() API for cryptographically secure random values."
    },
    {
      description: "Missing rate limiting could allow brute force attacks against authentication endpoints.",
      severity: "medium",
      cvssScore: 5.3,
      cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N",
      location: "Line 89 in login function",
      solution: "Implemented rate limiting and account lockout mechanisms after multiple failed attempts."
    },
    {
      description: "Improper certificate validation bypasses TLS security by accepting any certificate without verification.",
      severity: "high",
      cvssScore: 8.1,
      cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H",
      location: "Line 103 in HTTP client configuration",
      solution: "Enabled proper certificate validation in the HTTP client."
    },
    {
      description: "Sensitive data exposure through detailed error messages that reveal implementation details and stack traces.",
      severity: "low",
      cvssScore: 3.5,
      cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N",
      location: "Line 134 in error handling",
      solution: "Implemented generic error messages for production and proper logging for debugging."
    },
    {
      description: "Cross-Site Request Forgery (CSRF) vulnerability allows attackers to perform actions on behalf of authenticated users who visit a malicious website.",
      severity: "medium",
      cvssScore: 6.4,
      cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:N",
      location: "Line 149 in form handling",
      solution: "Implemented anti-CSRF tokens for all sensitive operations."
    },
    {
      description: "Missing Content Security Policy (CSP) header increases risk of XSS and other client-side attacks.",
      severity: "low",
      cvssScore: 3.9,
      cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N",
      location: "Line 167 in HTTP response headers",
      solution: "Added a strict Content Security Policy header to restrict resource loading."
    }
  ],
  diff: [
    {
      lineNumber: 1,
      originalLine: "function processUserInput(input) {",
      securedLine: "function processUserInput(input) {",
      changeType: "unchanged"
    },
    {
      lineNumber: 2,
      originalLine: "  const query = 'SELECT * FROM users WHERE username = \"' + input + '\"';",
      securedLine: "  const sanitizedInput = DOMPurify.sanitize(input);",
      changeType: "modified",
      explanation: "Added input sanitization to prevent XSS attacks"
    },
    {
      lineNumber: 3,
      originalLine: "",
      securedLine: "",
      changeType: "unchanged"
    },
    {
      lineNumber: 4,
      originalLine: "  const result = connection.query(query);",
      securedLine: "  const query = 'SELECT * FROM users WHERE username = ?';",
      changeType: "modified",
      explanation: "Changed query to use parameterized statement"
    },
    {
      lineNumber: 5,
      originalLine: "",
      securedLine: "  const stmt = connection.prepare(query);",
      changeType: "added",
      explanation: "Added query preparation step"
    },
    {
      lineNumber: 6,
      originalLine: "",
      securedLine: "  const result = stmt.get(sanitizedInput);",
      changeType: "added",
      explanation: "Used prepared statement with parameter binding"
    },
    {
      lineNumber: 7,
      originalLine: "  return result;",
      securedLine: "",
      changeType: "unchanged"
    },
    {
      lineNumber: 8,
      originalLine: "}",
      securedLine: "  return result;",
      changeType: "unchanged"
    },
    {
      lineNumber: 9,
      originalLine: "",
      securedLine: "}",
      changeType: "unchanged"
    }
  ]
};

export default function AegisChatBot() {
  const [prompt, setPrompt] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [secureCode, setSecureCode] = useState<string>('')
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [diff, setDiff] = useState<CodeDiff[]>([])
  const [expandedVulnerability, setExpandedVulnerability] = useState<number | null>(null)
  const [useSampleData, setUseSampleData] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showDiffView, setShowDiffView] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  
  // New state variables for filtering, sorting, and pagination
  const [severityFilter, setSeverityFilter] = useState<string[]>(['high', 'medium', 'low'])
  const [sortBy, setSortBy] = useState<'severity' | 'cvssScore'>('cvssScore')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  
  // Refs for synchronized scrolling
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const diffContainerRef = useRef<HTMLDivElement>(null);
  const fullScreenContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle full-screen mode body overflow
  useLayoutEffect(() => {
    if (isFullScreen) {
      // Prevent scrolling on the body when full-screen is active
      document.body.style.overflow = 'hidden';
      
      // Create full-screen container if it doesn't exist
      if (!fullScreenContainerRef.current) {
        const container = document.createElement('div');
        container.id = 'aegis-fullscreen-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.zIndex = '10000';
        container.style.backgroundColor = document.documentElement.classList.contains('dark') 
          ? '#09090b' // dark mode background
          : '#ffffff'; // light mode background
        container.style.overflow = 'hidden';
        
        document.body.appendChild(container);
        fullScreenContainerRef.current = container;
        
        // Force render the full-screen content
        renderFullScreenContent();
      }
    } else {
      // Restore body scrolling when exiting full-screen
      document.body.style.overflow = '';
      
      // Remove full-screen container if it exists
      if (fullScreenContainerRef.current) {
        document.body.removeChild(fullScreenContainerRef.current);
        fullScreenContainerRef.current = null;
      }
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = '';
      if (fullScreenContainerRef.current) {
        document.body.removeChild(fullScreenContainerRef.current);
        fullScreenContainerRef.current = null;
      }
    };
  }, [isFullScreen]);
  
  // Function to render full-screen content into the container
  const renderFullScreenContent = () => {
    if (!fullScreenContainerRef.current || !diff.length) return;
    
    const container = fullScreenContainerRef.current;
    
    // Add styles for tooltips to the container
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .aegis-tooltip {
        position: absolute;
        z-index: 50;
        max-width: 320px;
        width: max-content;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-family: ui-sans-serif, system-ui, sans-serif;
        font-size: 0.75rem;
        line-height: 1.25rem;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
        transform: translateY(-100%);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        background-color: rgb(255, 255, 255);
        color: rgb(17, 24, 39);
        border: 1px solid rgb(229, 231, 235);
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
        left: 0;
        text-align: left;
      }
      
      .dark .aegis-tooltip {
        background-color: rgb(31, 41, 55);
        color: rgb(229, 231, 235);
        border-color: rgb(55, 65, 81);
      }
      
      .aegis-tooltip-trigger:hover .aegis-tooltip {
        opacity: 1;
      }
      
      .aegis-info-icon {
        display: inline-flex;
        margin-left: 0.5rem;
        color: rgb(99, 102, 241); 
      }
      
      @media (prefers-color-scheme: dark) {
        .aegis-tooltip {
          background-color: rgb(31, 41, 55);
          color: rgb(229, 231, 235);
          border-color: rgb(55, 65, 81);
        }
      }
    `;
    container.appendChild(styleElement);
    
    // Create the content HTML
    const content = `
      <div class="w-full h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
        <div class="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-500" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M3 16v4h18v-4" />
              <path d="M3 8v4h18v-4" />
              <path d="M9 4l-2 2l2 2" />
              <path d="M15 20l2 -2l-2 -2" />
            </svg>
            <h3 class="text-lg font-medium text-zinc-800 dark:text-zinc-200">
              Code Comparison - Full Screen
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <button id="aegis-fullscreen-copy" class="flex items-center text-xs px-3 py-1.5 rounded bg-zinc-200/70 dark:bg-zinc-700/70 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
              <svg class="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
                <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
              </svg>
              <span>Copy Secure Code</span>
            </button>
            <button id="aegis-fullscreen-exit" class="flex items-center px-3 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 text-xs bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
              <svg class="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M15 19v-2a2 2 0 0 1 2 -2h2" />
                <path d="M15 5v2a2 2 0 0 0 2 2h2" />
                <path d="M5 15h2a2 2 0 0 1 2 2v2" />
                <path d="M5 9h2a2 2 0 0 0 2 -2v-2" />
              </svg>
              <span>Exit Full Screen</span>
            </button>
          </div>
        </div>
        
        <div class="flex-1 flex overflow-hidden">
          <div class="flex text-sm font-mono w-full h-full relative">
            <!-- Line numbers column -->
            <div class="sticky left-0 z-20 flex-none w-12 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
              ${diff.map((line, index) => `
                <div class="h-6 text-center text-xs text-zinc-500 dark:text-zinc-500 leading-6">
                  ${line.lineNumber}
                </div>
              `).join('')}
            </div>
            
            <!-- Code panels container -->
            <div class="flex w-full h-full">
              <!-- Original code panel (left side) -->
              <div id="aegis-fullscreen-left" class="w-1/2 overflow-auto border-r border-zinc-200 dark:border-zinc-800" style="scrollbar-width: thin;">
                ${diff.map((line, index) => {
                  const styles = getChangeTypeStylesForHTML(line.changeType);
                  return `
                    <div class="h-6 ${line.changeType === 'added' ? 'opacity-50' : ''} ${styles.bg} border-b border-zinc-100 dark:border-zinc-900">
                      <div class="flex whitespace-nowrap px-3">
                        <div class="w-4 flex-none flex justify-center ${styles.text} mr-1">
                          ${line.changeType === 'removed' ? styles.sign : ' '}
                        </div>
                        <code class="${styles.text}">${line.originalLine || ' '}</code>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
              
              <!-- Secure code panel (right side) -->
              <div id="aegis-fullscreen-right" class="w-1/2 overflow-auto" style="scrollbar-width: thin;">
                ${diff.map((line, index) => {
                  const styles = getChangeTypeStylesForHTML(line.changeType);
                  const hasExplanation = line.explanation && (line.changeType === 'added' || line.changeType === 'modified');
                  
                  return `
                    <div class="h-6 relative ${line.changeType === 'removed' ? 'opacity-50' : ''} ${styles.bg} border-b border-zinc-100 dark:border-zinc-900 ${hasExplanation ? 'aegis-tooltip-trigger' : ''}">
                      <div class="flex whitespace-nowrap px-3">
                        <div class="w-4 flex-none flex justify-center ${styles.text} mr-1">
                          ${line.changeType === 'added' || line.changeType === 'modified' ? styles.sign : ' '}
                        </div>
                        <code class="${styles.text}">
                          ${line.securedLine || ' '}
                          ${hasExplanation ? `
                            <span class="aegis-info-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                <path d="M12 8l.01 0" />
                                <path d="M11 12h1v4h1" />
                              </svg>
                            </span>
                          ` : ''}
                        </code>
                        ${hasExplanation ? `
                          <div class="aegis-tooltip">
                            ${line.explanation}
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Inject the content into the container
    container.innerHTML = content;
    
    // Add event listeners
    const exitButton = container.querySelector('#aegis-fullscreen-exit');
    if (exitButton) {
      exitButton.addEventListener('click', () => {
        setIsFullScreen(false);
      });
    }
    
    const copyButton = container.querySelector('#aegis-fullscreen-copy');
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(secureCode);
        copyButton.innerHTML = `
          <svg class="w-3.5 h-3.5 mr-1.5 text-emerald-500" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M5 12l5 5l10 -10" />
          </svg>
          <span>Copied!</span>
        `;
        setTimeout(() => {
          copyButton.innerHTML = `
            <svg class="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
              <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
            </svg>
            <span>Copy Secure Code</span>
          `;
        }, 2000);
      });
    }
  };
  
  // Helper function to convert style objects to HTML class strings
  const getChangeTypeStylesForHTML = (changeType: string) => {
    const styles = getChangeTypeStyles(changeType);
    return {
      bg: changeType === 'added' 
        ? 'bg-green-50 dark:bg-green-950/30' 
        : changeType === 'removed'
        ? 'bg-red-50 dark:bg-red-950/30'
        : changeType === 'modified'
        ? 'bg-yellow-50 dark:bg-yellow-950/30'
        : '',
      text: changeType === 'added'
        ? 'text-green-800 dark:text-green-300'
        : changeType === 'removed'
        ? 'text-red-800 dark:text-red-300'
        : changeType === 'modified'
        ? 'text-yellow-800 dark:text-yellow-300'
        : 'text-zinc-700 dark:text-zinc-300',
      sign: changeType === 'added'
        ? '+'
        : changeType === 'removed'
        ? '-'
        : changeType === 'modified'
        ? '~'
        : ' '
    };
  };
  
  // Remove synchronized scrolling from the regular view as well
  useEffect(() => {
    // This effect is now empty to disable synchronized scrolling
    return () => {};
  }, [showDiffView, diff]);
  
  // Add escape key handler for exiting full-screen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

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
      setDiff(result.diff || [])
    } catch (error) {
      console.error('Error generating secure code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10',
          border: 'border-red-500/20',
          text: 'text-zinc-600 dark:text-zinc-400',
          icon: 'text-red-500',
          badge: 'bg-red-500/10 border-red-500/30 text-red-500',
          title: 'text-red-800 dark:text-red-300 font-medium',
          highlight: 'bg-red-50 dark:bg-red-500/10'
        }
      case 'medium':
        return {
          bg: 'bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-orange-500/10',
          border: 'border-orange-500/20',
          text: 'text-zinc-600 dark:text-zinc-400',
          icon: 'text-orange-500',
          badge: 'bg-orange-500/10 border-orange-500/30 text-orange-500',
          title: 'text-orange-800 dark:text-orange-300 font-medium',
          highlight: 'bg-orange-50 dark:bg-orange-500/10'
        }
      case 'low':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-yellow-500/10',
          border: 'border-yellow-500/20',
          text: 'text-zinc-600 dark:text-zinc-400',
          icon: 'text-yellow-500',
          badge: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
          title: 'text-yellow-800 dark:text-yellow-300 font-medium',
          highlight: 'bg-yellow-50 dark:bg-yellow-500/10'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-zinc-500/10 via-zinc-500/5 to-zinc-500/10',
          border: 'border-zinc-500/20',
          text: 'text-zinc-600 dark:text-zinc-400',
          icon: 'text-zinc-500',
          badge: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-500',
          title: 'text-zinc-800 dark:text-zinc-300 font-medium',
          highlight: 'bg-zinc-50 dark:bg-zinc-500/10'
        }
    }
  }

  // Helper function to get color based on CVSS score
  const getCvssScoreColor = (score: number) => {
    if (score >= 9.0) return 'text-red-600 dark:text-red-400 font-bold';
    if (score >= 7.0) return 'text-red-500 dark:text-red-300';
    if (score >= 4.0) return 'text-orange-500 dark:text-orange-300';
    return 'text-yellow-500 dark:text-yellow-300';
  }
  
  // Helper function to get risk level based on CVSS score
  const getCvssRiskLevel = (score: number) => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    if (score >= 0.1) return 'Low';
    return 'None';
  }
  
  // Helper function to format CVSS vector for display
  const formatCvssVector = (vector: string) => {
    // Return the raw vector string if it doesn't follow expected format
    if (!vector.startsWith('CVSS:')) return vector;
    
    // Extract the version and metrics
    const parts = vector.split('/');
    const version = parts[0].split(':')[1];
    const metrics = parts.slice(1);
    
    return (
      <div className="flex flex-wrap gap-1">
        <span className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-[10px] font-mono">
          v{version}
        </span>
        {metrics.map((metric, idx) => {
          const [key, value] = metric.split(':');
          let bg = 'bg-zinc-100 dark:bg-zinc-800';
          let text = 'text-zinc-700 dark:text-zinc-300';
          
          // Highlight high-risk metrics
          if ((key === 'C' || key === 'I' || key === 'A') && value === 'H') {
            bg = 'bg-red-100 dark:bg-red-900/30';
            text = 'text-red-800 dark:text-red-300';
          }
          
          return (
            <span key={idx} className={`px-1.5 py-0.5 rounded-md ${bg} ${text} text-[10px] font-mono`}>
              {metric}
            </span>
          );
        })}
      </div>
    );
  }

  const getChangeTypeStyles = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return {
          bg: 'bg-green-50 dark:bg-green-950/30',
          border: 'border-green-200 dark:border-green-800/30',
          text: 'text-green-800 dark:text-green-300',
          indicator: 'bg-green-500',
          sign: '+'
        };
      case 'removed':
        return {
          bg: 'bg-red-50 dark:bg-red-950/30',
          border: 'border-red-200 dark:border-red-800/30',
          text: 'text-red-800 dark:text-red-300',
          indicator: 'bg-red-500',
          sign: '-'
        };
      case 'modified':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950/30',
          border: 'border-yellow-200 dark:border-yellow-800/30',
          text: 'text-yellow-800 dark:text-yellow-300',
          indicator: 'bg-yellow-500',
          sign: '~'
        };
      default:
        return {
          bg: '',
          border: '',
          text: 'text-zinc-700 dark:text-zinc-300',
          indicator: 'bg-transparent',
          sign: ' '
        };
    }
  };

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

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Enhance scrollToLine function to highlight the line
  const scrollToLine = (lineNumber: number) => {
    const editorElement = document.querySelector('textarea');
    if (!editorElement) return;
    
    // Get all lines in the editor
    const text = editorElement.value;
    const lines = text.split('\n');
    
    // Calculate position of the line
    let position = 0;
    let lineStartPosition = 0;
    
    for (let i = 0; i < Math.min(lineNumber - 1, lines.length - 1); i++) {
      position += lines[i].length + 1; // +1 for the newline character
    }
    
    lineStartPosition = position;
    
    // Calculate position of the end of the line
    if (lineNumber <= lines.length) {
      position += lines[lineNumber - 1].length;
    }
    
    // Focus the editor and select the whole line to highlight it
    editorElement.focus();
    editorElement.setSelectionRange(lineStartPosition, position);
    
    // Scroll to the line
    const lineHeight = 24; // Approximate line height in pixels
    const scrollTop = (lineNumber - 5) * lineHeight; // 5 lines above for context
    editorElement.scrollTop = Math.max(0, scrollTop);
    
    // Flash effect to highlight the line
    setTimeout(() => {
      editorElement.blur();
      setTimeout(() => {
        editorElement.focus();
        editorElement.setSelectionRange(lineStartPosition, position);
      }, 100);
    }, 100);
  }

  // Helper function to sort vulnerabilities
  const sortVulnerabilities = (vulns: Vulnerability[]) => {
    return [...vulns].sort((a, b) => {
      if (sortBy === 'severity') {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        const aValue = severityOrder[a.severity as keyof typeof severityOrder] || 0;
        const bValue = severityOrder[b.severity as keyof typeof severityOrder] || 0;
        return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
      } else {
        // Sort by CVSS score
        const aScore = a.cvssScore || 0;
        const bScore = b.cvssScore || 0;
        return sortDirection === 'desc' ? bScore - aScore : aScore - bScore;
      }
    });
  };
  
  // Helper function to filter vulnerabilities
  const filterVulnerabilities = (vulns: Vulnerability[]) => {
    return vulns.filter(v => severityFilter.includes(v.severity));
  };
  
  // Apply filters and sorting to get displayed vulnerabilities
  const getFilteredAndSortedVulnerabilities = () => {
    const filtered = filterVulnerabilities(vulnerabilities);
    return sortVulnerabilities(filtered);
  };
  
  // Get current page items
  const getCurrentPageItems = () => {
    const filteredAndSorted = getFilteredAndSortedVulnerabilities();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredAndSorted.slice(indexOfFirstItem, indexOfLastItem);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(getFilteredAndSortedVulnerabilities().length / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Toggle severity filter
  const toggleSeverityFilter = (severity: string) => {
    if (severityFilter.includes(severity)) {
      // If removing the last filter, don't allow it
      if (severityFilter.length === 1) return;
      setSeverityFilter(severityFilter.filter(s => s !== severity));
    } else {
      setSeverityFilter([...severityFilter, severity]);
    }
    // Reset to first page when filter changes
    setCurrentPage(1);
  };
  
  // Handle sort change
  const handleSortChange = (sortType: 'severity' | 'cvssScore') => {
    if (sortBy === sortType) {
      // Toggle direction if clicking the same sort option
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortType);
      setSortDirection('desc'); // Default to descending when changing sort type
    }
    // Reset to first page when sort changes
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl w-full mx-auto relative z-10 flex items-center space-x-4 rounded-sm flex-col bg-zinc-950/50 p-10 ring-1 ring-white/10 backdrop-blur-md">
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-100 flex items-center">
              <IconShield className="w-5 h-5 mr-2 text-indigo-500" />
              Vulnerabilities Detected
            </h3>
            <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
              {getFilteredAndSortedVulnerabilities().length} of {vulnerabilities.length} {vulnerabilities.length === 1 ? 'issue' : 'issues'} shown
            </div>
          </div>
          
          {/* Controls for filtering and sorting */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 self-center">Filter:</span>
              <button
                onClick={() => toggleSeverityFilter('high')}
                className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                  severityFilter.includes('high')
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${severityFilter.includes('high') ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                High
              </button>
              <button
                onClick={() => toggleSeverityFilter('medium')}
                className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                  severityFilter.includes('medium')
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${severityFilter.includes('medium') ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                Medium
              </button>
              <button
                onClick={() => toggleSeverityFilter('low')}
                className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                  severityFilter.includes('low')
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${severityFilter.includes('low') ? 'bg-yellow-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                Low
              </button>
            </div>
            
            <div className="flex-1" />
            
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 self-center">Sort by:</span>
              <button
                onClick={() => handleSortChange('severity')}
                className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                  sortBy === 'severity'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Severity
                {sortBy === 'severity' && (
                  sortDirection === 'desc' 
                    ? <IconChevronDown className="w-3 h-3" /> 
                    : <IconChevronUp className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => handleSortChange('cvssScore')}
                className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                  sortBy === 'cvssScore'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                CVSS Score
                {sortBy === 'cvssScore' && (
                  sortDirection === 'desc' 
                    ? <IconChevronDown className="w-3 h-3" /> 
                    : <IconChevronUp className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {getCurrentPageItems().length > 0 ? (
              getCurrentPageItems().map((vulnerability, index) => {
                const colors = getSeverityColor(vulnerability.severity);
                // Extract line number for scroll functionality
                const lineNumberMatch = vulnerability.location && vulnerability.location.match(/Line (\d+)/i);
                const lineNumber = lineNumberMatch ? parseInt(lineNumberMatch[1]) : null;
                const actualIndex = getFilteredAndSortedVulnerabilities().indexOf(vulnerability);
                
                return (
                  <div 
                    key={index}
                    className={`rounded-xl overflow-hidden shadow-md transition-all duration-200 ${
                      expandedVulnerability === actualIndex 
                        ? 'ring-1 ring-zinc-300/20 dark:ring-zinc-700/30' 
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <div 
                      className={`px-4 py-3 flex justify-between items-center cursor-pointer ${colors.bg} ${colors.border} border-b transition-colors duration-200`}
                      onClick={() => toggleVulnerability(actualIndex)}
                    >
                      <div className="flex items-center">
                        <IconBug className={`w-5 h-5 mr-3 ${colors.icon}`} />
                        <span className={`font-medium text-zinc-900 dark:text-zinc-50`}>
                          {vulnerability.description.split('.')[0]}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs uppercase font-semibold px-2.5 py-0.5 rounded-full border ${colors.badge}`}>
                          {vulnerability.severity}
                        </span>
                        {vulnerability.cvssScore && (
                          <span 
                            className={`text-xs font-mono px-2 py-0.5 rounded-full border ${vulnerability.cvssScore >= 9.0 ? 'border-red-500/30 bg-red-500/10 text-red-500 font-bold' : vulnerability.cvssScore >= 7.0 ? 'border-red-500/30 bg-red-500/10 text-red-500' : vulnerability.cvssScore >= 4.0 ? 'border-orange-500/30 bg-orange-500/10 text-orange-500' : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500'} relative group cursor-help`}
                            title="Common Vulnerability Scoring System"
                          >
                            {vulnerability.cvssScore.toFixed(1)}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-40 bg-white dark:bg-zinc-800 shadow-lg rounded-md p-2 text-xs text-left text-zinc-700 dark:text-zinc-300 invisible group-hover:visible z-10 border border-zinc-200 dark:border-zinc-700">
                              <div className="font-semibold mb-1 text-zinc-900 dark:text-zinc-100">CVSS Score: {vulnerability.cvssScore.toFixed(1)}</div>
                              <div>
                                <span className="font-medium">Risk: </span> 
                                {getCvssRiskLevel(vulnerability.cvssScore)}
                              </div>
                              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                Common Vulnerability Scoring System measures the severity of vulnerabilities
                              </div>
                            </div>
                          </span>
                        )}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          expandedVulnerability === actualIndex 
                            ? 'bg-indigo-500/10 text-indigo-500' 
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                        } transition-colors duration-200`}>
                          {expandedVulnerability === actualIndex ? (
                            <IconChevronUp className="w-4 h-4" />
                          ) : (
                            <IconChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {expandedVulnerability === actualIndex && (
                      <div className="bg-white dark:bg-zinc-900 p-4 text-zinc-800 dark:text-zinc-100 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center text-sm mb-2">
                              <IconAlertCircle className={`w-4 h-4 mr-2 ${colors.icon}`} />
                              <span className={colors.title}>Description</span>
                            </div>
                            <p className={`ml-6 ${colors.text}`}>
                              {vulnerability.description}
                            </p>
                          </div>
                          
                          {vulnerability.cvssScore && (
                            <div>
                              <div className="flex items-center text-sm mb-2">
                                <IconInfoCircle className={`w-4 h-4 mr-2 ${colors.icon}`} />
                                <span className={colors.title}>CVSS Score</span>
                              </div>
                              <div className="ml-6 flex flex-col space-y-2">
                                <div className="flex items-center">
                                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 mr-2">
                                    <div 
                                      className="h-2.5 rounded-full" 
                                      style={{
                                        width: `${vulnerability.cvssScore * 10}%`,
                                        background: `linear-gradient(90deg, ${
                                          vulnerability.cvssScore >= 7.0 ? '#ef4444' : 
                                          vulnerability.cvssScore >= 4.0 ? '#f97316' : '#eab308'
                                        } 0%, ${
                                          vulnerability.cvssScore >= 7.0 ? '#dc2626' : 
                                          vulnerability.cvssScore >= 4.0 ? '#ea580c' : '#ca8a04'
                                        } 100%)`
                                      }}
                                    />
                                  </div>
                                  <span className={`text-sm font-semibold ${getCvssScoreColor(vulnerability.cvssScore)}`}>
                                    {vulnerability.cvssScore.toFixed(1)}
                                  </span>
                                  <span className="text-xs ml-1.5 text-zinc-500 dark:text-zinc-400">
                                    ({getCvssRiskLevel(vulnerability.cvssScore)})
                                  </span>
                                </div>
                                {vulnerability.cvssVector && (
                                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                    {formatCvssVector(vulnerability.cvssVector)}
                                    <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-md text-[10px] border border-zinc-200 dark:border-zinc-700/50">
                                      <div className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">Vector Explanation:</div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                        {vulnerability.cvssVector.split('/').slice(1).map((metric, idx) => {
                                          const [key, value] = metric.split(':');
                                          let explanation = '';
                                          
                                          // Base metric explanations
                                          switch(key) {
                                            case 'AV': // Attack Vector
                                              explanation = {
                                                'N': 'Network - Remotely exploitable',
                                                'A': 'Adjacent - Exploitable from adjacent network',
                                                'L': 'Local - Requires local access',
                                                'P': 'Physical - Requires physical access'
                                              }[value] || '';
                                              break;
                                            case 'AC': // Attack Complexity
                                              explanation = {
                                                'L': 'Low - Easily exploitable',
                                                'H': 'High - Requires specialized conditions'
                                              }[value] || '';
                                              break;
                                            case 'PR': // Privileges Required
                                              explanation = {
                                                'N': 'None - No privileges needed',
                                                'L': 'Low - Basic privileges required',
                                                'H': 'High - Administrative privileges required'
                                              }[value] || '';
                                              break;
                                            case 'UI': // User Interaction
                                              explanation = {
                                                'N': 'None - No user interaction required',
                                                'R': 'Required - User interaction needed'
                                              }[value] || '';
                                              break;
                                            case 'S': // Scope
                                              explanation = {
                                                'U': 'Unchanged - Affects only the vulnerable component',
                                                'C': 'Changed - Can affect resources beyond the vulnerable component'
                                              }[value] || '';
                                              break;
                                            case 'C': // Confidentiality
                                              explanation = {
                                                'N': 'None - No impact on confidentiality',
                                                'L': 'Low - Limited information disclosure',
                                                'H': 'High - Total information disclosure'
                                              }[value] || '';
                                              break;
                                            case 'I': // Integrity
                                              explanation = {
                                                'N': 'None - No impact on integrity',
                                                'L': 'Low - Limited modification possible',
                                                'H': 'High - Complete system compromise'
                                              }[value] || '';
                                              break;
                                            case 'A': // Availability
                                              explanation = {
                                                'N': 'None - No impact on availability',
                                                'L': 'Low - Reduced performance',
                                                'H': 'High - Complete resource unavailability'
                                              }[value] || '';
                                              break;
                                          }
                                          
                                          if (!explanation) return null;
                                          
                                          return (
                                            <div key={idx} className="flex">
                                              <span className="font-mono font-medium">{metric}</span>
                                              <span className="mx-1">-</span>
                                              <span>{explanation}</span>
                                            </div>
                                          );
                                        }).filter(Boolean)}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {vulnerability.location && (
                            <div>
                              <div className="flex items-center text-sm mb-2">
                                <IconMapPin className={`w-4 h-4 mr-2 ${colors.icon}`} />
                                <span className={colors.title}>Location</span>
                              </div>
                              <div 
                                className={`ml-6 px-3 py-2 rounded group cursor-pointer ${colors.highlight} border border-zinc-200 dark:border-zinc-700/50 font-mono text-xs text-zinc-800 dark:text-zinc-200 flex items-center space-x-1 hover:shadow-md transition-shadow`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (lineNumber) scrollToLine(lineNumber);
                                }}
                                title={lineNumber ? `Click to highlight line ${lineNumber} in the code editor` : ''}
                              >
                                <IconCode size={14} className={`${colors.icon} flex-shrink-0`} />
                                <div className="flex-1">
                                  {lineNumber ? (
                                    <>
                                      <span>
                                        {vulnerability.location.split('Line ')[0]}Line 
                                      </span>
                                      <span className="font-bold underline decoration-dotted underline-offset-2">
                                        {lineNumber}
                                      </span>
                                      <span>
                                        {vulnerability.location.split(`Line ${lineNumber}`)[1]}
                                      </span>
                                    </>
                                  ) : (
                                    vulnerability.location
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {vulnerability.solution && (
                            <div>
                              <div className="flex items-center text-sm mb-2">
                                <IconTools className="w-4 h-4 mr-2 text-emerald-500" />
                                <span className="text-emerald-800 dark:text-emerald-300 font-medium">Solution</span>
                              </div>
                              <p className="ml-6 text-emerald-600/80 dark:text-emerald-400/90">
                                {vulnerability.solution}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <IconAlertTriangle className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-500 mb-2" />
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {vulnerabilities.length > 0 
                    ? 'No vulnerabilities match the current filters.' 
                    : 'No vulnerabilities were found in this code.'}
                </p>
                {vulnerabilities.length > 0 && (
                  <button 
                    onClick={() => setSeverityFilter(['high', 'medium', 'low'])}
                    className="mt-3 px-3 py-1.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-2 shadow-sm">
              <div className="flex items-center mb-2 sm:mb-0">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-2">Items per page:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="text-xs rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-1.5 py-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <nav className="flex items-center space-x-1">
                <button 
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs ${
                      currentPage === number
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}

      {secureCode && (
        <div className="mt-6 w-full overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 flex items-center">
                Generated Secure Code
              </h3>
              <div className="flex items-center gap-2">
                {diff.length > 0 && (
                  <button
                    onClick={() => setShowDiffView(!showDiffView)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
                  >
                    {showDiffView ? (
                      <>
                        <IconCode className="w-3.5 h-3.5" />
                        <span>Show Clean View</span>
                      </>
                    ) : (
                      <>
                        <IconColumns className="w-3.5 h-3.5" />
                        <span>Show Diff View</span>
                      </>
                    )}
                  </button>
                )}
                {showDiffView && (
                  <button
                    onClick={toggleFullScreen}
                    className="flex items-center space-x-1 px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <IconMaximize className="w-3.5 h-3.5" />
                    <span>Full Screen</span>
                  </button>
                )}
              </div>
            </div>

            {!showDiffView ? (
              <div className="max-h-[400px] overflow-auto rounded-lg shadow-lg ring-1 ring-zinc-400/10 dark:ring-zinc-700/30">
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
            ) : (
              <div className="max-h-[500px] overflow-hidden rounded-lg shadow-lg ring-1 ring-zinc-400/10 dark:ring-zinc-700/30 transition-all duration-300" ref={diffContainerRef}>
                <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 border-b border-zinc-300/70 dark:border-zinc-700/80">
                  <div className="flex items-center">
                    <IconExchange className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Code Comparison</span>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center text-xs px-2 py-1 rounded bg-zinc-200/70 dark:bg-zinc-700/70 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <IconCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                        <span>Copied Secure Code</span>
                      </>
                    ) : (
                      <>
                        <IconCopy className="w-3.5 h-3.5 mr-1" />
                        <span>Copy Secure Code</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="flex text-xs font-medium border-b border-zinc-200 dark:border-zinc-800">
                  <div className="w-1/2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-700">
                    Original Code
                  </div>
                  <div className="w-1/2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    Secure Code
                  </div>
                </div>
                
                <div className="font-mono text-sm relative overflow-hidden h-[400px]">
                  {/* Fixed center divider line */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-200 dark:bg-zinc-800 transform -translate-x-[0.5px] z-10"></div>
                  
                  {/* Line numbers column and original code panel */}
                  <div className="flex h-full">
                    <div className="sticky left-0 z-20 flex-none w-10 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
                      {diff.map((line, index) => (
                        <div key={`line-${index}`} className="h-6 text-center text-xs text-zinc-500 dark:text-zinc-500 leading-6">
                          {line.lineNumber}
                        </div>
                      ))}
                    </div>
                    
                    {/* Scrollable code content */}
                    <div className="flex overflow-x-auto w-full">
                      {/* Original code panel (left side) */}
                      <div 
                        ref={leftPanelRef}
                        className="w-1/2 overflow-x-auto"
                      >
                        {diff.map((line, index) => {
                          const styles = getChangeTypeStyles(line.changeType);
                          return (
                            <div 
                              key={`left-${index}`} 
                              className={`h-6 ${line.changeType === 'added' ? 'opacity-50' : ''} ${styles.bg} border-b border-zinc-100 dark:border-zinc-900`}
                            >
                              <div className="flex whitespace-nowrap">
                                <div className={`w-5 flex-none flex justify-center ${styles.text}`}>
                                  {line.changeType === 'removed' ? styles.sign : ' '}
                                </div>
                                <pre className={`py-0 overflow-visible ${styles.text}`}>
                                  <code>{line.originalLine || ' '}</code>
                                </pre>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Secure code panel (right side) */}
                      <div 
                        ref={rightPanelRef}
                        className="w-1/2 overflow-x-auto pl-[10px]"
                      >
                        {diff.map((line, index) => {
                          const styles = getChangeTypeStyles(line.changeType);
                          const hasExplanation = line.explanation && (line.changeType === 'added' || line.changeType === 'modified');
                          
                          return (
                            <div 
                              key={`right-${index}`} 
                              className={`h-6 ${line.changeType === 'removed' ? 'opacity-50' : ''} ${styles.bg} border-b border-zinc-100 dark:border-zinc-900 relative group`}
                            >
                              <div className="flex whitespace-nowrap">
                                <div className={`w-5 flex-none flex justify-center ${styles.text}`}>
                                  {line.changeType === 'added' || line.changeType === 'modified' ? styles.sign : ' '}
                                </div>
                                <pre className={`py-0 overflow-visible ${styles.text}`}>
                                  <code>
                                    {line.securedLine || ' '}
                                    {hasExplanation && (
                                      <span className="inline-flex ml-1 text-indigo-500 dark:text-indigo-400">
                                        <IconInfoCircle size={14} className="inline" />
                                      </span>
                                    )}
                                  </code>
                                </pre>
                                
                                {hasExplanation && (
                                  <div className="absolute left-0 -top-12 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs p-2 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 max-w-[250px] whitespace-normal break-words">
                                    {line.explanation}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

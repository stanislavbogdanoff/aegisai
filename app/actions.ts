'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL,
})

export type Vulnerability = {
  description: string
  severity: 'high' | 'medium' | 'low'
  location?: string
  solution?: string
  cvssScore?: number
  cvssVector?: string
}

export type CodeQualityRecommendation = {
  description: string
  category: 'performance' | 'maintainability' | 'best-practice' | 'style'
  priority: 'high' | 'medium' | 'low'
  location?: string
  suggestion?: string
  impact?: string
}

export type CodeDiff = {
  lineNumber: number
  originalLine: string
  securedLine: string
  changeType: 'added' | 'removed' | 'modified' | 'unchanged'
  explanation?: string
  qualityImprovement?: boolean
}

export type SecureCodeResponse = {
  secureCode: string
  vulnerabilities: Vulnerability[]
  qualityRecommendations: CodeQualityRecommendation[]
  diff?: CodeDiff[]
}

export async function generateSecureCode(prompt: string): Promise<SecureCodeResponse> {
  try {
    // Check if the input is in array format and extract the code
    let codeToAnalyze = prompt;
    try {
      // If the prompt is a JSON array, extract the first element (the code)
      const parsedInput = JSON.parse(prompt);
      if (Array.isArray(parsedInput) && parsedInput.length > 0) {
        codeToAnalyze = parsedInput[0];
        console.log('Extracted code from array input');
      }
    } catch (e) {
      // Not JSON, use the prompt as-is
      console.log('Using raw prompt input');
    }
    
    // Helper function to validate and normalize vulnerability data
    const validateVulnerability = (vulnerability: Vulnerability): Vulnerability => {
      // Ensure severity is valid
      if (!['high', 'medium', 'low'].includes(vulnerability.severity)) {
        vulnerability.severity = 'medium';
      }
      
      // Ensure CVSS score is valid
      if (vulnerability.cvssScore) {
        const score = Number(vulnerability.cvssScore);
        vulnerability.cvssScore = isNaN(score) ? 5.0 : Math.min(Math.max(score, 0), 10);
      }
      
      // Ensure CVSS vector is valid
      if (vulnerability.cvssVector && !vulnerability.cvssVector.startsWith('CVSS:')) {
        vulnerability.cvssVector = `CVSS:3.1/${vulnerability.cvssVector}`;
      }
      
      return vulnerability;
    };
    const systemPrompt2 = `You are an expert in secure software development and cybersecurity.
            Your job is to analyze code for security vulnerabilities and code quality issues, fix them, and provide explanations.
            Format your response as a JSON object with secureCode, vulnerabilities, qualityRecommendations, and diff fields.`
    const systemPrompt = `
            You are an expert in secure software development and cybersecurity.
            
            Your job is to analyze code for security vulnerabilities and code quality issues, fix them, and provide explanations.
            Follow these rules strictly:
            
            1. If the user provides insecure code:
               a. Identify all security vulnerabilities
               b. Generate a fixed, secure version
               c. For each vulnerability, explain:
                  - Description of the vulnerability
                  - Severity level (high/medium/low)
                  - CVSS score (on a scale of 0.0-10.0) for precise severity rating
                  - CVSS vector string (abbreviated format) for vulnerability categorization
                  - Where it occurs in the code (line numbers or function names)
                  - How your fix addresses the vulnerability
               d. Provide a line-by-line comparison (diff) between the original and secure code

            2. Identify code quality issues beyond security, including:
               a. Performance concerns (inefficient algorithms, unnecessary operations)
               b. Maintainability issues (poor structure, naming, duplicated code)
               c. Best practice violations (not following conventions, antipatterns)
               d. Style/readability problems
               e. For each issue, explain:
                  - Description of the quality issue
                  - Category (performance/maintainability/best-practice/style)
                  - Priority level (high/medium/low)
                  - Where it occurs in the code
                  - Suggested improvement
                  - What impact the improvement would have
               f. Mark quality-related changes in the diff with qualityImprovement=true
            
            3. If the code is already secure and has good quality, just return that it's secure and well-written.
            4. If no code is provided, ask for code to analyze.

            IMPORTANT: Do NOT add explanatory comments in the secure code. Focus only on fixing the issues without adding comments that explain what was changed.
            
            Format your response as JSON with the following structure:
            {
              "secureCode": "fixed code here (without explanatory comments)",
              "vulnerabilities": [
                {
                  "description": "detailed description of vulnerability",
                  "severity": "high/medium/low",
                  "cvssScore": 8.5,
                  "cvssVector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
                  "location": "where it occurs",
                  "solution": "how it was fixed"
                },
                // more vulnerabilities...
              ],
              "qualityRecommendations": [
                {
                  "description": "quality recommendation description",
                  "category": "performance/maintainability/best-practice/style",
                  "priority": "high/medium/low",
                  "location": "where it occurs",
                  "suggestion": "suggested improvement",
                  "impact": "brief description of impact"
                },
                // more quality recommendations...
              ],
              "diff": [
                {
                  "lineNumber": 1,
                  "originalLine": "original code for this line",
                  "securedLine": "secure version of this line",
                  "changeType": "added/removed/modified/unchanged",
                  "explanation": "brief explanation of why this line was changed (only for modified lines)",
                  "qualityImprovement": true
                },
                // more diff entries...
              ]
            }
            
            If the code is already secure and has good quality, return:
            {
              "secureCode": "✅ The code is already secure and well-written.",
              "vulnerabilities": [],
              "qualityRecommendations": [],
              "diff": []
            }
            
            If no code is provided, return:
            {
              "secureCode": "⚠️ Please provide the code you'd like me to analyze.",
              "vulnerabilities": [],
              "qualityRecommendations": [],
              "diff": []
            }
            
            For generating the diff:
            1. Include ALL lines, even unchanged ones
            2. Set changeType to "unchanged" for lines that haven't been modified
            3. Set changeType to "added" for completely new lines
            4. Set changeType to "removed" for lines that were removed
            5. Set changeType to "modified" for lines that were changed
            6. Only provide an explanation for modified lines
            7. Make sure lineNumber matches the line's position in the original code
            8. For added lines, use the line number where they were inserted
            9. For removed lines, use the line number where they were in the original code
            10. Do NOT add comments to the code in either the secureCode or diff sections
            11. Set qualityImprovement=true for changes that fix code quality (not security)
            
            For CVSS scores:
            1. Use CVSS v3.1 when possible
            2. Provide the numerical score (0.0-10.0) based on the standard calculation
            3. Provide the vector string in the compact format
            4. Ensure scores align with the severity rating (high/medium/low)
            5. For high severity: 7.0-10.0
            6. For medium severity: 4.0-6.9
            7. For low severity: 0.1-3.9
            `
    const userPrompt = `Please analyze and secure the following code:\n\n${codeToAnalyze}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    })

    // Check if completion and choices exist before accessing
    if (!completion || !completion.choices || !completion.choices.length) {
      console.error('Incomplete API response:', completion)
      return {
        secureCode: '⚠️ Received an incomplete response from OpenAI. Please try again.',
        vulnerabilities: [],
        qualityRecommendations: [],
        diff: []
      }
    }

    const message = completion.choices[0].message?.content || ''
    
    try {
      const parsedResponse = JSON.parse(message) as SecureCodeResponse
      
      // Validate response structure and provide defaults for missing fields
      const validatedResponse: SecureCodeResponse = {
        secureCode: parsedResponse.secureCode || '⚠️ No secure code was generated.',
        vulnerabilities: Array.isArray(parsedResponse.vulnerabilities) 
          ? parsedResponse.vulnerabilities.map(v => validateVulnerability(v))
          : [],
        qualityRecommendations: Array.isArray(parsedResponse.qualityRecommendations) 
          ? parsedResponse.qualityRecommendations 
          : [],
        diff: Array.isArray(parsedResponse.diff) 
          ? parsedResponse.diff 
          : []
      }
      
      console.log('Validated response:', validatedResponse)
      return validatedResponse
    } catch (parseError) {
      console.error('Failed to parse response:', parseError)
      console.error('Raw response content:', message)
      return {
        secureCode: '⚠️ Failed to parse model response. Please try again.',
        vulnerabilities: [],
        qualityRecommendations: [],
        diff: []
      }
    }
  } catch (err) {
    console.error('API Error:', err)
    
    // Try to provide a more specific error message
    let errorMessage = '⚠️ Failed to generate secure code. Please try again later.';
    
    // Check for specific AIMLAPI error structure
    if (err && typeof err === 'object' && 'statusCode' in err) {
      const apiError = err as any;
      
      if (apiError.statusCode === 403) {
        if (apiError.meta?.detail?.reason === 'insufficent_resource') {
          errorMessage = '⚠️ API rate limit exceeded. The free tier is limited to 10 requests per hour. Please wait or upgrade your plan.';
        } else {
          errorMessage = '⚠️ API authentication error. Please check your AIMLAPI key.';
        }
      }
    } else if (err instanceof Error) {
      // Check if it's a rate limit or quota error
      if (err.message.includes('rate limit') || err.message.includes('quota')) {
        errorMessage = '⚠️ API rate limit exceeded. Please try again in a few minutes.';
      } 
      // Check if it's an auth error
      else if (err.message.includes('auth') || err.message.includes('key')) {
        errorMessage = '⚠️ API authentication error. Please check your OpenAI API key.';
      }
      // Check if it's a timeout error
      else if (err.message.includes('timeout')) {
        errorMessage = '⚠️ Request timed out. Please try with a smaller code sample.';
      }
    }
    
    return {
      secureCode: errorMessage,
      vulnerabilities: [],
      qualityRecommendations: [],
      diff: []
    }
  }
}

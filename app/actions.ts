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
}

export type CodeDiff = {
  lineNumber: number
  originalLine: string
  securedLine: string
  changeType: 'added' | 'removed' | 'modified' | 'unchanged'
  explanation?: string
}

export type SecureCodeResponse = {
  secureCode: string
  vulnerabilities: Vulnerability[]
  diff?: CodeDiff[]
}

export async function generateSecureCode(prompt: string): Promise<SecureCodeResponse> {
  try {
    const systemPrompt = `
            You are an expert in secure software development and cybersecurity.
            
            Your job is to analyze code for security vulnerabilities, fix them, and provide explanations.
            Follow these rules strictly:
            
            1. If the user provides insecure code:
               a. Identify all security vulnerabilities
               b. Generate a fixed, secure version
               c. For each vulnerability, explain:
                  - Description of the vulnerability
                  - Severity level (high/medium/low)
                  - Where it occurs in the code (line numbers or function names)
                  - How your fix addresses the vulnerability
               d. Provide a line-by-line comparison (diff) between the original and secure code
            
            2. If the code is already secure, just return that it's secure.
            3. If no code is provided, ask for code to analyze.

            IMPORTANT: Do NOT add explanatory comments in the secure code. Focus only on fixing the issues without adding comments that explain what was changed.
            
            Format your response as JSON with the following structure:
            {
              "secureCode": "fixed code here (without explanatory comments)",
              "vulnerabilities": [
                {
                  "description": "detailed description of vulnerability",
                  "severity": "high/medium/low",
                  "location": "where it occurs",
                  "solution": "how it was fixed"
                },
                // more vulnerabilities...
              ],
              "diff": [
                {
                  "lineNumber": 1,
                  "originalLine": "original code for this line",
                  "securedLine": "secure version of this line",
                  "changeType": "added/removed/modified/unchanged",
                  "explanation": "brief explanation of why this line was changed (only for modified lines)"
                },
                // more diff entries...
              ]
            }
            
            If the code is already secure, return:
            {
              "secureCode": "✅ The code is already secure.",
              "vulnerabilities": [],
              "diff": []
            }
            
            If no code is provided, return:
            {
              "secureCode": "⚠️ Please provide the code you'd like me to secure.",
              "vulnerabilities": [],
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
            `
    const userPrompt = `Please analyze and secure the following code:\n\n${prompt}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    })

    const message = completion.choices[0].message?.content || ''
    
    try {
      const parsedResponse = JSON.parse(message) as SecureCodeResponse
      console.log(parsedResponse)
      return parsedResponse
    } catch (parseError) {
      console.error('Failed to parse response:', parseError)
      return {
        secureCode: '⚠️ Failed to parse model response. Please try again.',
        vulnerabilities: [],
        diff: []
      }
    }
  } catch (err) {
    console.error(err)
    return {
      secureCode: '⚠️ Failed to generate secure code. Please try again later.',
      vulnerabilities: [],
      diff: []
    }
  }
}

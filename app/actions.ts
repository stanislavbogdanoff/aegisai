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

export type SecureCodeResponse = {
  secureCode: string
  vulnerabilities: Vulnerability[]
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
            
            2. If the code is already secure, just return that it's secure.
            3. If no code is provided, ask for code to analyze.
            
            Format your response as JSON with the following structure:
            {
              "secureCode": "fixed code here",
              "vulnerabilities": [
                {
                  "description": "detailed description of vulnerability",
                  "severity": "high/medium/low",
                  "location": "where it occurs",
                  "solution": "how it was fixed"
                },
                // more vulnerabilities...
              ]
            }
            
            If the code is already secure, return:
            {
              "secureCode": "✅ The code is already secure.",
              "vulnerabilities": []
            }
            
            If no code is provided, return:
            {
              "secureCode": "⚠️ Please provide the code you'd like me to secure.",
              "vulnerabilities": []
            }
            `
    const userPrompt = `Please analyze and secure the following code:\n\n${prompt}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
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
        vulnerabilities: []
      }
    }
  } catch (err) {
    console.error(err)
    return {
      secureCode: '⚠️ Failed to generate secure code. Please try again later.',
      vulnerabilities: []
    }
  }
}

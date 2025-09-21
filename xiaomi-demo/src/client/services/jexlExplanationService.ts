import { getApiBasePath } from '@/client/lib/paths';

export interface JEXLExplanationRequest {
  expression: string;
  language?: string;
}

export interface JEXLExplanationResponse {
  errcode: string;
  message?: string;
  traceId?: string;
  errorMsgArray?: string[];
  data: {
    expression: string;
    valid: boolean;
    explanation: string;
  };
}

export const explainJEXLExpression = async (request: JEXLExplanationRequest): Promise<JEXLExplanationResponse['data']> => {
  try {
    const response = await fetch(getApiBasePath('/api/ai/rules/jexl/explain'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression: request.expression,
        language: request.language || 'en-US'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: JEXLExplanationResponse = await response.json();

    if (result.errcode !== '200' && result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    return result.data;
  } catch (error) {
    console.error('JEXL explanation failed:', error);
    throw error;
  }
};
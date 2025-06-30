export interface SurveyParamsRequest {
    status: 'open' | 'closed';
    visibility: 'public' | 'private';
    expirationDate: string;   // ISO
}

export interface SubmissionSurveyRequest {
    surveyId: string;
    answers:  Record<number, number[]>;      // Map<int, int[]>
}

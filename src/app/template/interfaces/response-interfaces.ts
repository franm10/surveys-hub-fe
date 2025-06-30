export interface ApiResponse<T = any> {
    status: string,
    message: string | null,
    data: T | null
}

export interface SurveyResponse {
    id: string;

    title: string;
    description: string;
    numberOfQuestions: number;

    questions: QuestionResponse[]; //TODO: check if deleted

    status: string;
    expirationDate: string;

    visibility: string;

    createdAt: string;
    createdBy: string;

    invitedToken: string;
    approvalRequired: boolean;
    pendingApprovalEmails: string[];

    invitedEmails: string[];
}

export interface QuestionResponse {
    surveyId: string;
    numSequence: number;

    text: string;
    allowMultipleAnswers: boolean;
    questionChoices: {
        numSequence: number;
        text: string;
        imageUrl: string;
    }[];

    imageUrl: string;
}

export interface SubmissionSurveyResponse {
    submittedBy: string;
    submittedByEmail: string;
    submittedAt: string;

    surveyId: string;

    answers: Record<number, number[]>; // Map<Integer, Set<Integer>> → Record<number, number[]>
}

export interface SubmissionSurveyCompleteResponse {
    submittedBy: string;
    submittedByEmail: string;
    submittedAt: string; // Instant → ISO string

    surveyId: string;

    answers: QuestionResponse[];
}

export interface StatsResponse {
    id: string;

    totalSubmitted: number;
    firstSubmitted: string;
    lastSubmitted: string;

    questionsStats: QuestionStatsResponse[];
}

export interface QuestionStatsResponse {
    numSequence: number;
    text: string;
    allowMultipleAnswers: boolean;
    imageUrl: string;
    choices: QuestionChoiceStatsResponse[];
}

export interface QuestionChoiceStatsResponse {
    numSequence: number;
    text: string;
    imageUrl: string;

    count: number;
}



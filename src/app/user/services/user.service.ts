import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.dev';
import {
    ApiResponse, QuestionResponse, StatsResponse, SubmissionSurveyCompleteResponse, SubmissionSurveyResponse,
    SurveyResponse
} from '../../template/interfaces/response-interfaces';
import {SurveyParamsRequest} from '../../template/interfaces/request-interfaces';

@Injectable({ providedIn: 'root' })
export class UserService {

    private readonly base = environment.apiUrl;

    constructor(
        private http: HttpClient
    ) { }

    /** *************** OWNER API START *************** */

    createSurvey(body: any): Observable<ApiResponse<SurveyResponse | null>> {
        return this.http.post<ApiResponse<SurveyResponse | null>>(
            `${this.base}/user/my-surveys/create`,
            body
        );
    }

    updateSurveySettings(surveyId: string, params: SurveyParamsRequest): Observable<ApiResponse<SurveyResponse | null>> {
        return this.http.patch<ApiResponse<SurveyResponse | null>>(
            `${this.base}/user/my-surveys/${surveyId}/settings`,
            params
        );
    }

    getSurveyByOwner(surveyId: string): Observable<ApiResponse<SurveyResponse>> {
        return this.http.get<ApiResponse<SurveyResponse>>(
            `${this.base}/user/my-surveys/survey`,
            { params: { id: surveyId } }
        );
    }

    invalidateToken(surveyId: string): Observable<ApiResponse<unknown>> {
        return this.http.delete<ApiResponse<unknown>>(
            `${this.base}/user/my-surveys/${surveyId}/token/invalidate`
        );
    }

    generateToken(surveyId: string, approvalRequired: boolean): Observable<ApiResponse<SurveyResponse>> {
        return this.http.put<ApiResponse<SurveyResponse>>(
            `${this.base}/user/my-surveys/${surveyId}/token/generate`,
            null,
            { params: { approvalRequired: String(approvalRequired) } }
        );
    }

    updateApprovalRequired(surveyId: string, approvalRequired: boolean): Observable<ApiResponse<unknown>> {
        return this.http.patch<ApiResponse<unknown>>(
            `${this.base}/user/my-surveys/${surveyId}/token`,
            null,
            { params: { approvalRequired: String(approvalRequired) } }
        );
    }

    acceptAllPendingEmails(surveyId: string): Observable<ApiResponse<unknown>> {
        return this.http.patch<ApiResponse<unknown>>(
            `${this.base}/user/my-surveys/${surveyId}/token/accept-pending-requests`,
            null
        );
    }

    updateInvitedEmails(surveyId: string, emails: string[]): Observable<ApiResponse<{ success: string[]; failed?: string[] }>> {
        return this.http.post<ApiResponse<{ success: string[]; failed?: string[] }>>(
            `${this.base}/user/my-surveys/${surveyId}/update-invited-emails`,
            emails
        );
    }

    addInvitedEmails(surveyId: string, emails: string[]): Observable<ApiResponse<{ added: string[]; failed?: string[] }>> {
        return this.http.post<ApiResponse<{ added: string[]; failed?: string[] }>>(
            `${this.base}/user/my-surveys/${surveyId}/add-invited-emails`,
            emails
        );
    }

    removeInvitedEmails(surveyId: string, emails: string[]): Observable<ApiResponse<{ removed: string[]; failed?: string[] }>> {
        return this.http.request<ApiResponse<{ removed: string[]; failed?: string[] }>>(
            'delete',
            `${this.base}/user/my-surveys/${surveyId}/remove-invited-emails`,
            { body: emails }
        );
    }

    getMySurveys(): Observable<ApiResponse<SurveyResponse[]>> {
        return this.http.get<ApiResponse<SurveyResponse[]>>( `${this.base}/user/my-surveys/all-by-owner` );
    }

    getParticipatedUserListFromSurvey(surveyId: string): Observable<ApiResponse<string[]>> {
        return this.http.get<ApiResponse<string[]>>( `${this.base}/user/surveys/${surveyId}/submitted/users-list`);
    }
    /** *************** OWNER API END *************** */


    /** *************** USER API START *************** */

    submitInviteToken(token: string): Observable<ApiResponse<SurveyResponse | null>> {
        const params = new HttpParams().set('token', token);
        return this.http.post<ApiResponse<SurveyResponse | null>>( `${this.base}/user/surveys/invite`, null, {params} );
    }

    getAllSurveysWhenUserInvited(): Observable<ApiResponse<SurveyResponse[]>> {
        return this.http.get<ApiResponse<SurveyResponse[]>>( `${this.base}/user/surveys/invite/get-all` );
    }

    getAllOpenSurveysWhenUserInvited(): Observable<ApiResponse<SurveyResponse[]>> {
        return this.http.get<ApiResponse<SurveyResponse[]>>( `${this.base}/user/surveys/invite/get-all-open` );
    }

    submitSurvey(body: { surveyId: string; answers: Record<number, number[]>; }): Observable<ApiResponse<SubmissionSurveyResponse>> {
        return this.http.post<ApiResponse<SubmissionSurveyResponse>>(`${this.base}/user/surveys/submit`, body);
    }

    getAllSubmissionSurveysList(): Observable<ApiResponse<String[]>> {
        return this.http.get<ApiResponse<String[]>>( `${this.base}/user/surveys/submitted-by-user` );
    }

    getSubmissionSurvey( surveyId: string ): Observable<ApiResponse<SubmissionSurveyCompleteResponse>> {
        return this.http.get<ApiResponse<SubmissionSurveyCompleteResponse>>( `${this.base}/user/surveys/${surveyId}/submitted/complete` );
    }

    /** *************** USER API END *************** */


    /** *************** COMMON API START *************** */

    getAllQuestionsFromSurvey(surveyId: string): Observable<ApiResponse<QuestionResponse[]>> {
        const params = new HttpParams().set('survey', surveyId);
        return this.http.get<ApiResponse<QuestionResponse[]>>( `${this.base}/user/questions`, {params} );
    }

    getAllStatsFromSurvey(surveyId: string): Observable<ApiResponse<StatsResponse>> {
        const params = new HttpParams().set('survey', surveyId);
        return this.http.get<ApiResponse<StatsResponse>>( `${this.base}/user/stats`, {params} );
    }

    /** *************** COMMON API END *************** */

}
